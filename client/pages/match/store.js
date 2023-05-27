import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './settingsSlice'
import gameReducer from './gameSlice'

import subscribeActionMiddleware from 'redux-subscribe-action';

export const store = configureStore({
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), subscribeActionMiddleware],
  reducer: {
    settings: settingsReducer,
    game: gameReducer, 
  },
})