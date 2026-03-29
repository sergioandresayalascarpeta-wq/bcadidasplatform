import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "adidas LAM — Demand Forecasting Platform",
  description: "Director of Data Engineering Technical Use Case — Demand Forecasting Data Platform for adidas Latin America. Databricks Lakehouse on AWS with three-module UX: MLOps Studio, Scenario Planner, Executive Dashboard.",
  keywords: ["adidas", "demand forecasting", "databricks", "machine learning", "data engineering", "LAM"],
  openGraph: {
    title: "adidas LAM — Demand Forecasting Platform",
    description: "ML-driven demand intelligence platform for adidas Latin America built on Databricks Lakehouse + AWS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
