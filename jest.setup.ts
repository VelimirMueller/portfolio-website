import "@testing-library/jest-dom";

// useFormStatus is stubbed so components that read it render without a
// surrounding form action. Tests that need a pending form override this mock
// locally.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: jest.fn(() => ({ pending: false })),
}));

// jsdom has no canvas and logs "Not implemented" for getContext. Decorative
// canvases (the KPI starfield) treat a null context as "don't draw".
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];
}
