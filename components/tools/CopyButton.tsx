// components/tools/CopyButton.tsx
// Shared copy-to-clipboard button for all micro-tools
'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed'
      } ${className}`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}
