import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    team: null
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameState: (state, action) => {
            state[action.payload.key] = action.payload.value;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setGameState } = gameSlice.actions

export default gameSlice.reducer