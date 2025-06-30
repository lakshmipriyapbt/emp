import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeImage, uploadEmployeeImage } from '../Utils/Axios';

export const fetchProfileImage = createAsyncThunk(
  'profile/fetchImage',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getEmployeeImage(userId);
      if (response.data.data) {
        // Sanitize URL if needed
        return response.data.data.replace(/\\/g, '/');
      }
      return null;
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
      if (response.data) {
        // Sanitize the URL if needed
        return response.data.replace(/\\/g, '/');
      }
      return null;
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