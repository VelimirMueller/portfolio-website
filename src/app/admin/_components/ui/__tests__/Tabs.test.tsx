import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs, type TabItem } from '../Tabs';

type Demo = 'one' | 'two' | 'three';

const tabs: TabItem<Demo>[] = [
  { key: 'one', label: 'One', content: <p>one body</p> },
  { key: 'two', label: 'Two', content: <p>two body</p> },
  { key: 'three', label: 'Three', content: <p>three body</p> },
];

function DemoTabs({ value, onChange }: { value: Demo; onChange: (v: Demo) => void }) {
  return <Tabs tabs={tabs} value={value} onChange={onChange} label="Demo tabs" id="demo" />;
}

/** The tabs are controlled; the keyboard moves the selection only when the owner follows it. */
function StatefulTabs({ initial = 'one' }: { initial?: Demo }) {
  const [value, setValue] = useState<Demo>(initial);
  return <DemoTabs value={value} onChange={setValue} />;
}

describe('Tabs', () => {
  it('renders a labelled tablist with tab/tabpanel wiring', () => {
    render(<DemoTabs value="one" onChange={jest.fn()} />);
    const list = screen.getByRole('tablist', { name: 'Demo tabs' });
    expect(list).toBeInTheDocument();
    const one = screen.getByRole('tab', { name: 'One' });
    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(one).toHaveAttribute('aria-controls', 'demo-panel-one');
    const panel = screen.getByRole('tabpanel', { name: 'One' });
    expect(panel).toHaveAttribute('id', 'demo-panel-one');
    expect(panel).toHaveAttribute('aria-labelledby', 'demo-tab-one');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows only the selected panel; the others stay mounted but hidden', () => {
    render(<DemoTabs value="two" onChange={jest.fn()} />);
    expect(screen.getByText('two body')).toBeVisible();
    expect(screen.getByText('one body').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
    expect(screen.getByText('three body').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
  });

  it('selects a tab on click', () => {
    const onChange = jest.fn();
    render(<DemoTabs value="one" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Three' }));
    expect(onChange).toHaveBeenCalledWith('three');
  });

  it('moves selection and focus with ArrowLeft/ArrowRight, wrapping around', () => {
    render(<StatefulTabs />);
    const one = screen.getByRole('tab', { name: 'One' });
    expect(one).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    const two = screen.getByRole('tab', { name: 'Two' });
    expect(two).toHaveAttribute('tabindex', '0');
    expect(two).toHaveFocus();
    fireEvent.keyDown(two, { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Three' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('tabindex', '0');
  });

  it('jumps with Home and End', () => {
    render(<StatefulTabs initial="two" />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Two' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus();
  });

  it('ignores other keys', () => {
    const onChange = jest.fn();
    render(<DemoTabs value="one" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
