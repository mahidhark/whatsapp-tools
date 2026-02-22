// components/tools/ToolCTA.tsx
// Soft pitch card linking to WhatsScale signup
import Link from 'next/link';

interface ToolCTAProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export default function ToolCTA({
  heading = 'Need to automate this?',
  description = 'WhatsScale schedules messages, manages contacts, and automates your WhatsApp at scale. Integrates with Make.com and Zapier.',
  buttonText = 'Get Started Free',
  href = '/signup',
}: ToolCTAProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-primary-light/10 via-white to-primary/5 border border-primary/20 rounded-xl p-6 sm:p-8 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{heading}</h3>
        <p className="text-gray-600 text-sm mb-4 max-w-lg mx-auto">{description}</p>
        <Link
          href={href}
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
