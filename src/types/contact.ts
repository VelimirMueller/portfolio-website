export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export type ContactFormStatus = 'success' | 'error' | null;

export interface FieldValidation {
  touched: boolean;
  error: string | null;
}

export type ValidationState = Record<keyof ContactFormData, FieldValidation>;
