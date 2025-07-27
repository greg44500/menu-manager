import { createSlice } from '@reduxjs/toolkit';

// --- Bloc de variables et constantes ---

// Clé utilisée pour la persistance dans localStorage
const LOCAL_STORAGE_KEY = 'activeCalendarId';

// Récupération de l'état initial à partir du localStorage, si disponible
const savedCalendarId = localStorage.getItem(LOCAL_STORAGE_KEY);

// État initial du slice
const initialState = {
  activeCalendarId: savedCalendarId || null,
  activeCalendarLabel: '', // Peut être enrichi après sélection ou via API
};

// --- Déclaration du slice Redux ---

const calendarSessionSlice = createSlice({
  name: 'calendarSession',
  initialState,
  reducers: {
    // Action: définir la session académique active
    setActiveCalendar: (state, action) => {
      state.activeCalendarId = action.payload.id;
      state.activeCalendarLabel = action.payload.label || '';
      // Persistance dans localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, action.payload.id);
    },
    // Action: réinitialiser la session active (ex: déconnexion)
    resetActiveCalendar: (state) => {
      state.activeCalendarId = null;
      state.activeCalendarLabel = '';
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
  },
});

// --- Exports des actions et du reducer ---

export const { setActiveCalendar, resetActiveCalendar } = calendarSessionSlice.actions;
export default calendarSessionSlice.reducer;
