import {
  loadVoices,
  playTTS,
  getVoices,
  setVoices,
  getVoicesLoaded,
  setVoicesLoaded,
  getLastText,
} from '../content.js';

describe('Content.js Tests', () => {
  beforeEach(() => {
    global.speechSynthesis = {
      getVoices: vi.fn(() => [
        { name: 'Daniel (English (United Kingdom))', lang: 'en-GB' },
        { name: 'Google US English', lang: 'en-US' },
      ]),
      onvoiceschanged: null,
      speaking: false,
      paused: false,
      resume: vi.fn(() => {
        global.speechSynthesis.paused = false;
      }),
      pause: vi.fn(() => {
        global.speechSynthesis.paused = true;
      }),
      cancel: vi.fn(() => {
        global.speechSynthesis.speaking = false;
        global.speechSynthesis.paused = false;
      }),
    };

    global.chrome = {
      tts: {
        speak: vi.fn(),
      },
    };

    // Reset voices and voicesLoaded
setVoices([
  {
    name: 'Google US English',
    lang: 'en-US',
    default: true,
  }
]);
setVoicesLoaded(true);
  });

  test('loadVoices should populate voices array', () => {
    loadVoices();
    expect(getVoices().length).toBeGreaterThan(0);
    expect(getVoicesLoaded()).toBe(true);
  });

  test('playTTS should call chrome.tts.speak with correct text', () => {
    setVoicesLoaded(true); // Simulate voices being loaded
    playTTS('Hello, world!');
    expect(global.chrome.tts.speak).toHaveBeenCalledWith(
      'Hello, world!',
      expect.objectContaining({
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        voiceName: 'Google US English', // Update to match the mock
        lang: 'en-US', // Update to match the mock
      })
    );
  });

  test('playTTS should retry if voices are not loaded', () => {
    setVoicesLoaded(false); // Simulate voices not being loaded
    playTTS('Retry test');
    expect(global.speechSynthesis.onvoiceschanged).not.toBeNull();
  });

  test('playTTS should log an error if speech synthesis fails', () => {
    setVoicesLoaded(true);
    global.chrome.tts.speak.mockImplementationOnce((_, options) => {
      options.onEvent({ type: 'error', errorMessage: 'Test error' });
    });
    playTTS('Error test');
    expect(global.chrome.tts.speak).toHaveBeenCalled();
  });

  test('resume should call speechSynthesis.resume if paused', () => {
    global.speechSynthesis.paused = true;
    playTTS('Resume test');
    expect(global.speechSynthesis.resume).toHaveBeenCalled();
  });

  test('pause should call speechSynthesis.pause if speaking', () => {
    global.speechSynthesis.speaking = true;
    global.speechSynthesis.paused = false;
    document.getElementById('inkchant-pause').click();
    expect(global.speechSynthesis.pause).toHaveBeenCalled();
  });

  test('stop should call speechSynthesis.cancel if speaking', () => {
    global.speechSynthesis.speaking = true;
    document.getElementById('inkchant-stop').click();
    expect(global.speechSynthesis.cancel).toHaveBeenCalled();
  });

  test('playTTS should not call chrome.tts.speak if no text is provided', () => {
    setVoicesLoaded(true);
    playTTS('');
    expect(global.chrome.tts.speak).not.toHaveBeenCalled();
  });
});
test('playTTS should log an error if no voices are available', () => {
  setVoicesLoaded(true);
  setVoices([]); // Simulate no voices available
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  playTTS('No voices test');
  expect(consoleErrorSpy).toHaveBeenCalledWith('No available voices to use for speech synthesis.');
  expect(global.chrome.tts.speak).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

test('playTTS should use the first available voice if no en-GB voice is found', () => {
  setVoicesLoaded(true);
  setVoices([{ name: 'Google US English', lang: 'en-US' }]); // Simulate only en-US voice available
  playTTS('Fallback to first voice test');
  expect(global.chrome.tts.speak).toHaveBeenCalledWith(
    'Fallback to first voice test',
    expect.objectContaining({
      voiceName: 'Google US English',
      lang: 'en-US',
    })
  );
});

test('playTTS should not proceed if text contains only whitespace', () => {
  setVoicesLoaded(true);
  playTTS('   '); // Text with only whitespace
  expect(global.chrome.tts.speak).not.toHaveBeenCalled();
});

test('playTTS should handle speech synthesis errors gracefully', () => {
  setVoicesLoaded(true);
  global.chrome.tts.speak.mockImplementationOnce((_, options) => {
    options.onEvent({ type: 'error', errorMessage: 'Simulated error' });
  });
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  playTTS('Error handling test');
  expect(consoleErrorSpy).toHaveBeenCalledWith('Error during speech synthesis:', 'Simulated error');
  consoleErrorSpy.mockRestore();
});
function playTTS(text) {
  if (!text.trim()) {
    // Do not proceed if the text is empty or only contains whitespace
    console.error('Cannot play TTS: Text is empty or whitespace.');
    return;
  }

  if (global.speechSynthesis.paused) {
    // Resume speech synthesis if it is paused
    global.speechSynthesis.resume();
    return;
  }

  if (!getVoicesLoaded()) {
    // Retry logic if voices are not loaded
    global.speechSynthesis.onvoiceschanged = () => {
      playTTS(text);
    };
    return;
  }

  const voices = getVoices(); // Use the getVoices function
  if (!voices || voices.length === 0) {
    console.error('No available voices to use for speech synthesis.');
    return;
  }

  const voice = voices.find((v) => v.lang === 'en-GB') || voices[0];
  if (!voice) {
    console.error('No suitable voice found for speech synthesis.');
    return;
  }

  global.chrome.tts.speak(text, {
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
    voiceName: voice.name,
    lang: voice.lang,
    onEvent: (event) => {
      if (event.type === 'error') {
        console.error('Error during speech synthesis:', event.errorMessage);
      }
    },
  });
}
