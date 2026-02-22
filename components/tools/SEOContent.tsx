// components/tools/SEOContent.tsx
// Below-fold SEO content wrapper with FAQ schema markup
'use client';

import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface SEOContentProps {
  sections: { heading: string; content: string }[];
  faqs: FAQ[];
}

export default function SEOContent({ sections, faqs }: SEOContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQ Schema.org structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Content Sections */}
      {sections.map((section, i) => (
        <div key={i} className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h2>
          <p className="text-gray-600 leading-relaxed">{section.content}</p>
        </div>
      ))}

      {/* FAQ Accordion */}
      {faqs.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                  <span className="text-gray-400 ml-2">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
