// profileImageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    imageUrl: null,
  },
  reducers: {
    setProfileImage: (state, action) => {
      state.imageUrl = action.payload;
    },
    clearProfileImage: (state) => {
      state.imageUrl = null;
    }
  }
});

export const { setProfileImage, clearProfileImage } = profileSlice.actions;
export default profileSlice.reducer;