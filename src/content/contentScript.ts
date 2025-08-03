
console.log("Content script statico caricato");

/**
 * Inserisce del testo alla fine di un elemento target.
 * @param targetId ID dell'elemento in cui inserire il testo.
 * @param text Testo da inserire.
 */
function insertTextAtEndOfTarget(targetId: string, text: string) {
  const target = document.getElementById(targetId);
  if (!target || !target.isContentEditable) {
    console.warn(`Elemento #${targetId} non trovato o non è contenteditable`);
    return;
  }
  target.focus();
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
/**
 * Sovrascrive il contenuto di un elemento con un nuovo testo.
 * @param targetId ID dell'elemento da modificare.
 * @param newText Nuovo testo da inserire.
 */
function overwriteContent(targetId: string, newText: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    console.warn(`Elemento #${targetId} non trovato`);
    return;
  }
  target.focus();
  console.log("SOVRASCRITTURA CONTENUTO:");
  console.table([{ "vecchio contenuto": target.textContent, "nuovo contenuto": newText }]);
  // Sostituisci il contenuto dell'elemento target con il nuovo testo
  target.textContent = newText;
  console.log(`Nuovo contenuto di #${targetId} sovrascritto.`);
}

chrome.runtime.onMessage.addListener(async (request) => {
  // Table log per visualizzare il messaggio ricevuto
  console.log("MESSAGGIO RICEVUTO DAL POPUP:");
  console.table([request]);
  if ((request.action === "insertPrompt" || request.action === "overwritePrompt") && request.text) {
    let textToInsert = request.text;
    // Se è richiesta la sostituzione con il contenuto degli appunti e il testo contiene il placeholder #clipboardcontent
    // allora leggo gli appunti e sostituisco il placeholder con il loro contenuto
    if (request.useClipboard && textToInsert.includes("#clipboardcontent")) {
      console.log("Rilevato #clipboardcontent, sostituendo con il contenuto degli appunti");
      try {
        const clipText = await navigator.clipboard.readText();
        textToInsert = textToInsert.replaceAll("#clipboardcontent", clipText);
      } catch (e) {
        console.error("Errore nella lettura clipboard nel content script:", e);
      }
    }

    if (request.action === "insertPrompt") {
      // Inserisce in coda
      insertTextAtEndOfTarget("prompt-textarea", textToInsert);
    } else {
      // Sovrascrive il contenuto
      overwriteContent("prompt-textarea", textToInsert);
    }
  }
});

