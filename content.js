if (!document.getElementById("lavender-widget")) {
  const pauseImg = chrome.runtime.getURL("icons/pause.png");
  const playImg = chrome.runtime.getURL("icons/play.png");
  const stopImg = chrome.runtime.getURL("icons/stop.png");
  const headerImg = chrome.runtime.getURL("icons/icon.png");

  const widget = document.createElement("div");
  widget.id = "lavender-widget";
  widget.innerHTML = `
    <div id="lavender-widget-header" style="display: flex; justify-content: center; align-items: center;">
      <img src="${headerImg}" alt="Header" style="height:96px;">
    </div>
    <div id="lavender-controls">
      <button id="lavender-pause" class="lavender-btn" title="Pause">
        <img src="${pauseImg}" alt="Pause" style="width:64px;height:64px;">
      </button>
      <button id="lavender-resume" class="lavender-btn" title="Resume">
        <img src="${playImg}" alt="Resume" style="width:64px;height:64px;">
      </button>
      <button id="lavender-stop" class="lavender-btn" title="Stop">
        <img src="${stopImg}" alt="Stop" style="width:64px;height:64px;">
      </button>
    </div>
  `;
  document.body.appendChild(widget);

  // Dragging
  let isDragging = false, offsetX = 0, offsetY = 0;
  const header = widget.querySelector("#lavender-widget-header");

  // Mouse events
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

  // Touch events
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

  // Button events
  document.getElementById("lavender-pause").addEventListener("click", () => speechSynthesis.pause());
  document.getElementById("lavender-resume").addEventListener("click", () => speechSynthesis.resume());
  document.getElementById("lavender-stop").addEventListener("click", () => speechSynthesis.cancel());
}