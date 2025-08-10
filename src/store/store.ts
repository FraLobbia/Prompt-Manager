import { configureStore } from '@reduxjs/toolkit'
import wassasReducer from './slices/wassaSlice'
import settingsReducer from './slices/settingsSlice'
import persistenceMiddleware from './persistenceMiddleware'
import wassaSetsReducer from './slices/wassaSetsSlice'
export const store = configureStore({
  reducer: {
    wassas: wassasReducer,
    wassaSets: wassaSetsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch