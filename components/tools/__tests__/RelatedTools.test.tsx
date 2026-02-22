/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import RelatedTools from '../RelatedTools';

const mockTools = [
  { name: 'Tool A', href: '/tools/a', emoji: '🔧', description: 'Description A' },
  { name: 'Tool B', href: '/tools/b', emoji: '🔨', description: 'Description B' },
];

describe('RelatedTools', () => {
  it('renders tool cards', () => {
    render(<RelatedTools tools={mockTools} />);
    expect(screen.getByText('Tool A')).toBeInTheDocument();
    expect(screen.getByText('Tool B')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
  });

  it('renders correct links', () => {
    render(<RelatedTools tools={mockTools} />);
    expect(screen.getByText('Tool A').closest('a')).toHaveAttribute('href', '/tools/a');
    expect(screen.getByText('Tool B').closest('a')).toHaveAttribute('href', '/tools/b');
  });

  it('renders nothing when tools array is empty', () => {
    const { container } = render(<RelatedTools tools={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders related tools heading', () => {
    render(<RelatedTools tools={mockTools} />);
    expect(screen.getByText(/related tools/i)).toBeInTheDocument();
  });
});
