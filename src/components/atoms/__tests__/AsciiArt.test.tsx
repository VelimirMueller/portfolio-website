import React from 'react';
import { render, screen } from '@testing-library/react';
import { AsciiArt, ASCII_VM, asciiDivider } from '../AsciiArt';

describe('AsciiArt', () => {
  it('renders the art hidden from screen readers', () => {
    render(<AsciiArt art={ASCII_VM} className="text-[8px]" />);
    const pre = screen.getByTestId('ascii-art');
    expect(pre).toHaveAttribute('aria-hidden', 'true');
    expect(pre.textContent).toBe(ASCII_VM);
    expect(pre).toHaveClass('text-[8px]');
  });

  it('keeps the art without a leading blank line', () => {
    expect(ASCII_VM.startsWith('\n')).toBe(false);
  });
});

describe('asciiDivider', () => {
  it('pads a labelled divider to 72 columns', () => {
    const line = asciiDivider(2, 'ux ui branding');
    expect(line.startsWith('── // 02 UX UI BRANDING ')).toBe(true);
    expect(line).toHaveLength(72);
  });

  it('keeps a tail when the label is long', () => {
    expect(asciiDivider(1, 'x'.repeat(80)).endsWith('────')).toBe(true);
  });
});
