/**
 * @jest-environment jsdom
 */
// Component tests for LinkGenerator
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkGenerator from '../LinkGenerator';

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQR'),
}));

// Mock clipboard
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe('LinkGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Renders phone input and generate button
  it('renders phone input and generate button', () => {
    render(<LinkGenerator />);
    expect(screen.getByPlaceholderText('9876543210')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  // Test 2: Renders pre-filled message textarea
  it('renders pre-filled message textarea', () => {
    render(<LinkGenerator />);
    expect(screen.getByPlaceholderText(/interested/i)).toBeInTheDocument();
  });

  // Test 3: Shows validation error for empty phone
  it('shows validation error for empty phone', async () => {
    render(<LinkGenerator />);
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(await screen.findByText(/please enter a phone number/i)).toBeInTheDocument();
  });

  // Test 4: Shows validation error for short phone
  it('shows validation error for short phone', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '123');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(await screen.findByText(/too short/i)).toBeInTheDocument();
  });

  // Test 5: Generates wa.me link without message
  it('generates wa.me link without message', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue(/wa\.me/)).toBeInTheDocument();
    });
    const input = screen.getByDisplayValue(/wa\.me/) as HTMLInputElement;
    expect(input.value).toContain('wa.me/');
    expect(input.value).toContain('9876543210');
    expect(input.value).not.toContain('?text=');
  });

  // Test 6: Generates wa.me link with pre-filled message
  it('generates wa.me link with message', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    await userEvent.type(screen.getByPlaceholderText(/interested/i), 'Hello there');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue(/wa\.me/)).toBeInTheDocument();
    });
    const input = screen.getByDisplayValue(/wa\.me/) as HTMLInputElement;
    expect(input.value).toContain('?text=');
  });

  // Test 7: Generates QR code after link generation
  it('generates QR code after link generation', async () => {
    const QRCode = require('qrcode');
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalled();
    });
  });

  // Test 8: Shows test link after generation
  it('shows test link after generation', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(await screen.findByText(/test link/i)).toBeInTheDocument();
  });

  // Test 9: Shows copy button after generation
  it('shows copy button after generation', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Test 10: Strips leading zeros from phone
  it('strips leading zeros from phone number', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '09876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue(/wa\.me/)).toBeInTheDocument();
    });
    const input = screen.getByDisplayValue(/wa\.me/) as HTMLInputElement;
    expect(input.value).not.toContain('/09');
  });

  // Test 11: Shows character count for message
  it('shows character count for message', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText(/interested/i), 'Hello');
    expect(screen.getByText('5 characters')).toBeInTheDocument();
  });

  // Test 12: Shows download QR button after generation
  it('shows download QR button after generation', async () => {
    render(<LinkGenerator />);
    await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(await screen.findByText(/download qr/i)).toBeInTheDocument();
  });

  // Test 13: Renders privacy badge
  it('renders privacy badge', () => {
    render(<LinkGenerator />);
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
  });

  // Test 14: Renders SEO FAQ section
  it('renders FAQ section', () => {
    render(<LinkGenerator />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
  });

  // Test 15: Renders CTA section
  it('renders CTA section', () => {
    render(<LinkGenerator />);
    expect(screen.getByText(/need to automate/i)).toBeInTheDocument();
  });

  // Test 16: Renders related tools
  it('renders related tools section', () => {
    render(<LinkGenerator />);
    expect(screen.getByText(/related tools/i)).toBeInTheDocument();
  });

  // Test 17: Auto-detects pasted number with country code
  it('handles pasted number with + prefix', async () => {
    render(<LinkGenerator />);
    const input = screen.getByPlaceholderText('9876543210');
    fireEvent.change(input, { target: { value: '+919876543210' } });
    // Should split country code from number
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('9876543210');
    });
  });
});
