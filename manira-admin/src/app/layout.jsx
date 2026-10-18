import './globals.css';
import { Providers } from './providers';

export const metadata = { title: 'Manira Admin', description: 'Manira Jewels Admin Panel' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
