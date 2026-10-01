import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// The site key is read at module load, so it must be set before the import below.
process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY = 'test-sitekey';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/contact',
}));
jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
jest.mock('@/components/molecules/SectionHeader', () => ({ SectionHeader: () => null }));
jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/atoms/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

const execute = jest.fn();
let mounted = 0;
let failLoads = 1; // the first load fails, see the retry test
jest.mock('@hcaptcha/react-hcaptcha', () => {
  // A throwing factory rejects the dynamic import(), like a failed chunk load.
  // Jest does not cache a module whose factory threw, so the next import() succeeds.
  if (failLoads > 0) {
    failLoads -= 1;
    throw new Error('chunk load failed');
  }
  const R = jest.requireActual('react') as typeof React;
  const Fake = R.forwardRef(function Fake(props: { onLoad?: () => void }, ref: React.Ref<unknown>) {
    R.useImperativeHandle(ref, () => ({ execute }));
    R.useEffect(() => {
      mounted += 1;
      props.onLoad?.();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div data-testid="hcaptcha" />;
  });
  return { __esModule: true, default: Fake };
});

// Imported after the site key is set (static imports would be hoisted above it).
let ContactContent: React.ComponentType;
beforeAll(async () => {
  ContactContent = (await import('./ContactContent')).default;
});

const fill = () => {
  fireEvent.change(screen.getByLabelText(/contact.nameLabel/), { target: { name: 'name', value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText(/contact.emailLabel/), { target: { name: 'email', value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText(/contact.messageLabel/), {
    target: { name: 'message', value: 'Hello, I would like to work with you.' },
  });
};

describe('ContactContent hCaptcha loading', () => {
  beforeEach(() => {
    execute.mockClear();
    mounted = 0;
  });

  // Must run before any other test loads @hcaptcha/react-hcaptcha (see the mock).
  it('tries again on the next Send when loading hCaptcha failed', async () => {
    render(<ContactContent />);
    fill();
    const form = () => screen.getByLabelText(/contact.nameLabel/).closest('form')!;
    await act(async () => {
      fireEvent.submit(form());
    });
    await act(async () => {});
    expect(screen.getByText('contact.errorMessage')).toBeInTheDocument();
    expect(screen.queryByTestId('hcaptcha')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.submit(form());
    });
    await act(async () => {});
    expect(screen.getByTestId('hcaptcha')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('does not load hCaptcha on page view', async () => {
    render(<ContactContent />);
    await act(async () => {});
    expect(screen.queryByTestId('hcaptcha')).not.toBeInTheDocument();
    expect(mounted).toBe(0);
  });

  it('loads hCaptcha on the first send and runs the challenge once it is ready', async () => {
    render(<ContactContent />);
    fill();
    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/contact.nameLabel/).closest('form')!);
    });
    await act(async () => {});
    expect(screen.getByTestId('hcaptcha')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
