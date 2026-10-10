import React from 'react';
import { render, screen } from '@testing-library/react';
import { BuildCard } from '../BuildCard';

const base = { title: 'Synthwerk', desc: 'AI services.', image: '/art/x.webp', tags: ['Go', 'ONNX'], privateLabel: 'Private repo' };

describe('BuildCard', () => {
  it('shows the group, title, tags and an external link', () => {
    render(<BuildCard {...base} group="flagship" href="https://github.com/x" linkLabel="On GitHub" />);
    expect(screen.getByText('Flagship')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Synthwerk' })).toBeInTheDocument();
    expect(screen.getByText('ONNX')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /On GitHub/ });
    expect(link).toHaveAttribute('href', 'https://github.com/x');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('says the repo is private when there is no link', () => {
    render(<BuildCard {...base} group="ops" />);
    expect(screen.getByText('Ops')).toBeInTheDocument();
    expect(screen.getByText('Private repo')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('keeps the render decorative', () => {
    const { container } = render(<BuildCard {...base} group="lab" />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
