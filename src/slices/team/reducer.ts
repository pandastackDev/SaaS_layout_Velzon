import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addTeamData,
	deleteTeamData,
	getTeamData,
	updateTeamData,
} from "./thunk";

interface TeamMember {
	id: string | number;
	[key: string]: unknown;
}

interface TeamState {
	teamData: TeamMember[];
	error: Record<string, unknown> | null;
}

export const initialState: TeamState = {
	teamData: [],
	error: null,
};

const TeamSlice = createSlice({
	name: "TeamSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getTeamData.fulfilled,
			(state, action: PayloadAction<TeamMember[]>) => {
				state.teamData = action.payload;
			},
		);
		builder.addCase(getTeamData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			addTeamData.fulfilled,
			(state, action: PayloadAction<TeamMember>) => {
				state.teamData.push(action.payload);
			},
		);
		builder.addCase(addTeamData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			updateTeamData.fulfilled,
			(state, action: PayloadAction<TeamMember>) => {
				state.teamData = state.teamData.map((team) =>
					team.id.toString() === action.payload.id.toString()
						? { ...team, ...action.payload }
						: team,
				);
			},
		);
		builder.addCase(updateTeamData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			deleteTeamData.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.teamData = state.teamData.filter(
					(team) => `${team.id}` !== `${action.payload}`,
				);
			},
		);
		builder.addCase(deleteTeamData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default TeamSlice.reducer;
