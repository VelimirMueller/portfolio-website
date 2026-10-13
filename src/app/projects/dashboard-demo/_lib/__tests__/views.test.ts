import { findView, VIEWS } from '../views';

describe('findView', () => {
  it('finds each view by id', () => {
    for (const view of VIEWS) expect(findView(view.id)).toBe(view);
    expect(findView('pipeline').title).toBe('Sales Pipeline');
  });

  it('falls back to the dashboard for an unknown id', () => {
    expect(findView('unknown').id).toBe('dashboard');
  });
});
