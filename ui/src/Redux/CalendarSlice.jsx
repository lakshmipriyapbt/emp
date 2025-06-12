// redux/slices/calendarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CalendarGetApi } from '../Utils/Axios';

// Async thunk to fetch data
export const fetchCalendarData = createAsyncThunk(
  'calendar/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CalendarGetApi();
      
      // Validate response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response structure');
      }
      
      return response.data.data;
    } catch (error) {
      // Enhanced error handling
      const errorPayload = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      return rejectWithValue(errorPayload);
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // Optional: Add manual reset action
    resetCalendarState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchCalendarData.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload?.message || 'Failed to fetch calendar data',
          details: action.payload
        };
      });
  },
});

// Export the reset action if you added it
export const { resetCalendarState } = calendarSlice.actions;

export default calendarSlice.reducer;