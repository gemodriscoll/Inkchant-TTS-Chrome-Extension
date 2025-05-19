import { loadVoices, playTTS, voices, voicesLoaded, lastText } from './content.js';

describe('Content.js Tests', () => 
{
  beforeEach(() => 
  {
    // Mock speechSynthesis and its methods
    global.speechSynthesis = {
      getVoices: jest.fn(() => [
        { name: 'Daniel (English (United Kingdom))', lang: 'en-GB' },
        { name: 'Google US English', lang: 'en-US' }
      ]),
      speak: jest.fn(),
      onvoiceschanged: null,
    };
  });

  test('loadVoices should populate voices array', () => 
  {
    loadVoices();
    expect(voices.length).toBeGreaterThan(0);
    expect(voicesLoaded).toBe(true);
  });

  test('playTTS should call speechSynthesis.speak with correct utterance', () => 
  {
    loadVoices(); // Ensure voices are loaded
    playTTS('Hello, world!');
    expect(lastText).toBe('Hello, world!');
    expect(global.speechSynthesis.speak).toHaveBeenCalled();
  });

  test('playTTS should retry if voices are not loaded', () => 
  {
    voicesLoaded = false; // Simulate voices not being loaded
    playTTS('Retry test');
    expect(global.speechSynthesis.onvoiceschanged).not.toBeNull();
  });
});