import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Configuramos la fuente Roboto
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* fuente segun guia de prueba crm */
const dm_sans = DM_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"]

})

export const metadata: Metadata = {
  title: "StartupCRM",
  description: "Tu plataforma de gestión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}