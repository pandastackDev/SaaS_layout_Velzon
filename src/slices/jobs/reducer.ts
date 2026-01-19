import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addCandidate,
	addCandidateGrid,
	addcategoryList,
	addNewJobApplicationList,
	deleteCandidate,
	deleteJobApplicationList,
	getApplicationList,
	getCandidateGrid,
	getCandidateList,
	getCategoryList,
	updateCandidate,
	updateJobApplicationList,
} from "./thunk";

interface JobApplication {
	id: string | number;
	[key: string]: unknown;
}

interface Candidate {
	id: string | number;
	[key: string]: unknown;
}

interface Category {
	[key: string]: unknown;
}

interface JobsState {
	appList: JobApplication[];
	candidatelist?: Candidate[];
	candidategrid?: Candidate[];
	categoryList?: Category[];
	error: Record<string, unknown> | null;
	loading?: boolean;
}

export const initialState: JobsState = {
	appList: [],
	error: null,
};

const Jobslice = createSlice({
	name: "Jobs",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getApplicationList.fulfilled,
			(state, action: PayloadAction<JobApplication[]>) => {
				state.appList = action.payload;
			},
		);
		builder.addCase(getApplicationList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addNewJobApplicationList.fulfilled,
			(state, action: PayloadAction<JobApplication>) => {
				state.appList = [...state.appList, action.payload];
			},
		);

		builder.addCase(addNewJobApplicationList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateJobApplicationList.fulfilled,
			(state, action: PayloadAction<JobApplication>) => {
				state.appList = state.appList.map((job) =>
					job.id.toString() === action.payload.id.toString()
						? { ...job, ...action.payload }
						: job,
				);
			},
		);

		builder.addCase(updateJobApplicationList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteJobApplicationList.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.appList = state.appList.filter(
					(job) => job.id.toString() !== action.payload.toString(),
				);
			},
		);

		builder.addCase(deleteJobApplicationList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		// candidate list
		builder.addCase(
			getCandidateList.fulfilled,
			(state, action: PayloadAction<Candidate[]>) => {
				state.candidatelist = action.payload;
				state.loading = true;
			},
		);
		builder.addCase(getCandidateList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			addCandidate.fulfilled,
			(state, action: PayloadAction<Candidate>) => {
				if (state.candidatelist) {
					state.candidatelist.unshift(action.payload);
				}
			},
		);
		builder.addCase(addCandidate.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			updateCandidate.fulfilled,
			(state, action: PayloadAction<Candidate>) => {
				if (state.candidatelist) {
					state.candidatelist = state.candidatelist.map((candidate) =>
						candidate.id === action.payload.id
							? { ...candidate, ...action.payload }
							: candidate,
					);
				}
			},
		);
		builder.addCase(updateCandidate.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			deleteCandidate.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.candidatelist = (state.candidatelist || []).filter(
					(candidate) => `${candidate.id}` !== `${action.payload}`,
				);
			},
		);
		builder.addCase(deleteCandidate.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		// candidate Grid
		builder.addCase(
			getCandidateGrid.fulfilled,
			(state, action: PayloadAction<Candidate[]>) => {
				state.candidategrid = action.payload;
				state.loading = true;
			},
		);
		builder.addCase(getCandidateGrid.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			addCandidateGrid.fulfilled,
			(state, action: PayloadAction<Candidate>) => {
				if (state.candidategrid) {
					state.candidategrid.unshift(action.payload);
				}
			},
		);
		builder.addCase(addCandidateGrid.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		// Job categories
		builder.addCase(
			getCategoryList.fulfilled,
			(state, action: PayloadAction<Category[]>) => {
				state.categoryList = action.payload;
			},
		);
		builder.addCase(getCategoryList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addcategoryList.fulfilled,
			(state, action: PayloadAction<Category>) => {
				if (state.categoryList) {
					state.categoryList.unshift(action.payload);
				}
			},
		);
		builder.addCase(addcategoryList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default Jobslice.reducer;
