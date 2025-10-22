import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bishop San Pedro Ozanam Center - Solar Monitoring",
  description: "Solar Panel Consumption Application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
