// Context Menu Item Script
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "inkchantRead",
        title: "Read from Here with Inkchant",
        contexts: ["page", "selection"], 
    });
});

// Context Menu Click Handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Checks if the clicked menu item is the one we created
    if (info.menuItemId === "inkchantRead") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (selectedText) => {
                // Function to get all text nodes in the document
                function getAllTextNodes(node) {
                    let walker = document.createTreeWalker(
                        node,
                        NodeFilter.SHOW_TEXT,
                        {
                            acceptNode: function(node) {
                                if (!node.parentElement || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                                const style = window.getComputedStyle(node.parentElement);
                                return (style && style.display !== "none" && style.visibility !== "hidden")
                                    ? NodeFilter.FILTER_ACCEPT
                                    : NodeFilter.FILTER_REJECT;
                            }
                        }
                    );
                    let textNodes = [];
                    let n;
                    while (n = walker.nextNode()) {
                        textNodes.push(n);
                    }
                    return textNodes;
                }

                // Function to get text from selection or the whole page
                function getTextFromSelectionOrPage(selectedText) {
                    if (selectedText) {
                        // Find the selected text in the page and get everything after it
                        const allText = getAllTextNodes(document.body).map(n => n.nodeValue).join(" ");
                        const idx = allText.indexOf(selectedText);
                        if (idx !== -1) {
                            return allText.slice(idx);
                        }
                        return selectedText;
                    } else {
                        // No selection: read the whole page
                        return getAllTextNodes(document.body).map(n => n.nodeValue).join(" ");
                    }
                }

                function speakWithBestVoice(text) {
                    const voices = speechSynthesis.getVoices(); 
                    const bestVoice =
                        voices.find(v => v.name.toLowerCase().includes("moira")) ||
                        voices.find(v => /siri|google|zira|david|neural/i.test(v.name)) ||
                        voices.find(v => v.lang.startsWith('en')) ||
                        voices[0];

                    const utterance = new SpeechSynthesisUtterance(text);
                    if (bestVoice) utterance.voice = bestVoice;
                    utterance.rate = 0.95;
                    utterance.pitch = 1.0;

                    window.currentUtterance = utterance;
                    speechSynthesis.cancel();
                    speechSynthesis.speak(utterance);
                }

                let text = getTextFromSelectionOrPage(selectedText).trim();
                if (!text) return;

                if (speechSynthesis.getVoices().length === 0) {
                    speechSynthesis.onvoiceschanged = () => {
                        speakWithBestVoice(text);
                    };
                } else {
                    speakWithBestVoice(text);
                }
            },
            args: [info.selectionText || ""]
        });
    }
});