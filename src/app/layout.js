import { Headland_One } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/components/auth/AuthContext";

const headlandOne = Headland_One({
  variable: "--font-headland",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Himanshu Beads Jewellery",
  description:
    "Curated jewellery collections, new arrivals, and premium support from Himanshu Beads.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={headlandOne.variable}>
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
