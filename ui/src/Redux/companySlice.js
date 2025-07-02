import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyViewByIdApi } from '../Utils/Axios'; // Adjust

// Async thunk to fetch company data
export const fetchCompanyById = createAsyncThunk(
  'company/fetchCompanyById',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await companyViewByIdApi(companyId);
      console.log('Fetched Company Data:', response.data.data);
      return response.data.data; // return only the "data" object
    } catch (error) {
      console.error('Error fetching company data:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch company data'
      );
    }
  }
);

// Slice
const companySlice = createSlice({
  name: 'company',
  initialState: {
    companyData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCompanyData: (state) => {
      state.companyData = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.companyData = action.payload;
        console.log('Company stored in Redux:', action.payload);
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
