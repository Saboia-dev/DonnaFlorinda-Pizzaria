"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ShoppingBag,
  ChartNoAxesCombined,
  Settings2,
  UtensilsCrossed,
  Plus,
  Download,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Brand } from "../storefront";
import { money, Product, seedProducts, initialSettings } from "@/lib/catalog";
export default function Admin() {
  const [data, setData] = useState<any>({
      authorized: false,
      products: seedProducts,
      settings: initialSettings,
      orders: [],
      paymentsReady: false,
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [edit, setEdit] = useState<Product | null>(null),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("all"),
    [refund, setRefund] = useState<any>(null),
    [password, setPassword] = useState("");
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(d.error);
      setPassword("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }
  async function load() {
    try {
      const r = await fetch("/api/admin");
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setData(d);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(action: string, payload: any) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      toast.success("Atualização salva.");
      await load();
      setEdit(null);
      setRefund(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  const actual = data.orders.filter((o: any) => !o.demo);
  const revenue = actual
    .filter((o: any) => o.payment === "approved")
    .reduce((s: number, o: any) => s + o.total, 0);
  const visible = data.orders.filter(
    (o: any) =>
      filter === "all" ||
      (filter === "demo" ? o.demo : !o.demo && o.status === filter),
  );
  function exportCSV() {
    const rows = [
      ["Pedido", "Data", "Status", "Pagamento", "Total (R$)", "Modo"],
      ...data.orders.map((o: any) => [
        o.id,
        new Date(o.created).toISOString(),
        o.status,
        o.payment,
        (o.total / 100).toFixed(2),
        o.demo ? "Demonstração" : "Real",
      ]),
    ];
    const blob = new Blob(
      [
        "\uFEFF" +
          rows
            .map((r) =>
              r
                .map((x: any) => `"${String(x).replaceAll('"', '""')}"`)
                .join(";"),
            )
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donna-pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="admin-page">
      <header className="admin-header">
        <Brand />
        <span className="admin-label">PAINEL DA CASA</span>
        <Link href="/" className="row small">
          Ver loja
          <ArrowUpRight size={16} />
        </Link>
      </header>
      <main className="admin-main" id="conteudo">
        <div className="admin-title">
          <div>
            <p className="eyebrow red">TUDO NO SEU LUGAR</p>
            <h1>
              Buona sera, <em>Donna.</em>
            </h1>
            <p>Seu cardápio, seus pedidos, sua casa.</p>
          </div>
          <button className="button outline" onClick={load}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        {!data.authorized && !loading && (
          <div className="notice">
            <strong>Painel da casa · acesso restrito.</strong>
            <p>
              Consulte a prévia abaixo ou entre com a senha administrativa
              configurada no servidor.
            </p>
            <form
              onSubmit={login}
              className="row"
              style={{ marginTop: 15, maxWidth: 520 }}
            >
              <input
                type="password"
                className="form-input"
                aria-label="Senha administrativa"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Senha administrativa"
              />
              <button className="button primary" disabled={busy}>
                Entrar
              </button>
            </form>
          </div>
        )}
        {data.authorized && (
          <div className="row between notice">
            <span>
              {data.databaseReady
                ? "Sessão administrativa ativa."
                : "Configure o banco D1 para salvar alterações e receber pedidos."}
            </span>
            <button
              className="text-button"
              onClick={async () => {
                await fetch("/api/admin/login", { method: "DELETE" });
                await load();
              }}
            >
              Sair
            </button>
          </div>
        )}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Carregando painel…</p>
        ) : (
          <Tabs defaultValue="overview" className="admin-tabs">
            <TabsList className="admin-tab-list">
              <TabsTrigger value="overview">
                <ChartNoAxesCombined size={16} />
                Visão geral
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag size={16} />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="menu">
                <UtensilsCrossed size={16} />
                Cardápio
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings2 size={16} />
                Configurações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="metrics">
                <article>
                  <span>Receita aprovada</span>
                  <strong>{money(revenue)}</strong>
                  <small>Exclui demonstrações e reembolsos</small>
                </article>
                <article>
                  <span>Pedidos reais</span>
                  <strong>{actual.length}</strong>
                  <small>Até os 300 pedidos mais recentes</small>
                </article>
                <article>
                  <span>Na cozinha</span>
                  <strong>
                    {
                      actual.filter((o: any) =>
                        ["recebido", "preparando"].includes(o.status),
                      ).length
                    }
                  </strong>
                  <small>Recebidos e em preparo</small>
                </article>
                <article>
                  <span>Sabores disponíveis</span>
                  <strong>
                    {data.products.filter((p: Product) => p.available).length}
                  </strong>
                  <small>Produtos ativos no cardápio</small>
                </article>
              </div>
              <div className="admin-overview">
                <section className="admin-panel">
                  <h2>O ritmo da casa</h2>
                  {actual.length ? (
                    <div className="status-bars">
                      {["recebido", "preparando", "pronto", "concluido"].map(
                        (s) => (
                          <div key={s}>
                            <span>{s}</span>
                            <div>
                              <i
                                style={{
                                  width: `${(actual.filter((o: any) => o.status === s).length / actual.length) * 100}%`,
                                }}
                              />
                            </div>
                            <strong>
                              {actual.filter((o: any) => o.status === s).length}
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <ShoppingBag size={34} />
                      <h3>Pronta para os primeiros pedidos.</h3>
                      <p>
                        Quando os pedidos reais começarem, os resultados
                        aparecem aqui.
                      </p>
                    </div>
                  )}
                </section>
                <section className="admin-panel">
                  <h2>Operação</h2>
                  <div className="operation-row">
                    <span>Recebimento de pedidos</span>
                    <b>{data.settings.open ? "Disponível" : "Pausado"}</b>
                  </div>
                  <div className="operation-row">
                    <span>Modo da loja</span>
                    <b>
                      {data.settings.ordersEnabled
                        ? "Vendas reais"
                        : "Demonstração"}
                    </b>
                  </div>
                  <div className="operation-row">
                    <span>Pagamento online</span>
                    <b>{data.paymentsReady ? "Configurado" : "A configurar"}</b>
                  </div>
                  <div className="operation-row">
                    <span>Entrega</span>
                    <b>{money(data.settings.deliveryFee)}</b>
                  </div>
                  <p className="small muted" style={{ marginTop: 20 }}>
                    Pedidos de teste ficam separados dos indicadores comerciais.
                  </p>
                </section>
              </div>
            </TabsContent>
            <TabsContent value="orders">
              <section className="admin-panel">
                <div className="row between">
                  <h2>Pedidos da casa</h2>
                  <button
                    className="button outline"
                    disabled={!data.authorized || !data.orders.length}
                    onClick={exportCSV}
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
                <div className="admin-filter">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="form-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ["all", "Todos"],
                        ["recebido", "Recebidos"],
                        ["preparando", "Em preparo"],
                        ["pronto", "Prontos"],
                        ["concluido", "Concluídos"],
                        ["demo", "Demonstração"],
                      ].map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {visible.length ? (
                  <div className="admin-orders">
                    {visible.map((o: any) => (
                      <article className="admin-order" key={o.id}>
                        <div className="row between">
                          <div>
                            <h3>
                              #{o.id.slice(0, 8).toUpperCase()} ·{" "}
                              {o.data.customer.name}
                            </h3>
                            <p className="small muted">
                              {new Date(o.created).toLocaleString("pt-BR", {
                                timeZone: "America/Sao_Paulo",
                              })}{" "}
                              · {o.data.customer.phone}
                            </p>
                          </div>
                          <span className="status-badge">
                            {o.demo ? "Demonstração" : o.status}
                          </span>
                        </div>
                        <p className="small" style={{ marginTop: 18 }}>
                          {o.data.lines
                            .map(
                              (x: any) =>
                                `${x.quantity}× ${x.name} (${x.size})${x.note ? " · " + x.note : ""}`,
                            )
                            .join(" / ")}
                        </p>
                        <p className="small muted">
                          {o.data.fulfillment === "pickup"
                            ? "Retirada no balcão"
                            : `${o.data.address.street}, ${o.data.address.number} — ${o.data.address.neighborhood} · ${o.data.address.complement}`}
                        </p>
                        <div className="row between" style={{ marginTop: 20 }}>
                          <strong>
                            {money(o.total)} · {o.payment}
                          </strong>
                          <div className="row">
                            {!o.demo &&
                              ["recebido", "preparando", "pronto"].includes(
                                o.status,
                              ) && (
                                <button
                                  className="button primary"
                                  disabled={busy}
                                  onClick={() =>
                                    save("status", {
                                      id: o.id,
                                      status: {
                                        recebido: "preparando",
                                        preparando: "pronto",
                                        pronto: "concluido",
                                      }[o.status as string],
                                    })
                                  }
                                >
                                  {
                                    {
                                      recebido: "Iniciar preparo",
                                      preparando: "Marcar pronto",
                                      pronto: "Concluir pedido",
                                    }[o.status as string]
                                  }
                                </button>
                              )}
                            {!o.demo && o.payment === "approved" && (
                              <button
                                className="text-button small"
                                disabled={busy}
                                onClick={() => setRefund(o)}
                              >
                                Reembolsar
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShoppingBag size={32} />
                    <h3>Nenhum pedido por aqui.</h3>
                    <p>
                      {data.authorized
                        ? "Os pedidos aparecerão nesta lista."
                        : "Entre com uma conta autorizada para ver os pedidos."}
                    </p>
                  </div>
                )}
              </section>
            </TabsContent>
            <TabsContent value="menu">
              <section className="admin-panel">
                <div className="row between">
                  <h2>Seu cardápio</h2>
                  <button
                    className="button primary"
                    disabled={!data.authorized}
                    onClick={() =>
                      setEdit({
                        id: `produto-${Date.now()}`,
                        name: "",
                        description: "",
                        price: 6900,
                        category: "Clássicas",
                        available: true,
                        tag: "",
                        vegetarian: false,
                      })
                    }
                  >
                    <Plus size={17} />
                    Novo produto
                  </button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Disponível</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((p: Product) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <strong>{p.name}</strong>
                          <p className="small muted">{p.tag}</p>
                        </TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>{money(p.price)}</TableCell>
                        <TableCell>
                          <Switch
                            aria-label={`Disponibilidade de ${p.name}`}
                            checked={p.available}
                            disabled={!data.authorized || busy}
                            onCheckedChange={(v) =>
                              save("product", { data: { ...p, available: v } })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-button"
                            disabled={!data.authorized}
                            onClick={() => setEdit({ ...p })}
                          >
                            Editar
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="small muted" style={{ marginTop: 20 }}>
                  Desative um produto para tirá-lo de venda preservando o
                  histórico de pedidos.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="settings">
              <section className="admin-panel settings-panel">
                <h2>O jeito da sua operação</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    save("settings", { data: data.settings });
                  }}
                >
                  <div className="settings-switch">
                    <div>
                      <strong>Receber pedidos</strong>
                      <p>
                        Pause a operação quando a cozinha estiver indisponível.
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.open}
                      disabled={!data.authorized}
                      onCheckedChange={(open) =>
                        setData({
                          ...data,
                          settings: { ...data.settings, open },
                        })
                      }
                    />
                  </div>
                  <div className="settings-switch">
                    <div>
                      <strong>Ativar vendas reais</strong>
                      <p>
                        Requer preços revisados, autorização da empresa e
                        pagamento configurado.
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.ordersEnabled}
                      disabled={!data.authorized || !data.paymentsReady}
                      onCheckedChange={(ordersEnabled) =>
                        setData({
                          ...data,
                          settings: { ...data.settings, ordersEnabled },
                        })
                      }
                    />
                  </div>
                  <div className="form-grid">
                    <label className="field-label">
                      Taxa de entrega (R$)
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.01"
                        required
                        disabled={!data.authorized}
                        value={data.settings.deliveryFee / 100}
                        onChange={(e) =>
                          setData({
                            ...data,
                            settings: {
                              ...data.settings,
                              deliveryFee: Math.round(
                                Number(e.target.value) * 100,
                              ),
                            },
                          })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Prazo estimado
                      <input
                        required
                        maxLength={40}
                        disabled={!data.authorized}
                        value={data.settings.deliveryMinutes}
                        onChange={(e) =>
                          setData({
                            ...data,
                            settings: {
                              ...data.settings,
                              deliveryMinutes: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Código do cupom
                      <input
                        maxLength={30}
                        disabled={!data.authorized}
                        value={data.settings.coupon}
                        onChange={(e) =>
                          setData({
                            ...data,
                            settings: {
                              ...data.settings,
                              coupon: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Desconto (%)
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        required
                        disabled={!data.authorized}
                        value={data.settings.discount}
                        onChange={(e) =>
                          setData({
                            ...data,
                            settings: {
                              ...data.settings,
                              discount: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    className="button primary"
                    disabled={!data.authorized || busy}
                    style={{ marginTop: 30 }}
                  >
                    {busy ? "Salvando…" : "Salvar configurações"}
                  </button>
                </form>
                <div
                  className="notice"
                  style={{ marginTop: 30, marginBottom: 0 }}
                >
                  <ShieldCheck size={20} />
                  <p>
                    Credenciais de pagamento e e-mails administrativos são
                    configurados no servidor. Nunca aparecem no código enviado
                    ao navegador.
                  </p>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="product-dialog">
          <DialogTitle className="display-sm">Cuidar do cardápio.</DialogTitle>
          <DialogDescription>
            Atualize as informações e o preço de venda.
          </DialogDescription>
          {edit && (
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                save("product", { data: edit });
              }}
            >
              <label className="field-label">
                Nome
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </label>
              <label className="field-label">
                Descrição
                <textarea
                  required
                  minLength={5}
                  maxLength={400}
                  value={edit.description}
                  onChange={(e) =>
                    setEdit({ ...edit, description: e.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label className="field-label">
                  Preço (R$)
                  <input
                    required
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    value={edit.price / 100}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        price: Math.round(Number(e.target.value) * 100),
                      })
                    }
                  />
                </label>
                <label className="field-label">
                  Categoria
                  <Select
                    value={edit.category}
                    onValueChange={(category) => setEdit({ ...edit, category })}
                  >
                    <SelectTrigger className="form-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Clássicas", "Especiais", "Doces", "Bebidas"].map(
                        (c) => (
                          <SelectItem value={c} key={c}>
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <label className="field-label">
                Chamada curta
                <input
                  maxLength={60}
                  value={edit.tag}
                  onChange={(e) => setEdit({ ...edit, tag: e.target.value })}
                />
              </label>
              <label className="row small">
                <Switch
                  checked={edit.vegetarian}
                  onCheckedChange={(vegetarian) =>
                    setEdit({ ...edit, vegetarian })
                  }
                />
                Opção vegetariana
              </label>
              <button className="button primary" disabled={busy}>
                Salvar produto
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!refund} onOpenChange={(v) => !v && setRefund(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Reembolsar este pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            O valor integral de {refund ? money(refund.total) : ""} será
            devolvido pelo provedor de pagamento e o pedido será cancelado. Esta
            ação movimenta dinheiro real.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={() => refund && save("refund", { id: refund.id })}
            >
              Confirmar reembolso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
