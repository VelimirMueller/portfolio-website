import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ExperienceTimeline, type ExperienceEntry } from '../ExperienceTimeline';

const entries: ExperienceEntry[] = [
  { id: 'exp1', title: 'Senior Engineer', tag: 'Startup', company: 'ACME', date: '2025 - Present', desc: 'Builds things.' },
  { id: 'exp2', title: 'Engineer', tag: 'Agency', company: 'Initech', date: '2022 - 2025', desc: 'Built things.' },
  { id: 'exp3', title: 'Junior Engineer', tag: 'Corp', company: 'Globex', date: '2020 - 2022', desc: 'Learned things.' },
];

describe('ExperienceTimeline', () => {
  it('renders one entry with a node per experience', () => {
    render(<ExperienceTimeline entries={entries} currentLabel="Current" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByTestId('timeline-node')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Initech')).toBeInTheDocument();
    expect(screen.getByText('2020 - 2022').tagName).toBe('TIME');
  });

  it('marks only the first entry as the current role', () => {
    render(<ExperienceTimeline entries={entries} currentLabel="Current" />);
    const [first, ...rest] = screen.getAllByRole('listitem');
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(within(first).getByText('Current')).toBeInTheDocument();
    rest.forEach((item) => expect(item).not.toHaveAttribute('aria-current'));
    expect(screen.getAllByText('Current')).toHaveLength(1);
  });

  it('pulses only the current node, and only when motion is allowed', () => {
    render(<ExperienceTimeline entries={entries} currentLabel="Current" />);
    const [currentNode, otherNode] = screen.getAllByTestId('timeline-node');
    expect(currentNode.querySelector('.motion-safe\\:animate-ping')).not.toBeNull();
    expect(otherNode.querySelector('[class*="animate-"]')).toBeNull();
  });

  it('alternates sides on desktop and puts the copy on glass cards', () => {
    render(<ExperienceTimeline entries={entries} currentLabel="Current" />);
    expect(screen.getAllByRole('listitem')[0].className).toContain('md:odd:flex-row-reverse');
    expect(screen.getByText('Builds things.').parentElement).toHaveClass('glass-inner');
  });

  it('renders an empty list when there are no entries', () => {
    render(<ExperienceTimeline entries={[]} currentLabel="Current" />);
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });
});
