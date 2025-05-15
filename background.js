chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "lavenderRead",
        title: "Read from Here with Lavender",
        contexts: ["selection", "page"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lavenderRead") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (selectedText) => {
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

                let text = getTextFromSelectionOrPage(selectedText).trim();
                if (!text) return;

                const utterance = new SpeechSynthesisUtterance(text);
                const voices = speechSynthesis.getVoices();
                const bestVoice =
                    voices.find(v => v.name.toLowerCase().includes("moira")) ||
                    voices.find(v => /siri|google|zira|david|neural/i.test(v.name)) ||
                    voices.find(v => v.lang.startsWith('en')) ||
                    voices[0];

                utterance.voice = bestVoice;
                utterance.rate = 1.2;
                utterance.pitch = 1.0;

                window.currentUtterance = utterance;
                speechSynthesis.cancel();
                speechSynthesis.speak(utterance);
            },
            args: [info.selectionText || ""]
        });
    }
});