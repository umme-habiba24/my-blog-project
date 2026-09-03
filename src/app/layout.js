import './globals.css';

export const metadata = {
  title: 'Extraordinary Blog',
  description: 'Full Stack Blog Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif' }} className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}