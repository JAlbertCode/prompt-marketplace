// Jest setup file for PromptFlow

// Import extended jest matchers
import '@testing-library/jest-dom';

// Mock global environment variables
process.env.NEXT_PUBLIC_PRODUCT_NAME = 'PromptFlow';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Mock fetch API
global.fetch = jest.fn();

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
  },
  writable: true,
});

// Mock for IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Suppress console errors/warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (args[0]?.includes && args[0].includes('Warning: ReactDOM.render')) {
    return;
  }
  if (args[0]?.includes && args[0].includes('Error: Not implemented')) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (args[0]?.includes && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleWarn(...args);
};

// Clean up mocks after tests
afterEach(() => {
  jest.clearAllMocks();
});

// Restore original console behavior after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
