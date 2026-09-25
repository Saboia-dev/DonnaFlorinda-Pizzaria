import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import Providers from "./providers";
import RouteMotion from "./route-motion";
export const metadata: Metadata = {
  title: "Donna Florinda | Pizzaria Artesanal em Sorocaba",
  description:
    "Donna Florinda — a melhor Pizzaria Artesanal de Sorocaba. Uma noite feita para compartilhar.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <RouteMotion>{children}</RouteMotion>
        </Providers>
      </body>
    </html>
  );
}
