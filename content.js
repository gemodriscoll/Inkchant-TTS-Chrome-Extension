if (!document.getElementById("inkchant-widget")) {
  // Image assets
  const pauseImg = chrome.runtime.getURL("icons/pause.png");
  const playImg = chrome.runtime.getURL("icons/play.png");
  const stopImg = chrome.runtime.getURL("icons/stop.png");
  const headerImg = chrome.runtime.getURL("icons/icon.png");

  // Audio object for playback control
  let audio = null;

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

  // Close button functionality
  document.getElementById("inkchant-close-btn").addEventListener("click", () => {
    widget.style.display = "none";
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
      widget.style.right = "auto"; // Check this doesn't ninterfere with css padding
      widget.style.bottom = "auto"; // Check this doesn't interfere with css padding
      widget.style.position = "fixed"; // Check this doesn't interfere with css padding
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
      widget.style.right = "auto"; // Check this doesn't interfere with css padding
      widget.style.bottom = "auto"; // Check this doesn't interfere with css padding
      widget.style.position = "fixed"; // Check this doesn't interfere with css padding
      e.preventDefault();
    }
  });

  document.addEventListener("touchend", () => isDragging = false);

  // 🔊 Azure TTS playback
  async function playTTS(text) {
    const subscriptionKey = "YOUR_AZURE_SUBSCRIPTION_KEY"; // 🔥 Replace securely
    const region = "australiaeast"; // 🔥 Replace with your Azure region mine is "australiaeast" for example
    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice name='en-US-JennyNeural'>
          ${text}
        </voice>
      </speak>`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "Inkchant-Extension"
      },
      body: ssml
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure TTS Error:", err);
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (audio) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    }

    audio = new Audio(audioUrl);
    audio.play();
  }

  // ▶️ Play / Resume
  document.getElementById("inkchant-resume").addEventListener("click", () => {
    const text = document.getElementById("inkchant-input").value.trim();
    if (!text) return;

    // If paused, resume. Else, generate new.
    if (audio && audio.paused) {
      audio.play();
    } else {
      playTTS(text);
    }
  });

  // ⏸️ Pause
  document.getElementById("inkchant-pause").addEventListener("click", () => {
    if (audio) audio.pause();
  });

  // ⏹️ Stop
  document.getElementById("inkchant-stop").addEventListener("click", () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}
