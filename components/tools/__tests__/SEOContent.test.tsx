/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SEOContent from '../SEOContent';

const mockSections = [
  { heading: 'Section One', content: 'Content for section one.' },
  { heading: 'Section Two', content: 'Content for section two.' },
];

const mockFaqs = [
  { question: 'What is this?', answer: 'This is a test tool.' },
  { question: 'Is it free?', answer: 'Yes, completely free.' },
];

describe('SEOContent', () => {
  it('renders content sections', () => {
    render(<SEOContent sections={mockSections} faqs={[]} />);
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Content for section one.')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(<SEOContent sections={[]} faqs={mockFaqs} />);
    expect(screen.getByText('What is this?')).toBeInTheDocument();
    expect(screen.getByText('Is it free?')).toBeInTheDocument();
  });

  it('expands FAQ answer on click', () => {
    render(<SEOContent sections={[]} faqs={mockFaqs} />);
    expect(screen.queryByText('This is a test tool.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('What is this?'));
    expect(screen.getByText('This is a test tool.')).toBeInTheDocument();
  });

  it('collapses FAQ answer on second click', () => {
    render(<SEOContent sections={[]} faqs={mockFaqs} />);
    fireEvent.click(screen.getByText('What is this?'));
    expect(screen.getByText('This is a test tool.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('What is this?'));
    expect(screen.queryByText('This is a test tool.')).not.toBeInTheDocument();
  });

  it('renders FAQ schema JSON-LD', () => {
    const { container } = render(<SEOContent sections={[]} faqs={mockFaqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const json = JSON.parse(script!.textContent!);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity).toHaveLength(2);
  });

  it('only shows one FAQ expanded at a time', () => {
    render(<SEOContent sections={[]} faqs={mockFaqs} />);
    fireEvent.click(screen.getByText('What is this?'));
    expect(screen.getByText('This is a test tool.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Is it free?'));
    expect(screen.queryByText('This is a test tool.')).not.toBeInTheDocument();
    expect(screen.getByText('Yes, completely free.')).toBeInTheDocument();
  });
});

// Tests 13-14: ReactNode content support (Tool #6 requirement)
describe('SEOContent ReactNode support', () => {
  it('renders JSX content with links and bold text', () => {
    const jsxSections = [
      {
        heading: 'JSX Section',
        content: React.createElement('div', null,
          React.createElement('p', null, 'Text with a '),
          React.createElement('a', { href: '/tools/channel-growth-calculator' }, 'link to calculator'),
          React.createElement('p', null,
            React.createElement('strong', null, 'Bold text'),
            ' and normal text.'
          )
        ),
      },
    ];
    render(<SEOContent sections={jsxSections} faqs={[]} />);
    expect(screen.getByText('JSX Section')).toBeInTheDocument();
    const link = screen.getByText('link to calculator');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/tools/channel-growth-calculator');
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('Bold text').tagName).toBe('STRONG');
  });

  it('still renders plain string content (backwards compatibility)', () => {
    render(<SEOContent sections={mockSections} faqs={[]} />);
    expect(screen.getByText('Content for section one.')).toBeInTheDocument();
    expect(screen.getByText('Content for section two.')).toBeInTheDocument();
  });
});
