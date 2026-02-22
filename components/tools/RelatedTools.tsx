// components/tools/RelatedTools.tsx
// Grid of related tool cards with internal links
import Link from 'next/link';

interface RelatedTool {
  name: string;
  href: string;
  emoji: string;
  description: string;
}

interface RelatedToolsProps {
  tools: RelatedTool[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  if (!tools.length) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Related Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition"
          >
            <span className="text-2xl">{tool.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{tool.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
