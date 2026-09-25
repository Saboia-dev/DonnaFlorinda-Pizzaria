import PaymentScreen from "./payment-screen";
export const metadata = { title: "Pagamento | Donna Florinda" };
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const p = await searchParams;
  return <PaymentScreen orderId={p.pedido} />;
}
