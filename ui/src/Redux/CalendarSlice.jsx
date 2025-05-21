// redux/slices/calendarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CalendarGetApi } from '../Utils/Axios';

// Async thunk to fetch data
export const fetchCalendarData = createAsyncThunk(
    'calendar/fetchData',
    async (_, { rejectWithValue }) => {
      try {
        const res = await CalendarGetApi();
        console.log("🌐 Raw API response:", res.data.data); // Debug full response
        return res.data.data; // only return the "data" array
      } catch (error) {
        return rejectWithValue(error.response?.data || "Error fetching calendar data");
      }
    }
  );  

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarData.pending, (state) => {
        
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log("📅 Calendar data fetched:", action.payload); // ✅ Debug log
      })
      .addCase(fetchCalendarData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default calendarSlice.reducer;
