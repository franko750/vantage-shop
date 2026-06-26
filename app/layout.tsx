import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Vantage",
  description: "FiveM Resources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
