export const metadata = { title: 'Privacy Policy – Manira Jewels' };

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-serif text-lg font-bold text-gray-900 mb-3 border-l-4 border-gold pl-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Manira Jewels ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase from us.
        </p>

        <Section title="Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address when you register or place an order</li>
            <li><strong>Payment Information:</strong> We do not store your payment details. All payments are securely processed by Razorpay</li>
            <li><strong>Usage Data:</strong> Pages visited, products viewed, time spent on site (via cookies and analytics)</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers</li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and fulfil your orders</li>
            <li>To send order confirmations, shipping updates, and delivery notifications</li>
            <li>To respond to your queries and provide customer support</li>
            <li>To send you promotional offers and newsletters (only if you opt in)</li>
            <li>To improve our website, products, and services</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="Sharing of Information">
          <p>We do not sell or rent your personal information. We may share it with:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Logistics Partners:</strong> Name, phone, and address for delivery (Delhivery, Blue Dart, etc.)</li>
            <li><strong>Payment Gateway:</strong> Razorpay for secure payment processing</li>
            <li><strong>Analytics Tools:</strong> Anonymised data for understanding site usage</li>
            <li><strong>Legal Authorities:</strong> When required by law</li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>We use cookies to enhance your browsing experience. Cookies help us remember your cart, preferences, and session. You can disable cookies in your browser settings, but this may affect site functionality.</p>
        </Section>

        <Section title="Data Security">
          <p>We implement industry-standard security measures including SSL encryption, secure servers, and access controls to protect your personal information from unauthorised access, alteration, or disclosure.</p>
        </Section>

        <Section title="Data Retention">
          <p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us at <a href="mailto:privacy@manira.in" className="text-gold hover:underline">privacy@manira.in</a>.</p>
        </Section>

        <Section title="Your Rights">
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Lodge a complaint with the relevant data protection authority</li>
          </ul>
        </Section>

        <Section title="Third-Party Links">
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our website after changes constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact Us">
          <p>For any privacy-related questions or concerns, please contact us at:</p>
          <p className="mt-2"><strong>Manira Jewels</strong><br />
          Email: <a href="mailto:privacy@manira.in" className="text-gold hover:underline">privacy@manira.in</a><br />
          Phone: +91 99999 99999<br />
          Address: 123, Jewellers Lane, Mumbai - 400001, Maharashtra</p>
        </Section>
      </div>
    </div>
  );
}
