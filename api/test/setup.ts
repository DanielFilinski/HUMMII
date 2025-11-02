import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Global test timeout
jest.setTimeout(30000);

// Mock console to reduce noise in test output
const originalConsole = global.console;

global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for important messages
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// Restore console after all tests
afterAll(() => {
  global.console = originalConsole;
});

