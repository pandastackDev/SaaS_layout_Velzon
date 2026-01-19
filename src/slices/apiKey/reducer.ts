import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getAPIKey } from "./thunk";

interface ApiKey {
	[key: string]: unknown;
}

interface ApiKeyState {
	apiKey: ApiKey[];
	error: Record<string, unknown> | null;
}

export const initialState: ApiKeyState = {
	apiKey: [],
	error: null,
};

const APIKeyslice = createSlice({
	name: "APIKey",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getAPIKey.fulfilled,
			(state, action: PayloadAction<ApiKey[]>) => {
				state.apiKey = action.payload;
			},
		);
		builder.addCase(getAPIKey.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default APIKeyslice.reducer;
