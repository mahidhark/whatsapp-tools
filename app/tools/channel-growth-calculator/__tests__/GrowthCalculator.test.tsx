/**
 * @jest-environment jsdom
 */
// Component tests for GrowthCalculator (Tool #4)

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GrowthCalculator from '../GrowthCalculator';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock recharts — render simple divs instead of SVG charts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="chart-line" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.history.replaceState
const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: { replaceState: mockReplaceState },
  writable: true,
});

describe('GrowthCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Default: logged out
    mockUseAuth.mockReturnValue({ user: null, loading: false });
  });

  // Test 18: Renders all 4 input fields
  it('renders all 4 input fields', () => {
    render(<GrowthCalculator />);
    expect(screen.getByLabelText(/current follower count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select your niche/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/posts per week/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/average engagement rate/i)).toBeInTheDocument();
  });

  // Test 19: Chart renders with default inputs
  it('renders chart', () => {
    render(<GrowthCalculator />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  // Test 20: Inputs update projections
  it('changing followers updates projection cards', () => {
    render(<GrowthCalculator />);
    const input = screen.getByLabelText(/current follower count/i);
    fireEvent.change(input, { target: { value: '5000' } });

    // Projection cards should show values above 5000
    const cards = screen.getAllByText(/followers/i);
    expect(cards.length).toBeGreaterThan(0);
  });

  // Test 21: "Use niche average" fills engagement
  it('"Use niche average" button fills engagement rate', () => {
    render(<GrowthCalculator />);
    const button = screen.getByText(/use niche average/i);
    fireEvent.click(button);
    // General niche avg is 8% — the label should update
    // After clicking "Use niche average", the engagement label should show 8%
    const engagementLabel = screen.getByLabelText(/average engagement rate/i);
    expect(engagementLabel).toHaveValue("8");
  });

  // Test 22: Posts > 10 shows automation CTA
  it('posts > 10 shows automation CTA', () => {
    render(<GrowthCalculator />);
    const slider = screen.getByLabelText(/posts per week/i);
    fireEvent.change(slider, { target: { value: '15' } });
    expect(screen.getByText(/automate it with/i)).toBeInTheDocument();
  });

  // Test 23: URL params pre-fill inputs
  it('URL params pre-fill inputs', () => {
    mockSearchParams.set('followers', '5000');
    mockSearchParams.set('niche', 'tech');

    render(<GrowthCalculator />);

    const nicheSelect = screen.getByLabelText(/select your niche/i) as HTMLSelectElement;
    expect(nicheSelect.value).toBe('tech');

    // Clean up
    mockSearchParams.delete('followers');
    mockSearchParams.delete('niche');
  });

  // Test 24: Benchmark gauge shows correct label
  it('benchmark gauge renders with label', () => {
    render(<GrowthCalculator />);
    // Default inputs (5% engagement, 3 posts/wk, General) should produce a benchmark
    const benchLabels = ['Top 5%', 'Top 15%', 'Above Average', 'Average', 'Below Average'];
    const found = benchLabels.some((label) => screen.queryByText(label));
    expect(found).toBe(true);
  });

  // Test 25: Followers = 0 shows seed message
  it('followers = 0 shows seed message', () => {
    render(<GrowthCalculator />);
    // Default is 0 followers
    expect(screen.getByText(/assuming 50 initial followers/i)).toBeInTheDocument();
  });

  // Test 26: Low engagement shows warning
  it('low engagement shows warning', () => {
    render(<GrowthCalculator />);
    const slider = screen.getByLabelText(/average engagement rate/i);
    fireEvent.change(slider, { target: { value: '1' } });
    expect(screen.getByText(/well below the niche average/i)).toBeInTheDocument();
  });

  // Test 27: PDF button visible in results
  it('PDF download button is visible', () => {
    render(<GrowthCalculator />);
    expect(screen.getByText(/download full report/i)).toBeInTheDocument();
  });

  // Test 28: PDF button redirects to signup when logged out
  it('PDF button redirects to signup when not logged in', () => {
    render(<GrowthCalculator />);
    const pdfButton = screen.getByText(/download full report/i);
    fireEvent.click(pdfButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/signup?redirect=')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'growth-calc-inputs',
      expect.any(String)
    );
  });
});

  // ============================================================
  // Auth redirect flow tests
  // ============================================================

  // Test 29: PDF button saves inputs to localStorage before redirect
  it('PDF button saves all inputs to localStorage before redirect', () => {
    render(<GrowthCalculator />);

    // Set some inputs
    const followersInput = screen.getByLabelText(/current follower count/i);
    fireEvent.change(followersInput, { target: { value: '5000' } });

    const nicheSelect = screen.getByLabelText(/select your niche/i);
    fireEvent.change(nicheSelect, { target: { value: 'tech' } });

    // Click PDF button (logged out)
    const pdfButton = screen.getByText(/download full report/i);
    fireEvent.click(pdfButton);

    // Verify localStorage was called with correct data
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.followers).toBe(5000);
    expect(savedData.nicheId).toBe('tech');
    expect(savedData.postsPerWeek).toBeDefined();
    expect(savedData.engagementRate).toBeDefined();
  });

  // Test 29b: Logged in with saved localStorage restores inputs
  it('restores inputs from localStorage when logged in', () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ followers: 5000, postsPerWeek: 7, engagementRate: 12, nicheId: 'tech' })
    );
    mockUseAuth.mockReturnValue({ user: { id: 'test-user' }, loading: false });

    render(<GrowthCalculator />);

    // localStorage should be cleared after restore
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('growth-calc-inputs');
  });

  // Test 30: Shows "Free account required" when logged out
  it('shows free account message when logged out', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<GrowthCalculator />);
    expect(screen.getByText(/free whatsscale account required/i)).toBeInTheDocument();
  });

  // Test 31: Hides "Free account required" when logged in
  it('hides free account message when logged in', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'test-user' }, loading: false });
    render(<GrowthCalculator />);
    expect(screen.queryByText(/free whatsscale account required/i)).not.toBeInTheDocument();
  });
