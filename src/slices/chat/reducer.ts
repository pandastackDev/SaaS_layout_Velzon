import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addMessage,
	deleteMessage,
	getDirectContact,
	getMessages,
} from "./thunk";

interface Chat {
	[key: string]: unknown;
}

interface Message {
	id: string | number;
	usermessages?: Message[];
	[key: string]: unknown;
}

interface ChatState {
	chats: Chat[];
	messages: Message[];
	channels: Chat[];
	error: Record<string, unknown> | null;
	loading?: boolean;
}

export const initialState: ChatState = {
	chats: [],
	messages: [],
	channels: [],
	error: null,
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getDirectContact.fulfilled,
			(state, action: PayloadAction<Chat[]>) => {
				state.chats = action.payload;
				state.loading = true;
			},
		);
		builder.addCase(getDirectContact.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getMessages.fulfilled,
			(state, action: PayloadAction<Message[]>) => {
				state.messages = action.payload;
				state.loading = true;
			},
		);
		builder.addCase(getMessages.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addMessage.fulfilled,
			(state, action: PayloadAction<Message>) => {
				state.messages.forEach((data) => {
					if (data.usermessages) {
						data.usermessages.push(action.payload);
					}
				});
			},
		);
		builder.addCase(addMessage.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteMessage.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.messages = (state.messages || []).map((data) => {
					const updateUserMsg = (data.usermessages || []).filter(
						(userMsg) => userMsg.id !== action.payload,
					);
					return { ...data, usermessages: updateUserMsg };
				});
			},
		);

		builder.addCase(deleteMessage.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default chatSlice.reducer;
