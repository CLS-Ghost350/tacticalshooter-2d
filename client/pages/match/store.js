import { configureStore } from '@reduxjs/toolkit'
import subscribeActionMiddleware from 'redux-subscribe-action';

import settingsReducer from './storeSlices/settingsSlice'
import gameReducer from './storeSlices/gameSlice'
import scoreboardReducer from './storeSlices/scoreboardSlice'

export const store = configureStore({
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), subscribeActionMiddleware],
  reducer: {
    settings: settingsReducer,
    game: gameReducer, 
    scoreboard: scoreboardReducer, 
  },
})