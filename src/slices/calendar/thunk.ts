import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
	addNewEvent as addNewEventApi,
	deleteEvent as deleteEventApi,
	getCategories as getCategoriesApi,
	getEvents as getEventsApi,
	getUpCommingEvent as getUpCommingEventApi,
	updateEvent as updateEventApi,
} from "../../helpers/fakebackend_helper";

export const getEvents = createAsyncThunk("calendar/getEvents", async () => {
	try {
		const response = getEventsApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const addNewEvent = createAsyncThunk(
	"calendar/addNewEvent",
	async (event: Record<string, unknown>) => {
		try {
			const response = addNewEventApi(event);
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const updateEvent = createAsyncThunk(
	"calendar/updateEvent",
	async (event: Record<string, unknown>) => {
		try {
			const response = updateEventApi(event);
			const modifiedevent = await response;
			return modifiedevent;
		} catch (error) {
			return error;
		}
	},
);

export const deleteEvent = createAsyncThunk(
	"calendar/deleteEvent",
	async (event: string | number | Record<string, unknown>) => {
		try {
			const response = deleteEventApi(event);
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const getCategories = createAsyncThunk(
	"calendar/getCategories",
	async () => {
		try {
			const response = getCategoriesApi();
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const getUpCommingEvent = createAsyncThunk(
	"calendar/getUpCommingEvent",
	async () => {
		try {
			const response = getUpCommingEventApi();
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const resetCalendar = createAsyncThunk(
	"calendar/resetCalendar",
	async (payload?: { flag: string; value: unknown }) => {
		try {
			return payload || { flag: "", value: "" };
		} catch (error) {
			return error;
		}
	},
);
