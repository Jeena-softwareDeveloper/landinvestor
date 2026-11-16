import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-next",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-next",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Land Investment - Smart Land Investment & Rental Returns Platform",
  description:
    "Fractional real estate co-investment platform backed by legal title deeds, commercial agro leases, and dynamic UPI payouts.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F7FA] text-[#1E293B]">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1E293B",
              borderRadius: "12px",
              boxShadow:
                "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              fontWeight: 500,
              fontSize: "13px",
            },
            success: {
              iconTheme: { primary: "#059669", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#DC2626", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
