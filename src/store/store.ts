// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit'
import wassasReducer from './slices/wassaSlice' // Importo il reducer delle wassas
import settingsReducer from './slices/settingsSlice' // Importo il reducer delle impostazioni
import persistenceMiddleware from './persistenceMiddleware' // Middleware per persistenza automatica

// Configuro lo store Redux con i reducers e middleware
export const store = configureStore({
  reducer: {
    wassas: wassasReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
})

// Tipi per il dispatch e lo stato globale, utili per TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
