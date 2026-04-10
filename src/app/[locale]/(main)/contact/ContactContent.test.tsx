import { render, screen, fireEvent } from '@testing-library/react';
import ContactContent from './ContactContent';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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
