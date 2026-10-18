'use client';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Contact Us</h1>
          <p className="text-gray-400 text-sm mt-2">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              {
                icon: MapPin,
                title: 'Our Address',
                lines: ['123, Jewellers Lane', 'Mumbai - 400001', 'Maharashtra, India'],
              },
              {
                icon: Phone,
                title: 'Phone',
                lines: ['+91 99999 99999', 'Mon–Sat, 10am–6pm'],
              },
              {
                icon: Mail,
                title: 'Email',
                lines: ['hello@manira.in', 'support@manira.in'],
              },
              {
                icon: Clock,
                title: 'Business Hours',
                lines: ['Monday – Saturday', '10:00 AM – 6:00 PM', 'Sunday: Closed'],
              },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="bg-white p-5 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 mb-1">{title}</p>
                  {lines.map((l, i) => <p key={i} className="text-xs text-gray-500">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white p-6 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                <h2 className="font-serif text-xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name:'',email:'',phone:'',subject:'',message:'' }); }}
                  className="mt-6 text-sm text-gold hover:underline">Send another message</button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-gray-800 mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name',  label: 'Full Name',  type: 'text',  placeholder: 'Your Name',         required: true  },
                      { key: 'email', label: 'Email',       type: 'email', placeholder: 'your@email.com',    required: true  },
                      { key: 'phone', label: 'Phone',       type: 'tel',   placeholder: '+91 98765 43210',   required: false },
                    ].map(f => (
                      <div key={f.key} className={f.key === 'phone' ? 'sm:col-span-2 sm:w-1/2' : ''}>
                        <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <input type={f.type} required={f.required} value={form[f.key]} placeholder={f.placeholder}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Subject <span className="text-red-500">*</span></label>
                    <select required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold bg-white">
                      <option value="">Select a topic</option>
                      <option value="order">Order Enquiry</option>
                      <option value="return">Return / Exchange</option>
                      <option value="product">Product Question</option>
                      <option value="bulk">Bulk / Wholesale Order</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Message <span className="text-red-500">*</span></label>
                    <textarea required rows={5} value={form.message} placeholder="Tell us how we can help..."
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold resize-none" />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                    <Send size={15} />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
