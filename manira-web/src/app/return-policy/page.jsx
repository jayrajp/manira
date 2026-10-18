import Link from 'next/link';

export const metadata = { title: 'Return Policy – Manira Jewels' };

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-serif text-lg font-bold text-gray-900 mb-3 border-l-4 border-gold pl-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Return & Exchange Policy</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-gold/5 border border-gold/30 rounded-lg p-5 mb-8 flex gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="font-semibold text-gray-800">15-Day Return Policy</p>
            <p className="text-sm text-gray-600">We offer hassle-free returns within 15 days of delivery for eligible items.</p>
          </div>
        </div>

        <Section title="Eligible Items for Return">
          <p>You may return items within <strong>15 days of delivery</strong> if:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>The item is unused, unworn, and in its original condition</li>
            <li>All original tags, packaging, and accessories are intact</li>
            <li>The item was not marked as "Final Sale" or "Non-Returnable"</li>
            <li>The item has a manufacturing defect or was damaged during delivery</li>
          </ul>
        </Section>

        <Section title="Non-Returnable Items">
          <p>The following items cannot be returned or exchanged:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Items that have been worn, used, or altered</li>
            <li>Items without original packaging or tags</li>
            <li>Sale or clearance items marked "Final Sale"</li>
            <li>Customised or personalised jewellery</li>
            <li>Items damaged due to mishandling by the customer</li>
          </ul>
        </Section>

        <Section title="How to Initiate a Return">
          <ol className="list-decimal pl-5 space-y-2 mt-2">
            <li>Contact us at <a href="mailto:support@manira.in" className="text-gold hover:underline">support@manira.in</a> or WhatsApp us within 15 days of delivery</li>
            <li>Mention your Order Number and reason for return with photos</li>
            <li>Our team will review and approve the return within 1–2 business days</li>
            <li>Pack the item securely in original packaging and ship it to our address</li>
            <li>Once received and inspected, your refund will be processed within 5–7 business days</li>
          </ol>
        </Section>

        <Section title="Refund Method">
          <p>Refunds are processed to your original payment method:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>UPI / Net Banking / Card:</strong> 5–7 business days</li>
            <li><strong>Wallets:</strong> 1–3 business days</li>
            <li>You will receive an email confirmation once the refund is processed</li>
          </ul>
        </Section>

        <Section title="Exchange Policy">
          <p>We offer exchanges for a different size or design subject to stock availability. Exchange requests must be raised within 15 days of delivery. Shipping charges for exchange orders are borne by the customer unless the item was defective.</p>
        </Section>

        <Section title="Damaged or Defective Items">
          <p>If you receive a damaged or defective product, please contact us within <strong>48 hours</strong> of delivery with photos. We will arrange a free pickup and replacement at no additional cost.</p>
        </Section>

        <div className="bg-cream border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-600">Still have questions? We're here to help!</p>
          <Link href="/contact" className="btn-primary px-6 py-2 text-sm mt-3 inline-block">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
