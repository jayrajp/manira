export const metadata = { title: 'Terms & Conditions – Manira Jewels' };

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-serif text-lg font-bold text-gray-900 mb-3 border-l-4 border-gold pl-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Terms & Conditions</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Welcome to Manira Jewels. By accessing or using our website and purchasing our products, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.
        </p>

        <Section title="About Manira Jewels">
          <p>Manira Jewels is an online retailer specialising in <strong>imitation (fashion) jewellery</strong> for women and men. All products sold on this platform are fashion accessories and do not contain real gold, silver, diamonds, or other precious metals/stones unless explicitly stated.</p>
        </Section>

        <Section title="Product Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>All our jewellery is imitation/fashion jewellery. Terms like "Gold Tone", "Antique Gold", "Silver Tone", "Oxidised" refer to the finish/plating style only</li>
            <li>Product images are for reference. Actual colour may vary slightly due to lighting and screen calibration</li>
            <li>Sizes mentioned are approximate and may have slight variations</li>
            <li>We reserve the right to discontinue products without notice</li>
          </ul>
        </Section>

        <Section title="Pricing & Payment">
          <ul className="list-disc pl-5 space-y-1">
            <li>All prices are in Indian Rupees (₹) inclusive of GST unless stated otherwise</li>
            <li>We reserve the right to change prices without prior notice</li>
            <li>Payments are processed securely via Razorpay (UPI, Cards, Net Banking, Wallets)</li>
            <li>An order is confirmed only after successful payment</li>
            <li>In case of payment failure, the amount will be auto-refunded to your bank/card within 5–7 business days</li>
          </ul>
        </Section>

        <Section title="Order Cancellation">
          <p>Orders can be cancelled within <strong>24 hours</strong> of placement by contacting our support team. Once the order is dispatched, cancellations are not possible. In that case, you may initiate a return after delivery.</p>
        </Section>

        <Section title="Intellectual Property">
          <p>All content on this website including images, logos, product descriptions, and design elements are the intellectual property of Manira Jewels. Reproduction or redistribution without written permission is prohibited.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>Manira Jewels shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability in any case shall not exceed the amount paid for the specific order in question.</p>
        </Section>

        <Section title="Governing Law">
          <p>These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
        </Section>

        <Section title="Contact Us">
          <p>For questions regarding these Terms, contact us at <a href="mailto:legal@manira.in" className="text-gold hover:underline">legal@manira.in</a> or call +91 99999 99999.</p>
        </Section>
      </div>
    </div>
  );
}
