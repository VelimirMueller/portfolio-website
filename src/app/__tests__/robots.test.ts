import robots from '../robots';

describe('robots', () => {
  const result = robots();

  it('allows all crawlers on the site root', () => {
    expect(result.rules).toMatchObject({ userAgent: '*', allow: '/' });
  });

  it('disallows the interactive demo pages', () => {
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules.disallow).toContain('/projects/dashboard-demo');
  });

  it('points to an absolute sitemap URL', () => {
    expect(result.sitemap).toMatch(/^https:\/\/.+\/sitemap\.xml$/);
  });
});
