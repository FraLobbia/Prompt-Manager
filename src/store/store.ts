import { configureStore } from '@reduxjs/toolkit'
import promptsReducer from './slices/promptSlice'
import settingsReducer from './slices/settingsSlice'
import persistenceMiddleware from './persistenceMiddleware'
import promptSetsReducer from './slices/promptSetsSlice'
export const store = configureStore({
  reducer: {
    prompts: promptsReducer,
    promptSets: promptSetsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch