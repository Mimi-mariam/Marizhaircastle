import type { Metadata } from "next";
import "./globals.css";
import "@/tokens/design-tokens.css";
import Providers from "@/components/shared/Providers";
export const metadata: Metadata = {
  title: {
    default: "Marizhaircastle",
    template: "%s | Marizhaircastle",
  },
  description:
    "Premium Nigerian wigs and hair extensions. Shop confidently, pay securely, get your order within 24 hours after successful payment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}