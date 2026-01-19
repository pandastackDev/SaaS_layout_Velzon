import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addProjectList,
	deleteProjectList,
	getProjectList,
	updateProjectList,
} from "./thunk";

interface Project {
	id?: string | number;
	_id?: string | number;
	[key: string]: unknown;
}

interface ProjectsState {
	projectLists: Project[];
	error: Record<string, unknown> | null;
}

export const initialState: ProjectsState = {
	projectLists: [],
	error: null,
};

const ProjectsSlice = createSlice({
	name: "ProjectsSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getProjectList.fulfilled,
			(state, action: PayloadAction<Project[]>) => {
				state.projectLists = action.payload;
			},
		);
		builder.addCase(getProjectList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			addProjectList.fulfilled,
			(state, action: PayloadAction<Project>) => {
				state.projectLists.push(action.payload);
			},
		);
		builder.addCase(addProjectList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			updateProjectList.fulfilled,
			(state, action: PayloadAction<{ data: Project }>) => {
				state.projectLists = state.projectLists.map((project) => {
					const projectId = project._id || project.id;
					const payloadId = action.payload.data._id || action.payload.data.id;
					return projectId?.toString() === payloadId?.toString()
						? { ...project, ...action.payload.data }
						: project;
				});
			},
		);
		builder.addCase(updateProjectList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			deleteProjectList.fulfilled,
			(state, action: PayloadAction<{ id: string | number }>) => {
				state.projectLists = state.projectLists.filter(
					(project) =>
						(project.id || project._id)?.toString() !==
						action.payload.id.toString(),
				);
			},
		);
		builder.addCase(deleteProjectList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default ProjectsSlice.reducer;
