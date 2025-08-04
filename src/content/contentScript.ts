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
  const html = text.replace(/\n/g, "<br>");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Inserisce ogni nodo convertito
  while (tempDiv.firstChild) {
    target.appendChild(tempDiv.firstChild);
  }

  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  console.log(`Testo inserito alla fine di #${targetId}:`, text);
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

  const html = newText.replace(/\n/g, "<br>");
  target.innerHTML = html;

  console.log(`Nuovo contenuto di #${targetId} sovrascritto.`);
}

/**
 * Aggiunge un listener per i messaggi dal popup.
 * Quando riceve un messaggio, esegue l'azione specificata (inserisce o sovrascrive il testo).
 * @param request Oggetto contenente l'azione e il testo da gestire.
 * @returns {void}
 * @description Questo listener è attivo finché il content script è in esecuzione.
 * Può essere utilizzato per comunicare tra il popup e il content script.
 */
chrome.runtime.onMessage.addListener(async (request: { action: string; text?: string }) => {
  if (!request || !request.action) {
    console.warn("Richiesta non valida o senza azione.");
    return;
  }
  console.log("MESSAGGIO RICEVUTO DAL POPUP:");
  console.table([request]);
  if (request.text) {
    const textToInsert = request.text;
    switch (request.action) {
      case "insert":
        insertTextAtEndOfTarget("prompt-textarea", textToInsert);
        break;
      case "overwrite":
        overwriteContent("prompt-textarea", textToInsert);
        break;
      default:
        console.warn(`Azione sconosciuta: ${request.action}`);
        break;
    }
  } else {
    console.warn("Richiesta senza testo da inserire.");
  }
});
