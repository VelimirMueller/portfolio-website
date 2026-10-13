import React from 'react';
import { render } from '@testing-library/react';
import { GithubIcon, LinkedinIcon } from '../BrandIcons';

describe('BrandIcons', () => {
  it.each([
    ['GithubIcon', GithubIcon, 'lucide-github', 2],
    ['LinkedinIcon', LinkedinIcon, 'lucide-linkedin', 3],
  ] as const)('%s renders a lucide-style SVG', (_name, Icon, className, shapes) => {
    const { container } = render(<Icon size={18} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('lucide', className);
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('height', '18');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.children).toHaveLength(shapes);
  });

  it('drops the default aria-hidden when the icon gets an accessible name', () => {
    const { container } = render(<GithubIcon aria-label="GitHub" />);

    expect(container.querySelector('svg')).not.toHaveAttribute('aria-hidden');
  });
});
