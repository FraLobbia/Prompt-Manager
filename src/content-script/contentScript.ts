import { insertTextAtEndOfTarget, overwriteContent } from "./_writeInput";

console.info("Content script statico caricato");

/**
 * Aggiunge un listener per le richieste inviate dal popup.
 * Quando riceve una richiesta, esegue l'azione specificata (inserisce o sovrascrive il testo).
 * @param request Oggetto contenente l'azione e il testo da gestire.
 * @description Questo listener è attivo finché il content script è in esecuzione.
 * Può essere utilizzato per comunicare tra il popup e il content script.
 */
chrome.runtime.onMessage.addListener(async (request: { action: string; text?: string }) => {
  if (!request || !request.action) {
    console.warn("Richiesta non valida o senza azione.");
    return;
  }
  console.debug("MESSAGGIO RICEVUTO DAL POPUP:");
  console.table([request]);

  const inputId = "prompt-textarea"; //TODO da settare nelle settings?? da valutare
  if (request.text) {
    const textToInsert = request.text;
    switch (request.action) {
      case "insert":
        insertTextAtEndOfTarget(inputId, textToInsert);
        break;
      case "overwrite":
        overwriteContent(inputId, textToInsert);
        break;
      default:
        console.warn(`Azione sconosciuta: ${request.action}`);
        break;
    }
  } else {
    console.warn("Richiesta senza testo da inserire.");
  }
});
