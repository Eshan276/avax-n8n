import "./globals.css";

export const metadata = {
  title: "AVAX Workflow Builder",
  description: "Build automation workflows for Avalanche blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}