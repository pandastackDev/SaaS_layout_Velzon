import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addNewFile,
	addNewFolder,
	deleteFile,
	deleteFolder,
	getFiles,
	getFolders,
	updateFile,
	updateFolder,
} from "./thunk";

interface Folder {
	id: string | number;
	[key: string]: unknown;
}

interface File {
	id: string | number;
	[key: string]: unknown;
}

interface FileManagerState {
	folders: Folder[];
	files: File[];
	error: Record<string, unknown> | null;
}

export const initialState: FileManagerState = {
	folders: [],
	files: [],
	error: null,
};

const FileManagerSlice = createSlice({
	name: "FileManagerSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getFolders.fulfilled,
			(state, action: PayloadAction<Folder[]>) => {
				state.folders = action.payload;
			},
		);
		builder.addCase(getFolders.rejected, (state, action) => {
			state.error = (action.payload as Record<string, unknown>) || null;
		});

		builder.addCase(
			addNewFolder.fulfilled,
			(state, action: PayloadAction<Folder>) => {
				state.folders.push(action.payload);
			},
		);
		builder.addCase(addNewFolder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateFolder.fulfilled,
			(state, action: PayloadAction<Folder>) => {
				state.folders = state.folders.map((folder) =>
					folder.id.toString() === action.payload.id.toString()
						? { ...folder, ...action.payload }
						: folder,
				);
			},
		);

		builder.addCase(updateFolder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteFolder.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.folders = state.folders.filter(
					(folder) => `${folder.id}` !== `${action.payload}`,
				);
			},
		);
		builder.addCase(deleteFolder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getFiles.fulfilled,
			(state, action: PayloadAction<File[]>) => {
				state.files = action.payload;
			},
		);
		builder.addCase(getFiles.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addNewFile.fulfilled,
			(state, action: PayloadAction<File>) => {
				state.files.push(action.payload);
			},
		);

		builder.addCase(addNewFile.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateFile.fulfilled,
			(state, action: PayloadAction<File>) => {
				state.files = state.files.map((file) =>
					file.id.toString() === action.payload.id.toString()
						? { ...file, ...action.payload }
						: file,
				);
			},
		);

		builder.addCase(updateFile.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteFile.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.files = state.files.filter(
					(file) => `${file.id}` !== `${action.payload}`,
				);
			},
		);
		builder.addCase(deleteFile.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default FileManagerSlice.reducer;
