import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DesignationGetApi } from '../Utils/Axios';

// Async thunk to fetch designations for a department
// In your designationSlice.js
export const fetchDesignations = createAsyncThunk('designations/fetchDesignations', async (departmentId, { rejectWithValue }) => {
  try {
    const designations = await DesignationGetApi(departmentId);
    // Handle empty responses by returning an empty array
    return { departmentId, designations: designations || [] };
  } catch (error) {
    // Specifically handle 404 (not found) as a non-error case
    if (error.response?.status === 404) {
      return { departmentId, designations: [] };
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch designations');
  }
});

const designationSlice = createSlice({
  name: 'designations',
  initialState: {
    designations: {}, // { departmentId: [designationList] }
    loading: false,
    error: null,
  },
  reducers: {
    removeDesignationFromState: (state, action) => {
      const { departmentId, designationId } = action.payload;
      if (state.designations[departmentId]) {
        state.designations[departmentId] = state.designations[departmentId].filter(d => d.id !== designationId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        const { departmentId, designations } = action.payload;
        state.designations[departmentId] = designations;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeDesignationFromState } = designationSlice.actions;
export default designationSlice.reducer;