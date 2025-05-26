import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  DepartmentGetApi, 
  DepartmentPostApi, 
  DepartmentPutApiById, 
  DepartmentDeleteApiById 
} from '../Utils/Axios';

// Async thunks for all department operations
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DepartmentGetApi();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const addDepartment = createAsyncThunk(
  'departments/addDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await DepartmentPostApi(departmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add department');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const response = await DepartmentPutApiById(id, departmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update department');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      await DepartmentDeleteApiById(id);
      return id; // Return the ID for optimistic deletion
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete department');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: [],
    loading: false,
    error: null,
    operationLoading: false, // For individual operations
    operationError: null,
  },
  reducers: {
    // For optimistic updates
    addDepartmentOptimistically: (state, action) => {
      state.departments.push({
        ...action.payload,
        isOptimistic: true // Flag for optimistic update
      });
    },
    // For reverting optimistic updates on failure
    revertOptimisticAdd: (state, action) => {
      state.departments = state.departments.filter(
        dept => !dept.isOptimistic || dept.id !== action.payload.tempId
      );
    },
    // For immediate UI updates before API response
    updateDepartmentOptimistically: (state, action) => {
      const index = state.departments.findIndex(
        dept => dept.id === action.payload.id
      );
      if (index !== -1) {
        state.departments[index] = {
          ...state.departments[index],
          ...action.payload.changes,
          isOptimisticUpdate: true
        };
      }
    },
    removeDepartmentFromState: (state, action) => {
      state.departments = state.departments.filter(
        dept => dept.id !== action.payload
      );
    },
    clearDepartmentError: (state) => {
      state.error = null;
      state.operationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Department
      .addCase(addDepartment.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Replace optimistic department with real one
        const index = state.departments.findIndex(dept => dept.isOptimistic);
        if (index !== -1) {
          state.departments[index] = action.payload;
        } else {
          state.departments.push(action.payload);
        }
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Update Department
      .addCase(updateDepartment.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.departments.findIndex(
          dept => dept.id === action.payload.id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Delete Department
      .addCase(deleteDepartment.pending, (state, action) => {
        // Optimistically remove from state immediately
        state.departments = state.departments.filter(
          dept => dept.id !== action.meta.arg
        );
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteDepartment.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
        // Re-fetch to restore correct state if deletion failed
        state.loading = true;
      });
  }
});

export const { 
  addDepartmentOptimistically,
  revertOptimisticAdd,
  updateDepartmentOptimistically,
  removeDepartmentFromState,
  clearDepartmentError
} = departmentSlice.actions;

export default departmentSlice.reducer;