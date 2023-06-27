import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_WEAPON = "bow";

const initialState = {
    team: null,

    weaponSelected: DEFAULT_WEAPON,

    weaponCounts: {
        "bow": Infinity,
        "knives": 5,
        "fireballs": 3
    }
}

function setWeaponCount(state, weapon, count) {
    state.weaponCounts[weapon] = Math.max(0, count);
    
    if (state.weaponCounts[action.payload.weapon] <= 0) 
        state.weaponSelected = DEFAULT_WEAPON;
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameState: (state, action) => {
            state[action.payload.key] = action.payload.value;
        },
    
        setWeaponCount: (state, action) => {
            setWeaponCount(state, action.payload.weapon, action.payload.count)
        },
    
        incrementWeaponCount: (state, action) => {
            setWeaponCount(state, action.payload.weapon, state.weaponCounts[action.payload.weapon] + (action.payload.amount ?? 1));
        },
    
        decrementWeaponCount: (state, action) => {
            setWeaponCount(state, action.payload.weapon, state.weaponCounts[action.payload.weapon] - (action.payload.amount ?? 1));
        },
    }
})

// Action creators are generated for each case reducer function
export const { setGameState } = gameSlice.actions

export default gameSlice.reducer