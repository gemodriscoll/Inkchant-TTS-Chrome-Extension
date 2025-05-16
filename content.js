if (!document.getElementById("inkchant-widget")) {
  const pauseImg = chrome.runtime.getURL("icons/pause.png");
  const playImg = chrome.runtime.getURL("icons/play.png");
  const stopImg = chrome.runtime.getURL("icons/stop.png");
  const headerImg = chrome.runtime.getURL("icons/icon.png");

  let audio = null;

  // Create the widget
  const widget = document.createElement("div");
  widget.id = "inkchant-widget";
  widget.innerHTML = `
    <div id="inkchant-widget-header" style="display: flex; justify-content: center; align-items: center;">
      <img src="${headerImg}" alt="Header" style="height:96px;">
    </div>
    <textarea id="inkchant-input" placeholder="Enter text to read..." rows="3" style="width: 90%; margin: 8px auto; display: block;"></textarea>
    <div id="inkchant-controls">
      <button id="inkchant-resume" class="inkchant-btn" title="Play/Resume">
        <img src="${playImg}" alt="Play" style="width:64px;height:64px;">
      </button>
      <button id="inkchant-pause" class="inkchant-btn" title="Pause">
        <img src="${pauseImg}" alt="Pause" style="width:64px;height:64px;">
      </button>
      <button id="inkchant-stop" class="inkchant-btn" title="Stop">
        <img src="${stopImg}" alt="Stop" style="width:64px;height:64px;">
      </button>
    </div>
  `;
  document.body.appendChild(widget);

  // Dragging logic (same as before)
  let isDragging = false, offsetX = 0, offsetY = 0;
  const header = widget.querySelector("#inkchant-widget-header");

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
    }
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // Touch support
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
      e.preventDefault();
    }
  });

  document.addEventListener("touchend", () => isDragging = false);

  // 🔊 Fetch and play TTS from OpenAI
  async function playTTS(text) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": "Bearer REPLACE_WITH",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",           
        voice: "nova",            
        input: text
      })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (audio) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    }

    audio = new Audio(audioUrl);
    audio.play();
  }

  // 🎛 Button actions
  document.getElementById("inkchant-resume").addEventListener("click", () => {
    const text = document.getElementById("inkchant-input").value.trim();
    if (!text) return;

    // If audio exists and is paused, resume it
    if (audio && audio.paused) {
      audio.play();
    } else {
      playTTS(text);
    }
  });

  document.getElementById("inkchant-pause").addEventListener("click", () => {
    if (audio) audio.pause();
  });

  document.getElementById("inkchant-stop").addEventListener("click", () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}
