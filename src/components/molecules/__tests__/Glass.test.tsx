import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlassPanel } from '../GlassPanel';
import { SectionStage } from '../SectionStage';
import { SectionDivider } from '../SectionDivider';
import { BentoCard } from '../BentoCard';
import { Eyebrow, Tick } from '../../atoms/Signature';

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

describe('GlassPanel', () => {
  it('renders children on the glass surface', () => {
    render(<GlassPanel aria-label="stats"><p>inside</p></GlassPanel>);
    const panel = screen.getByLabelText('stats');
    expect(panel).toHaveClass('glass');
    expect(screen.getByText('inside')).toBeInTheDocument();
  });

  it('renders the element passed in as', () => {
    const { container } = render(<GlassPanel as="figure" frame={false}>x</GlassPanel>);
    expect(container.querySelector('figure')).toHaveClass('glass');
  });
});

describe('SectionStage', () => {
  it('puts the art behind the content on the chosen side', () => {
    render(<SectionStage art="site-svc-ux" side="left"><p>content</p></SectionStage>);
    const art = screen.getByTestId('stage-art');
    expect(art).toHaveAttribute('aria-hidden', 'true');
    expect(art.className).toContain('left-[-30vw]');
    expect(art.className).toContain('site-svc-ux');
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

describe('SectionDivider', () => {
  it('shows index, title, caption and the counter', () => {
    render(<SectionDivider id="demos" index="01" total={3} title="Demos" caption="Try it" countLabel="Section" strip={1} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('01/Demos');
    expect(screen.getByText('Try it')).toBeInTheDocument();
    expect(screen.getByText('Section 01 / 03')).toBeInTheDocument();
  });
});

describe('Signature marks', () => {
  it('prefixes the eyebrow with //', () => {
    render(<Eyebrow>At a glance</Eyebrow>);
    expect(screen.getByText(/\/\/ At a glance/)).toBeInTheDocument();
  });

  it('draws a wide tick on request', () => {
    const { container } = render(<Tick wide />);
    expect(container.firstChild).toHaveClass('w-11');
  });
});

describe('BentoCard variant', () => {
  it('uses the glass surface for variant glass', () => {
    const { container } = render(<BentoCard variant="glass">x</BentoCard>);
    expect(container.firstChild).toHaveClass('glass');
    expect(container.firstChild).not.toHaveClass('bg-light-card');
  });
});
