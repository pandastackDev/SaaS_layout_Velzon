import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	deleteMail,
	getMailDetails,
	labelMail,
	staredMail,
	trashMail,
	unreadMail,
} from "./thunk";

interface MailItem {
	forId: string | number;
	unread?: boolean;
	category?: string;
	label?: string;
	[key: string]: unknown;
}

interface MailboxState {
	mailDetails: MailItem[];
	error: Record<string, unknown> | null;
	isLoader: boolean;
	isMailDetailsDeleted?: boolean;
}

export const initialState: MailboxState = {
	mailDetails: [],
	error: null,
	isLoader: false,
};

const MailBoxSlice = createSlice({
	name: "MailBoxSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getMailDetails.fulfilled,
			(state, action: PayloadAction<MailItem[]>) => {
				state.mailDetails = action.payload;
				state.isLoader = false;
			},
		);
		builder.addCase(getMailDetails.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isLoader = true;
		});

		builder.addCase(
			unreadMail.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.mailDetails = state.mailDetails.map((mail) => {
					if (mail.forId === action.payload) {
						const updatedMail = mail.unread !== true;
						return { ...mail, unread: updatedMail };
					}
					return mail;
				});
				state.isMailDetailsDeleted = false;
			},
		);

		builder.addCase(unreadMail.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isMailDetailsDeleted = false;
		});

		builder.addCase(
			trashMail.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.mailDetails = state.mailDetails.map((mail) => {
					if (mail.forId === action.payload) {
						return { ...mail, category: "trash" };
					}
					return mail;
				});

				state.isMailDetailsDeleted = false;
			},
		);

		builder.addCase(trashMail.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isMailDetailsDeleted = false;
		});

		builder.addCase(
			staredMail.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.mailDetails = state.mailDetails.map((mail) => {
					if (mail.forId === action.payload) {
						const newCategory =
							mail.category === "starred" ? "inbox" : "starred";
						return { ...mail, category: newCategory };
					}
					return mail;
				});

				state.isMailDetailsDeleted = false;
			},
		);

		builder.addCase(staredMail.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isMailDetailsDeleted = false;
		});

		builder.addCase(
			labelMail.fulfilled,
			(
				state,
				action: PayloadAction<{ response: string | number; label: string }>,
			) => {
				state.mailDetails = state.mailDetails.map((mail) => {
					if (mail.forId === action.payload.response) {
						return { ...mail, label: action.payload.label };
					}
					return mail;
				});

				state.isMailDetailsDeleted = false;
			},
		);

		builder.addCase(labelMail.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isMailDetailsDeleted = false;
		});

		builder.addCase(
			deleteMail.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.mailDetails = state.mailDetails.filter(
					(mail) => mail.forId !== action.payload,
				);
				state.isMailDetailsDeleted = false;
			},
		);

		builder.addCase(deleteMail.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isMailDetailsDeleted = false;
		});
	},
});

export default MailBoxSlice.reducer;
