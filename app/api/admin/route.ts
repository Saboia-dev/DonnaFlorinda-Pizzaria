import { z } from "zod";
import {
  catalog,
  db,
  json,
  failure,
  isAdmin,
  requireAdmin,
  sameOrigin,
  body,
  ApiError,
  runtime,
  mp,
  databaseConfigured,
  paymentsReady,
} from "@/lib/server";
const product = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(400),
  category: z.enum(["Clássicas", "Especiais", "Doces", "Bebidas"]),
  price: z.number().int().min(100).max(100000),
  available: z.boolean(),
  tag: z.string().max(60),
  vegetarian: z.boolean(),
  image: z
    .string()
    .regex(/^\/assets\/[a-zA-Z0-9/_.-]+$/)
    .max(300)
    .optional(),
  individualPrice: z.number().int().min(100).max(100000).nullable().optional(),
});
const config = z.object({
  open: z.boolean(),
  ordersEnabled: z.boolean(),
  deliveryFee: z.number().int().min(0).max(20000),
  deliveryMinutes: z.string().min(3).max(40),
  coupon: z.string().max(30),
  discount: z.number().int().min(0).max(50),
});
export async function GET() {
  try {
    const authorized = await isAdmin();
    const c = await catalog();
    if (!authorized)
      return json({
        authorized: false,
        ...c,
        orders: [],
        paymentsReady: false,
      });
    if (!databaseConfigured())
      return json({
        authorized: true,
        ...c,
        orders: [],
        paymentsReady: false,
        databaseReady: false,
      });
    const orders = await db()
      .prepare("SELECT * FROM orders ORDER BY created DESC LIMIT 300")
      .all();
    return json({
      authorized: true,
      ...c,
      orders: orders.results.map((o: any) => ({
        ...o,
        data: JSON.parse(o.data),
      })),
      paymentsReady: paymentsReady(),
      databaseReady: true,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    if (!databaseConfigured())
      throw new ApiError(
        "Configure o banco D1 para salvar alterações no painel.",
        503,
      );
    const input = await body(request);
    if (input.action === "product") {
      const p = product.safeParse(input.data);
      if (!p.success) throw new ApiError("Revise os campos do produto.");
      await db()
        .prepare(
          "INSERT INTO products (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
        )
        .bind(p.data.id, JSON.stringify(p.data))
        .run();
      return json({ ok: true });
    }
    if (input.action === "settings") {
      const parsed = config.safeParse(input.data);
      if (!parsed.success) throw new ApiError("Configurações inválidas.");
      if (
        parsed.data.ordersEnabled &&
        (!paymentsReady() || process.env.ENABLE_LIVE_ORDERS !== "true")
      )
        throw new ApiError(
          "Configure o provedor de pagamento e a URL antes de ativar pedidos reais.",
        );
      await db()
        .prepare(
          "INSERT INTO settings (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
        )
        .bind("store", JSON.stringify(parsed.data))
        .run();
      return json({ ok: true });
    }
    if (input.action === "status") {
      const transitions: Record<string, string[]> = {
        recebido: ["preparando", "cancelado"],
        preparando: ["pronto"],
        pronto: ["concluido"],
      };
      const order: any = await db()
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(String(input.id))
        .first();
      if (!order || order.demo) throw new ApiError("Pedido não encontrado.");
      if (!transitions[order.status]?.includes(input.status))
        throw new ApiError("Esta mudança de status não é permitida.");
      if (input.status === "cancelado" && order.payment === "approved")
        throw new ApiError("Reembolse o pagamento antes de cancelar.");
      await db()
        .prepare("UPDATE orders SET status = ? WHERE id = ? AND status = ?")
        .bind(input.status, input.id, order.status)
        .run();
      return json({ ok: true });
    }
    if (input.action === "refund") {
      const order: any = await db()
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(String(input.id))
        .first();
      if (!order || order.demo || order.payment !== "approved")
        throw new ApiError("Pedido sem pagamento aprovado para reembolso.");
      const data = JSON.parse(order.data);
      if (!/^\d+$/.test(String(data.paymentId)))
        throw new ApiError("Identificador do pagamento ausente.");
      const result = await mp(
        `/v1/payments/${data.paymentId}/refunds`,
        "POST",
        {},
        `refund-${order.id}`,
      );
      if (result.status !== "approved")
        throw new ApiError(
          "Reembolso ainda não confirmado. Consulte o provedor.",
        );
      await db()
        .prepare(
          "UPDATE orders SET status = 'cancelado', payment = 'refunded' WHERE id = ?",
        )
        .bind(order.id)
        .run();
      return json({ ok: true });
    }
    throw new ApiError("Ação inválida.");
  } catch (e) {
    return failure(e);
  }
}
