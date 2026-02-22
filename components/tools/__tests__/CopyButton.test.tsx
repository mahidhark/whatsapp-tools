/**
 * @jest-environment jsdom
 */
// Component tests for CopyButton
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CopyButton from '../CopyButton';

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Renders with default label
  it('renders with default label', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  // Test 2: Renders with custom label
  it('renders with custom label', () => {
    render(<CopyButton text="hello" label="Copy Link" />);
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
  });

  // Test 3: Copies text to clipboard on click
  it('copies text to clipboard on click', async () => {
    render(<CopyButton text="https://wa.me/919876543210" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://wa.me/919876543210');
    });
  });

  // Test 4: Shows "Copied!" feedback after click
  it('shows copied feedback after click', async () => {
    render(<CopyButton text="hello" />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  // Test 5: Reverts to original label after 2 seconds
  it('reverts to original label after timeout', async () => {
    jest.useFakeTimers();
    render(<CopyButton text="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.getByText(/copied/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
    jest.useRealTimers();
  });

  // Test 6: Disabled when text is empty
  it('is disabled when text is empty', () => {
    render(<CopyButton text="" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
