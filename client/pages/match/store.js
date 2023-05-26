import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './settingsSlice'

import subscribeActionMiddleware from 'redux-subscribe-action';

export const store = configureStore({
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), subscribeActionMiddleware],
  reducer: {
    settings: settingsReducer,
  },
})