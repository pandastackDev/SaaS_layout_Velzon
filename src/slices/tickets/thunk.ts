import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Include Both Helper File with needed methods
import {
	addNewTicket as addNewTicketApi,
	deleteTicket as deleteTicketApi,
	getTicketsList as getTicketsListApi,
	updateTicket as updateTicketApi,
} from "../../helpers/fakebackend_helper";
import type { Ticket } from "./types";

export const getTicketsList = createAsyncThunk(
	"tickets/getTicketsList",
	async () => {
		try {
			const response = getTicketsListApi();
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const addNewTicket = createAsyncThunk(
	"tickets/addNewTicket",
	async (ticket: Ticket) => {
		try {
			const response = addNewTicketApi(ticket);
			const data = await response;
			toast.success("Ticket Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			return error;
		}
	},
);

export const updateTicket = createAsyncThunk(
	"tickets/updateTicket",
	async (ticket: Ticket) => {
		try {
			const response = updateTicketApi(ticket);
			const data = await response;
			toast.success("Ticket Updated Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Ticket Updated Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const deleteTicket = createAsyncThunk(
	"tickets/deleteTicket",
	async (ticket: Ticket) => {
		try {
			const response = deleteTicketApi(ticket);
			toast.success("Ticket Deleted Successfully", { autoClose: 3000 });
			return { ticket, ...response };
		} catch (error) {
			toast.error("Ticket Deleted Failed", { autoClose: 3000 });
			return error;
		}
	},
);
