if (!document.getElementById("inkchant-widget")) {
  // Image assets
  const pauseImg = chrome.runtime.getURL("icons/pause.png");
  const playImg = chrome.runtime.getURL("icons/play.png");
  const stopImg = chrome.runtime.getURL("icons/stop.png");
  const headerImg = chrome.runtime.getURL("icons/icon.png");

  // Audio object for playback control
  let audio = null;

  // Declare global variables
  let speechSynthesisUtterance = null;
  let lastText = ""; // Store the last text being read

  // Ensure voices are loaded before selecting one
  let voices = [];
  let voicesLoaded = false;

  // Function to load voices
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    voicesLoaded = true;
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
  }

  // Load voices when the event is triggered
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    loadVoices(); // Fallback for browsers that don't support the event
  }

  // Function to play text using the system's default voice
  function playTTS(text) {
    
      // Ensure voices are loaded before proceeding
        if (!voicesLoaded) {
          console.log("Voices not loaded yet. Waiting...");
          speechSynthesis.onvoiceschanged = () => {
            loadVoices();
            playTTS(text); // Retry playing the text after voices are loaded
        };
        return;
    }

    // Store the text being read
    const lastText = text;

    // Create a new utterance
    const speechSynthesisUtterance = new SpeechSynthesisUtterance(lastText);

    // Set properties for the utterance
    speechSynthesisUtterance.rate = 0.95; // Slightly slower for clarity
    speechSynthesisUtterance.pitch = 1.0; // Normal pitch
    speechSynthesisUtterance.volume = 1.0; // Full volume

    // Select a preferred voice
    const preferredVoice = voices.find(voice => voice.name === 'Daniel (English (United Kingdom)) (en-GB)'); // Change to your preferred voice
    if (preferredVoice) {
      speechSynthesisUtterance.voice = preferredVoice;
    }
    
    // Start speaking
    speechSynthesis.speak(speechSynthesisUtterance);
    }

  // Create the widget HTML
  const widget = document.createElement("div");
  widget.id = "inkchant-widget";
  widget.innerHTML = `
    <div id="inkchant-widget-header" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="inkchant-controls" style="display: flex; align-itmes: center; gap: 8px;">
        <button id="inkchant-resume" class="inkchant-btn" title="Play/Resume">
          <img src="${playImg}" alt="Play" style="width: 68px; height: 68px;">
        </button>
        <button id="inkchant-pause" class="inkchant-btn" title="Pause">
          <img src="${pauseImg}" alt="Pause" style="width: 68px; height: 68px;">
        </button>
        <button id="inkchant-stop" class="inkchant-btn" title="Stop"> 
          <img src="${stopImg}" alt="Stop" style="width: 68px; height: 68px;">
        </button>
        <button id="inkchant-close-btn" class="inkchant-btn" title="Close">x</button>
    </div>
  </div>
  `;
  document.body.appendChild(widget);

  // Create the small icon element
  const icon = document.createElement("img");
  icon.id = "inkchant-icon";
  icon.src = headerImg; // Use the icon.png
  icon.alt = "Inkchant Icon";
  icon.style = `
    display: none; 
    position: fixed; 
    bottom: 16px; 
    right: 16px; 
    width: 50px; 
    height: 50px; 
    cursor: pointer; 
    z-index: 1000;
  `;
  document.body.appendChild(icon);

  // Close button functionality
  document.getElementById("inkchant-close-btn").addEventListener("click", () => {
  widget.style.display = "none"; // Hide the widget
  icon.style.display = "block"; // Show the icon
  });

  // Icon click functionality to unhide the widget
  icon.addEventListener("click", () => {
  widget.style.display = "block"; // Show the widget
  icon.style.display = "none"; // Hide the icon
  });
  
  // Drag-and-drop functionality
  let isDragging = false, offsetX = 0, offsetY = 0;
  const header = widget.querySelector("#inkchant-widget-header");

  // Mouse drag
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - widget.getBoundingClientRect().left;
    offsetY = e.clientY - widget.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      widget.style.left = `${e.clientX - offsetX}px`;
      widget.style.top = `${e.clientY - offsetY}px`;
      widget.style.right = "auto"; 
      widget.style.bottom = "auto"; 
      widget.style.position = "fixed"; 
    }
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // Touch drag
  header.addEventListener("touchstart", (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - widget.getBoundingClientRect().left;
    offsetY = touch.clientY - widget.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      widget.style.left = `${touch.clientX - offsetX}px`;
      widget.style.top = `${touch.clientY - offsetY}px`;
      widget.style.right = "auto"; 
      widget.style.bottom = "auto"; 
      widget.style.position = "fixed"; 
      e.preventDefault();
    }
  });

  document.addEventListener("touchend", () => isDragging = false);

  // ▶️ Play / Resume
  document.getElementById("inkchant-resume").addEventListener("click", () => {
    // If paused, resume. Else, generate new speech.
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      console.log("Resumed speech synthesis");
    } else if (!speechSynthesis.speaking) {
      if (lastText) {
        playTTS(lastText); // Resume from the last text
      } else {
        console.log("No text to read");
      }
    }
  });

  // ⏸️ Pause
  document.getElementById("inkchant-pause").addEventListener("click", () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      console.log("Paused speech synthesis");
    }
  });

  // ⏹️ Stop
  document.getElementById("inkchant-stop").addEventListener("click", () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      console.log("Stopped speech synthesis");
    }
  });
}
