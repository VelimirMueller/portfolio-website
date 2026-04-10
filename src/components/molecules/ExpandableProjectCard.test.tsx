import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableProjectCard } from './ExpandableProjectCard';

const props = {
  title: 'CRM Dashboard',
  category: 'Enterprise SaaS',
  techStack: ['React', 'TypeScript'],
  metricValue: '3-4x',
  metricLabel: 'Faster',
  challenge: 'Manual workflows',
  solution: 'Built drag-and-drop pipeline',
  impacts: [
    { value: '3-4x', label: 'Faster Assignment' },
    { value: '11%', label: 'Conversion' },
  ],
  demoHref: '/projects/dashboard-demo',
  demoLabel: 'View Live Demo',
  accentColor: 'blue' as const,
};

describe('ExpandableProjectCard', () => {
  it('renders collapsed state with title and metric', () => {
    render(<ExpandableProjectCard {...props} />);
    expect(screen.getByText('CRM Dashboard')).toBeInTheDocument();
    expect(screen.getByText('3-4x')).toBeInTheDocument();
    expect(screen.queryByText('Manual workflows')).not.toBeInTheDocument();
  });

  it('expands on click to show challenge and solution', () => {
    render(<ExpandableProjectCard {...props} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Manual workflows')).toBeInTheDocument();
    expect(screen.getByText('Built drag-and-drop pipeline')).toBeInTheDocument();
  });

  it('has correct aria-expanded attribute', () => {
    render(<ExpandableProjectCard {...props} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders demo link when expanded', () => {
    render(<ExpandableProjectCard {...props} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('link', { name: /view live demo/i })).toHaveAttribute('href', '/projects/dashboard-demo');
  });
});
