import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DepartmentGetApi } from '../Utils/Axios';

// Async thunk to fetch departments
export const fetchDepartments = createAsyncThunk('departments/fetchDepartments', async (_, { rejectWithValue }) => {
  try {
    const response = await DepartmentGetApi(); // companyName is fetched internally
    return response.data.data; // Return only the departments array
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
  }
});

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeDepartmentFromState: (state, action) => {
      state.departments = state.departments.filter(dep => dep.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeDepartmentFromState } = departmentSlice.actions;
export default departmentSlice.reducer;