import { vi } from 'vitest';

// Mock chrome.runtime.getURL if not already mocked
global.chrome = global.chrome || {
  runtime: {
    getURL: (path) => `chrome-extension://mock-id/${path}`,
  },
};

// Mock speechSynthesis API
global.speechSynthesis = {
  onvoiceschanged: null,
  getVoices: vi.fn(() => [
    { name: 'Daniel (English (United Kingdom))', lang: 'en-GB' }, // Add this voice
    { name: 'Google US English', lang: 'en-US' },
  ]),
  speak: vi.fn ? vi.fn() : () => {},  // vi.fn if you use vi, else noop
  cancel: vi.fn ? vi.fn() : () => {},
  addEventListener: vi.fn ? vi.fn() : () => {},
  removeEventListener: vi.fn ? vi.fn() : () => {},
};
