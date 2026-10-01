import "@testing-library/jest-dom";

// Next 14 ships its own React canary for the App Router, which has
// useFormStatus; the stable react-dom 18.3 Jest resolves does not.
// Tests that need a pending form override this mock locally.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: jest.fn(() => ({ pending: false })),
}));
