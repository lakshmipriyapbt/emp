import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeImage, uploadEmployeeImage } from '../Utils/Axios';

export const fetchProfileImage = createAsyncThunk(
  'profile/fetchImage',
  async (userId, { rejectWithValue }) => {
    try {
  const response = await getEmployeeImage(userId);
  // Use response.data.data if it exists, otherwise fall back to response.data.path
  return response.data.data || response.data.path || null;
} catch (error) {
  return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile image');
}
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadImage',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const response = await uploadEmployeeImage(userId, file);
      // Return the full path from the response
      return response.data.path || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    imageUrl: null,
    loading: false,
    error: null
  },
  reducers: {
    clearProfileImage: (state) => {
      state.imageUrl = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.imageUrl = action.payload;
      })
      .addCase(fetchProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.imageUrl = action.payload;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProfileImage } = profileSlice.actions;
export default profileSlice.reducer;