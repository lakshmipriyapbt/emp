import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TdsGetApi } from '../Utils/Axios';

// Async thunk to fetch TDS data
export const fetchTds = createAsyncThunk('tds/fetchTds', async () => {
  try {
    const response = await TdsGetApi(); // Get TDS data
    console.log('Fetched TDS data:', response.data.data);
    return response.data.data; // Return the data
  } catch (error) {
    console.error('Error in fetchTds thunk:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch TDS data');
  }
});

const TdsSlice = createSlice({
  name: 'tds',
  initialState: {
    tdsList: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeTdsFromState: (state, action) => {
      state.tdsList = state.tdsList.filter(tds => tds.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTds.fulfilled, (state, action) => {
        state.loading = false;
        state.tdsList = action.payload;
      })
      .addCase(fetchTds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { removeTdsFromState } = TdsSlice.actions;
export default TdsSlice.reducer;
