/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyBadge from '../PrivacyBadge';

describe('PrivacyBadge', () => {
  it('renders the privacy message', () => {
    render(<PrivacyBadge />);
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
    expect(screen.getByText(/your data stays on your device/i)).toBeInTheDocument();
  });

  it('renders the shield icon', () => {
    const { container } = render(<PrivacyBadge />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
