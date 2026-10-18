import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata = {
  title: { default: 'Manira Jewels', template: '%s | Manira Jewels' },
  description: 'Discover exquisite handcrafted jewellery — necklaces, earrings, rings, bangles and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
