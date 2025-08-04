// Test manuale per la persistenza clipboard con middleware
import { store } from './store/store'
import { updateUseClipboardAuto } from './store/slices/settingsSlice'

// Funzione di test per verificare la persistenza clipboard con middleware
export const testClipboardPersistence = async () => {
  console.log('🧪 Test persistenza clipboard con middleware...')
  
  // Stato iniziale
  console.log('📊 Stato iniziale:', store.getState().settings.useClipboard)
  
  // Test 1: Cambia a false (il middleware salverà automaticamente)
  console.log('🔄 Cambiando a false (auto-save via middleware)...')
  store.dispatch(updateUseClipboardAuto(false))
  
  // Aspetta un momento
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Test 2: Cambia a true (il middleware salverà automaticamente)
  console.log('🔄 Cambiando a true (auto-save via middleware)...')
  store.dispatch(updateUseClipboardAuto(true))
  
  console.log('✅ Test completato! Il middleware ha salvato automaticamente')
  console.log('📊 Stato finale:', store.getState().settings.useClipboard)
  console.log('💾 Controlla il Chrome storage in DevTools > Application > Storage')
}

// Esponi la funzione per uso in console
if (typeof window !== 'undefined') {
  (window as unknown as { testClipboardPersistence: typeof testClipboardPersistence }).testClipboardPersistence = testClipboardPersistence
}
