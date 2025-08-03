import { useEffect, useState } from 'react';

export default function PromptManager() {
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['prompts'], (result) => {
      setPrompts(result.prompts || []);
    });
  }, []);

  const aggiornaPrompt = (index: number, nuovo: string) => {
    const aggiornati = [...prompts];
    aggiornati[index] = nuovo;
    setPrompts(aggiornati);
    chrome.storage.local.set({ prompts: aggiornati });
  };

  const aggiungiPrompt = () => {
    const aggiornati = [...prompts, ''];
    setPrompts(aggiornati);
    chrome.storage.local.set({ prompts: aggiornati });
  };

  return (
    <div>
      <h2>Prompt</h2>
      {prompts.map((prompt, i) => (
        <input
          key={i}
          value={prompt}
          onChange={(e) => aggiornaPrompt(i, e.target.value)}
          style={{ display: 'block', marginBottom: '6px' }}
        />
      ))}
      <button onClick={aggiungiPrompt}>+ Nuovo Prompt</button>
    </div>
  );
}
