/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ToolCTA from '../ToolCTA';

describe('ToolCTA', () => {
  it('renders with default props', () => {
    render(<ToolCTA />);
    expect(screen.getByText(/need to automate this/i)).toBeInTheDocument();
    expect(screen.getByText(/get started free/i)).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <ToolCTA
        heading="Custom heading"
        description="Custom description"
        buttonText="Try Now"
        href="/custom"
      />
    );
    expect(screen.getByText('Custom heading')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('Try Now')).toBeInTheDocument();
  });

  it('links to signup by default', () => {
    render(<ToolCTA />);
    const link = screen.getByText(/get started free/i);
    expect(link.closest('a')).toHaveAttribute('href', '/signup');
  });
});
