import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CandidateGetAllApi } from '../Utils/Axios';

export const fetchCandidates = createAsyncThunk('candidates/fetchCandidates', async () => {
    try {
        const response = await CandidateGetAllApi(); // No parameters needed
        console.log('Fetched Candidates data from candidateSlice:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error in fetchCandidates thunk:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch candidates');
    }
});

const CandidateSlice = createSlice({
    name: 'candidates',
    initialState: {
        candidates: [],
        loading: false,
        error: null,
    },
    reducers: {
        removeCandidateFromState: (state, action) => {
            const idToRemove = action.payload;
            state.candidates = state.candidates.filter(candidate => candidate.id !== idToRemove);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCandidates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.loading = false;
                console.log('Action Payload (Candidates):', action.payload);
                state.candidates = action.payload;
                console.log('Updated candidates in Redux state:', state.candidates);
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { removeCandidateFromState } = CandidateSlice.actions;
export default CandidateSlice.reducer;