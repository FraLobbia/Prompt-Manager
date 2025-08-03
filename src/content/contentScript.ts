console.log("Content script statico caricato");

function insertTextAtEndOfTarget(targetId: string, text: string) {
  const target = document.getElementById(targetId);
  if (!target || !target.isContentEditable) {
    console.warn(`Elemento #${targetId} non trovato o non è contenteditable`);
    return;
  }

  const textNode = document.createTextNode(text);
  target.appendChild(textNode);

  const range = document.createRange();
  range.setStartAfter(textNode);
  range.collapse(true);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  console.log(`Testo inserito alla fine di #${targetId}: "${text}"`);
}

function overwriteContent(targetId: string, newText: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    console.warn(`Elemento #${targetId} non trovato`);
    return;
  }

  console.log(`Vecchio contenuto di #${targetId}:`, target.textContent);
  target.textContent = newText;
  console.log(`Nuovo contenuto di #${targetId} inserito.`);
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "insertPrompt" && request.text) {
    console.log("Ricevuto messaggio insertPrompt con testo:", request.text);
    insertTextAtEndOfTarget("prompt-textarea", request.text);
  } else if (request.action === "overwritePrompt" && request.text) {
    console.log("Ricevuto messaggio overwritePrompt con testo:", request.text);
    overwriteContent("prompt-textarea", request.text);
  }
});
