import { render, screen, fireEvent, act } from '@testing-library/react';
import ContactContent from './ContactContent';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockLocalePush = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockLocalePush, replace: jest.fn() }),
  usePathname: () => '/contact',
}));

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const fn = (key: string, params?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'contact.title': 'Contact',
        'contact.subtitle': 'Get in touch',
        'contact.intro': 'Intro text',
        'contact.nameLabel': 'Name',
        'contact.namePlaceholder': 'Your name',
        'contact.emailLabel': 'Email',
        'contact.emailPlaceholder': 'you@example.com',
        'contact.messageLabel': 'Message',
        'contact.messagePlaceholder': 'Your message',
        'contact.submitButton': 'Send',
        'contact.submitting': 'Sending...',
        'contact.nameError': 'Please enter at least 2 characters',
        'contact.emailError': 'Please enter a valid email address',
        'contact.messageError': 'Please enter at least 10 characters',
        'contact.tooLongError': `Please enter at most ${params?.max} characters`,
        'contact.serverFieldError': 'Please check this field',
        'contact.successHeading': 'Message sent',
        'contact.successDescription': 'Thanks for reaching out.',
        'contact.redirecting': `Redirecting in ${params?.seconds ?? 5}s...`,
        'contact.successMessage': 'Success',
        'contact.errorMessage': 'Error',
        'contact.errorDetailed': 'Something went wrong.',
        'contact.emailLink': 'email@test.com',
        'contact.linkedinLink': 'LinkedIn',
        'contact.githubLink': 'GitHub',
      };
      return map[key] ?? key;
    };
    return fn;
  },
}));

jest.mock('@/components/molecules/SectionHeader', () => ({
  SectionHeader: () => <div>SectionHeader</div>,
}));

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/atoms/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('ContactContent validation', () => {
  it('shows name error on blur when name is too short', () => {
    render(<ContactContent />);
    const nameInput = screen.getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'A', name: 'name' } });
    fireEvent.blur(nameInput);
    expect(screen.getByText('Please enter at least 2 characters')).toBeInTheDocument();
  });

  it('shows email error on blur for invalid email', () => {
    render(<ContactContent />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'bad@', name: 'email' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows no error for valid input', () => {
    render(<ContactContent />);
    const nameInput = screen.getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'Velimir', name: 'name' } });
    fireEvent.blur(nameInput);
    expect(screen.queryByText('Please enter at least 2 characters')).not.toBeInTheDocument();
  });
});

describe('ContactContent shares the API schema', () => {
  const fillValid = () => {
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Velimir', name: 'name' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'v@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Your message'), {
      target: { value: 'A sufficiently long message.', name: 'message' },
    });
  };

  beforeEach(() => {
    global.fetch = jest.fn() as jest.Mock;
  });

  it('shows a field error for a 5001-character message and sends no request', async () => {
    render(<ContactContent />);
    fillValid();
    const message = screen.getByPlaceholderText('Your message');
    fireEvent.change(message, { target: { value: 'a'.repeat(5001), name: 'message' } });
    fireEvent.blur(message);

    expect(screen.getByText('Please enter at most 5000 characters')).toBeInTheDocument();
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    await act(async () => {
      fireEvent.submit(send.closest('form')!);
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows every field reason when an invalid form is submitted', async () => {
    render(<ContactContent />);
    await act(async () => {
      fireEvent.submit(screen.getByPlaceholderText('Your name').closest('form')!);
    });
    expect(screen.getByText('Please enter at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Please enter at least 10 characters')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('checks the trimmed value, as the API does', () => {
    render(<ContactContent />);
    const name = screen.getByPlaceholderText('Your name');
    fireEvent.change(name, { target: { value: '  A  ', name: 'name' } });
    fireEvent.blur(name);
    expect(screen.getByText('Please enter at least 2 characters')).toBeInTheDocument();
  });

  it('shows the field the API refused and clears it when the field changes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'email: Invalid email', field: 'email' }),
    });
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<ContactContent />);
    fillValid();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    });

    expect(screen.getByText('Please check this field')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'w@example.com', name: 'email' } });
    expect(screen.queryByText('Please check this field')).not.toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('ContactContent success redirect', () => {
  beforeEach(() => {
    mockLocalePush.mockClear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('redirects home via the locale-aware router after the countdown', async () => {
    jest.useFakeTimers();
    render(<ContactContent />);

    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Velimir', name: 'name' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'v@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your message'), {
      target: { value: 'A sufficiently long message.', name: 'message' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    });

    expect(screen.getByText('Message sent')).toBeInTheDocument();

    // Countdown ticks once per second; after 5 ticks it must push the
    // locale-aware home route (staying on the visitor's language).
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }

    expect(mockLocalePush).toHaveBeenCalledWith('/');
  });
});
