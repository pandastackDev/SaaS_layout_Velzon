import { createSlice } from "@reduxjs/toolkit";
import {
	addNewTicket,
	deleteTicket,
	getTicketsList,
	updateTicket,
} from "./thunk";
import type { Ticket } from "./types";

export interface TicketsState {
	ticketsList: Ticket[];
	error?: Record<string, unknown> | null;
	isTicketCreated?: boolean;
	isTicketSuccess?: boolean;
	isTicketAdd?: boolean;
	isTicketAddFail?: boolean;
	isTicketUpdate?: boolean;
	isTicketUpdateFail?: boolean;
}

export const initialState: TicketsState = {
	ticketsList: [],
	error: null,
	isTicketCreated: false,
	isTicketSuccess: false,
	isTicketAdd: false,
	isTicketAddFail: false,
	isTicketUpdate: false,
	isTicketUpdateFail: false,
};

const TicketsSlice = createSlice({
	name: "TicketsSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getTicketsList.fulfilled, (state, action) => {
			state.ticketsList = action.payload;
			state.isTicketCreated = false;
			state.isTicketSuccess = true;
		});
		builder.addCase(getTicketsList.rejected, (state, action) => {
			state.error = action.payload?.error || null;
			state.isTicketCreated = false;
			state.isTicketSuccess = false;
		});
		builder.addCase(addNewTicket.fulfilled, (state, action) => {
			state.ticketsList.push(action.payload);
			state.isTicketCreated = true;
			state.isTicketAdd = true;
			state.isTicketAddFail = false;
		});
		builder.addCase(addNewTicket.rejected, (state, action) => {
			state.error = action.payload?.error || null;
			state.isTicketAdd = false;
			state.isTicketAddFail = true;
		});
		builder.addCase(updateTicket.fulfilled, (state, action) => {
			state.ticketsList = state.ticketsList.map((ticket) =>
				ticket.id === action.payload.id
					? { ...ticket, ...action.payload }
					: ticket,
			);
			state.isTicketUpdate = true;
			state.isTicketUpdateFail = false;
		});
		builder.addCase(updateTicket.rejected, (state, action) => {
			state.error = action.payload?.error || null;
			state.isTicketUpdate = false;
			state.isTicketUpdateFail = true;
		});
		builder.addCase(deleteTicket.fulfilled, (state: any, action: any) => {
			state.ticketsList = state.ticketsList.filter(
				(ticket: any) =>
					ticket.id.toString() !== action.payload.ticket.toString(),
			);
			state.isTicketDelete = true;
			state.isTicketDeleteFail = false;
		});
		builder.addCase(deleteTicket.rejected, (state: any, action: any) => {
			state.error = action.payload.error || null;
			state.isTicketDelete = false;
			state.isTicketDeleteFail = true;
		});
	},
});

export default TicketsSlice.reducer;
