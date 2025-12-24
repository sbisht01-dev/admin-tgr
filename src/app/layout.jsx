import "./globals.css";


export const metadata = {
  title: "Admin Dashboard - The Green Room",
  description: "Admin dashboard for The Green Room application",
};

export default function RootLayout({ children }) {
  return (
    <html >
      <body>
        {children}
      </body>
    </html>
  );
}
