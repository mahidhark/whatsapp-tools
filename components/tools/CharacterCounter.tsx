// components/tools/CharacterCounter.tsx
// Shared character counter display for micro-tools
'use client';

interface CharacterCounterProps {
  count: number;
  className?: string;
}

export default function CharacterCounter({ count, className = '' }: CharacterCounterProps) {
  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      {count.toLocaleString()} {count === 1 ? 'character' : 'characters'}
    </div>
  );
}
