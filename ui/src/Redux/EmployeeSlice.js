// Import necessary functions from Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EmployeeGetApi } from "../Utils/Axios";

// Step 1: Define an Async Thunk to Fetch Employee Data
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      // Replace 'YOUR_API_URL_HERE' with the actual EmployeeGetApi() URL
      const response = await EmployeeGetApi();
      return response.data.data; // Return API response data

    } catch (error) {
      // Handle API errors
      return rejectWithValue(error.response.data?.data || "Something went wrong");
    }
  }
);

// Step 2: Create Employee Slice
const employeeSlice = createSlice({
  name: "employees", // Slice name
  initialState: {
    data: [],      // Stores employee data
    status:"loading", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Stores error message (if any)
  },
  reducers: {}, // No standard reducers, since we're using async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading"; // Set loading state
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded"; // Data fetched successfully
        state.data = action.payload.filter(emp => emp.employeeType !== "CompanyAdmin");
        console.log('Action Payload (employees):', action.payload); // Log the action payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed"; // Set failed state
        state.error = action.payload; // Store error message
      });
  },
});

// Step 3: Export the reducer to use in the store
export default employeeSlice.reducer;
