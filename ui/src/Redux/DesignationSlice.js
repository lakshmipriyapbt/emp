import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  DesignationGetApi,
  DesignationPostApi,
  DesignationPutApiById,
  DesignationDeleteApiById
} from '../Utils/Axios';

// Async thunks for all designation operations
export const fetchDesignations = createAsyncThunk(
  'designations/fetchDesignations',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await DesignationGetApi(departmentId);
      return { departmentId, designations: response.data.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch designations',
        departmentId,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export const addDesignation = createAsyncThunk(
  'designations/addDesignation',
  async ({ departmentId, designationData }, { rejectWithValue }) => {
    try {
      const response = await DesignationPostApi(departmentId, designationData);
      return { departmentId, designation: response.data.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to add designation',
        departmentId,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export const updateDesignation = createAsyncThunk(
  'designations/updateDesignation',
  async ({ departmentId, designationId, designationData }, { rejectWithValue }) => {
    try {
      const response = await DesignationPutApiById(departmentId, designationId, designationData);
      return { departmentId, designation: response.data.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update designation',
        departmentId,
        designationId,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export const deleteDesignation = createAsyncThunk(
  'designations/deleteDesignation',
  async ({ departmentId, designationId }, { rejectWithValue }) => {
    try {
      await DesignationDeleteApiById(departmentId, designationId);
      return { departmentId, designationId };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete designation',
        departmentId,
        designationId,
        timestamp: new Date().toISOString()
      });
    }
  }
);

const designationSlice = createSlice({
  name: 'designations',
  initialState: {
    byDepartment: {}, // { departmentId: [designations] }
    loading: false,
    error: null,
    operationLoading: false,
    operationError: null,
    lastFetch: null
  },
  reducers: {
    // Optimistic update actions
    addDesignationOptimistically: (state, action) => {
      const { departmentId, designation } = action.payload;
      if (!state.byDepartment[departmentId]) {
        state.byDepartment[departmentId] = [];
      }
      state.byDepartment[departmentId].push({
        ...designation,
        isOptimistic: true
      });
    },
    revertOptimisticAdd: (state, action) => {
      const { departmentId, tempId } = action.payload;
      if (state.byDepartment[departmentId]) {
        state.byDepartment[departmentId] = state.byDepartment[departmentId].filter(
          d => !d.isOptimistic || d.id !== tempId
        );
      }
    },
    updateDesignationOptimistically: (state, action) => {
      const { departmentId, designationId, changes } = action.payload;
      if (state.byDepartment[departmentId]) {
        const index = state.byDepartment[departmentId].findIndex(
          d => d.id === designationId
        );
        if (index !== -1) {
          state.byDepartment[departmentId][index] = {
            ...state.byDepartment[departmentId][index],
            ...changes,
            isOptimisticUpdate: true
          };
        }
      }
    },
    // Clear actions
    clearDesignations: (state) => {
      state.byDepartment = {};
      state.error = null;
      state.operationError = null;
    },
    clearDesignationsByDepartment: (state, action) => {
      const departmentId = action.payload;
      delete state.byDepartment[departmentId];
    },
    clearDesignationError: (state) => {
      state.error = null;
      state.operationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designations
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        const { departmentId, designations } = action.payload;
        state.byDepartment[departmentId] = designations;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload.message,
          departmentId: action.payload.departmentId,
          timestamp: action.payload.timestamp
        };
      })
      
      // Add Designation
      .addCase(addDesignation.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(addDesignation.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { departmentId, designation } = action.payload;
        
        // Replace optimistic designation with real one
        if (state.byDepartment[departmentId]) {
          const index = state.byDepartment[departmentId].findIndex(
            d => d.isOptimistic
          );
          if (index !== -1) {
            state.byDepartment[departmentId][index] = designation;
          } else {
            state.byDepartment[departmentId].push(designation);
          }
        } else {
          state.byDepartment[departmentId] = [designation];
        }
      })
      .addCase(addDesignation.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = {
          message: action.payload.message,
          departmentId: action.payload.departmentId,
          timestamp: action.payload.timestamp
        };
      })
      
      // Update Designation
      .addCase(updateDesignation.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateDesignation.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { departmentId, designation } = action.payload;
        
        if (state.byDepartment[departmentId]) {
          const index = state.byDepartment[departmentId].findIndex(
            d => d.id === designation.id
          );
          if (index !== -1) {
            state.byDepartment[departmentId][index] = designation;
          }
        }
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = {
          message: action.payload.message,
          departmentId: action.payload.departmentId,
          designationId: action.payload.designationId,
          timestamp: action.payload.timestamp
        };
      })
      
      // Delete Designation
      .addCase(deleteDesignation.pending, (state, action) => {
        const { departmentId, designationId } = action.meta.arg;
        // Optimistically remove from state immediately
        if (state.byDepartment[departmentId]) {
          state.byDepartment[departmentId] = state.byDepartment[departmentId].filter(
            d => d.id !== designationId
          );
        }
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteDesignation.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = {
          message: action.payload.message,
          departmentId: action.payload.departmentId,
          designationId: action.payload.designationId,
          timestamp: action.payload.timestamp
        };
        // Re-fetch to restore correct state if deletion failed
        state.loading = true;
      });
  }
});

export const { 
  addDesignationOptimistically,
  revertOptimisticAdd,
  updateDesignationOptimistically,
  clearDesignations,
  clearDesignationsByDepartment,
  clearDesignationError
} = designationSlice.actions;

export const selectDesignationsByDepartment = (state, departmentId) => 
  state.designations.byDepartment[departmentId] || [];

export const selectDesignationsLoading = (state) => 
  state.designations.loading;

export const selectDesignationsOperationLoading = (state) =>
  state.designations.operationLoading;

export const selectDesignationsError = (state) => 
  state.designations.error;

export const selectDesignationsOperationError = (state) =>
  state.designations.operationError;

export default designationSlice.reducer;