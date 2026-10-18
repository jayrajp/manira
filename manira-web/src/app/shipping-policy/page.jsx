import Link from 'next/link';

export const metadata = { title: 'Shipping Policy – Manira Jewels' };

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-serif text-lg font-bold text-gray-900 mb-3 border-l-4 border-gold pl-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Shipping Policy</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Highlight boxes */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { emoji: '🚚', title: 'Free Shipping', desc: 'On all orders above ₹999' },
            { emoji: '📦', title: 'Fast Dispatch', desc: '1–2 business days' },
            { emoji: '📍', title: 'Pan-India Delivery', desc: 'We ship across India' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white p-4 shadow-sm text-center">
              <span className="text-3xl">{emoji}</span>
              <p className="font-semibold text-sm text-gray-800 mt-2">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <Section title="Shipping Charges">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-2">
              <thead>
                <tr className="bg-black text-white">
                  <th className="text-left px-4 py-2.5">Order Value</th>
                  <th className="text-left px-4 py-2.5">Shipping Charge</th>
                  <th className="text-left px-4 py-2.5">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Below ₹999',  '₹49',   '4–7 business days'],
                  ['₹999 & above', 'FREE',  '4–7 business days'],
                  ['Express Shipping', '₹149',  '2–3 business days'],
                ].map(([val, charge, del]) => (
                  <tr key={val} className="border-b border-gray-100 hover:bg-cream">
                    <td className="px-4 py-3">{val}</td>
                    <td className="px-4 py-3 font-semibold text-gold">{charge}</td>
                    <td className="px-4 py-3">{del}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Order Processing">
          <p>Orders are processed within <strong>1–2 business days</strong> after payment confirmation. You will receive a confirmation email with your order number once the order is placed.</p>
          <p>Orders placed on Saturday evenings, Sundays, or public holidays will be processed the next business day.</p>
        </Section>

        <Section title="Delivery Timeline">
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Metro cities</strong> (Mumbai, Delhi, Bangalore, etc.): 3–5 business days</li>
            <li><strong>Tier-2 & Tier-3 cities:</strong> 5–7 business days</li>
            <li><strong>Remote & rural areas:</strong> 7–10 business days</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">Delivery timelines are estimates and may vary due to logistics partner constraints, natural events, or public holidays.</p>
        </Section>

        <Section title="Order Tracking">
          <p>Once your order is shipped, you will receive an SMS and email with your AWB (tracking) number. You can track your order on our <Link href="/track-order" className="text-gold hover:underline">Track Order</Link> page or directly on the courier partner's website.</p>
        </Section>

        <Section title="Shipping Partners">
          <p>We ship through trusted courier partners including Shiprocket, Delhivery, Blue Dart, and DTDC based on your location and order size.</p>
        </Section>

        <Section title="Delivery Attempts">
          <p>Our courier partner will make <strong>3 delivery attempts</strong>. If the package is undelivered after 3 attempts due to customer unavailability or wrong address, it will be returned to our warehouse. Re-shipping charges will apply for re-dispatch.</p>
        </Section>

        <Section title="Address & Contact Details">
          <p>Please ensure your delivery address and phone number are correct at the time of placing the order. We are not responsible for delays or non-delivery due to incorrect address information.</p>
        </Section>

        <div className="bg-cream border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-600">Need help with your delivery? Contact us!</p>
          <Link href="/contact" className="btn-primary px-6 py-2 text-sm mt-3 inline-block">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
