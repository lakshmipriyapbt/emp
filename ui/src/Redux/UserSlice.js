import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserGetApi } from '../Utils/Axios';

// Async thunk to fetch users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  try {
    const response = await UserGetApi(); // Calls the User API
    console.log('Fetched Users data from userSlice:', response.data);
    return response.data.data; // Assumes response.data is the array of users
  } catch (error) {
    console.error('Error in fetchUsers thunk:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
});

// Create the user slice
const UserSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeUserFromState: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Action Payload (Users):', action.payload);
        state.users = action.payload;
        console.log('Updated users in Redux state:', state.users);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions and reducer
export const { removeUserFromState } = UserSlice.actions;
export default UserSlice.reducer;
