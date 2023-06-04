import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    aTeamPlayers: 0,
    bTeamPlayers: 0,
    //players: []
}

export const scoreboardSlice = createSlice({
    name: 'scoreboard',
    initialState,
    reducers: {
        setScoreboardState: (state, action) => {
            state[action.payload.key] = action.payload.value;
        },

        addPlayer: (state, action) => {
            state[`${action.payload.player.team}TeamPlayers`]++;
        },

        removePlayer: (state, action) => {
            state[`${action.payload.player.team}TeamPlayers`]--;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setScoreboardState, addPlayer, removePlayer } = scoreboardSlice.actions

export default scoreboardSlice.reducer