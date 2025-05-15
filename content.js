//Popup Control
window.addEventListener("message", (event) => {
    const command = event.data;

    if (command === "pause") {
        window.speechSynthesis.pause();
    } else if (command === "resume") {
        window.speechSynthesis.resume();
    } else if (command === "stop") {
        window.speechSynthesis.cancel();
    }
});