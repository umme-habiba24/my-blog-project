import './globals.css';

export const metadata = {
  title: 'Blog Platform',
  description: 'Full Stack Blog Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
