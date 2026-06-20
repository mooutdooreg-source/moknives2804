import './globals.css';

export const metadata = {
  title: 'Mo Knives',
  description: 'Hand-Forged Legacies. Field-Proven Performance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
