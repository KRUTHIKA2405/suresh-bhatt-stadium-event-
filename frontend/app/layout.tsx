import "../styles/globals.css";

export const metadata = {
  title: "Stadium Seat Booking",
  description: "Real-time seat availability demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
