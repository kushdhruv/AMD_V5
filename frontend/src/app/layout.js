import { Inter } from "next/font/google";
import "./globals.css";
import { GridPattern, RedGlowPulse } from "@/components/ui/backgrounds";
import { ToastContainer } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ek Manch - Plan, Promote & Run Any Event",
  description: "All-in-one GenAI platform for student events. Build websites, apps, and media in minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 -z-50 pointer-events-none">
            <GridPattern />
            {/* User requested Red Shade in corners everywhere */}
            <RedGlowPulse />
        </div>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
