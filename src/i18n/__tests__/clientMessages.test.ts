import de from '@/locales/de.json';
import { pickClientMessages, CLIENT_NAMESPACES } from '../clientMessages';

describe('pickClientMessages', () => {
  const picked = pickClientMessages(de);

  it('keeps every namespace client components consume', () => {
    expect(Object.keys(picked).sort()).toEqual([...CLIENT_NAMESPACES].sort());
    expect(picked.nav).toEqual(de.nav);
    expect(picked.contact).toEqual(de.contact);
  });

  it('strips the server-only content namespaces from the client payload', () => {
    for (const heavy of ['home', 'about', 'services', 'serviceDetail', 'projects', 'privacy', 'imprint']) {
      expect(picked).not.toHaveProperty(heavy);
    }
  });

  it('shrinks the payload substantially', () => {
    const full = JSON.stringify(de).length;
    const slim = JSON.stringify(picked).length;
    expect(slim).toBeLessThan(full * 0.5);
  });
});
