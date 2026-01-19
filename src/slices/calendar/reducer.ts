import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
	addNewEvent,
	deleteEvent,
	getCategories,
	getEvents,
	getUpCommingEvent,
	resetCalendar,
	updateEvent,
} from "./thunk";

interface CalendarEvent {
	id: string | number;
	[key: string]: unknown;
}

interface Category {
	[key: string]: unknown;
}

interface CalendarState {
	events: CalendarEvent[];
	categories: Category[];
	upcommingevents: CalendarEvent[];
	error: Record<string, unknown> | null;
}

export const initialState: CalendarState = {
	events: [],
	categories: [],
	upcommingevents: [],
	error: null,
};

const calendarSlice = createSlice({
	name: "calendar",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getEvents.fulfilled,
			(state, action: PayloadAction<CalendarEvent[]>) => {
				state.events = action.payload;
			},
		);
		builder.addCase(getEvents.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addNewEvent.fulfilled,
			(state, action: PayloadAction<CalendarEvent>) => {
				state.events.push(action.payload);
			},
		);
		builder.addCase(addNewEvent.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateEvent.fulfilled,
			(state, action: PayloadAction<CalendarEvent>) => {
				state.events = (state.events || []).map((event) =>
					event.id.toString() === action.payload.id.toString()
						? { ...event, ...action.payload }
						: event,
				);
			},
		);

		builder.addCase(updateEvent.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteEvent.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.events = state.events.filter(
					(event) => event.id.toString() !== action.payload.toString(),
				);
			},
		);
		builder.addCase(deleteEvent.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getCategories.fulfilled,
			(state, action: PayloadAction<Category[]>) => {
				state.categories = action.payload;
			},
		);
		builder.addCase(getCategories.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getUpCommingEvent.fulfilled,
			(state, action: PayloadAction<CalendarEvent[]>) => {
				state.upcommingevents = action.payload;
			},
		);

		builder.addCase(getUpCommingEvent.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			resetCalendar.fulfilled,
			(_state, action: PayloadAction<{ flag: string; value: unknown }>) => {
				const flag = action.payload.flag;
				const value = action.payload.value;
				const flags: Record<string, unknown> = {};
				flags[flag] = value;

				// state.flags = action.payload;
			},
		);

		builder.addCase(resetCalendar.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default calendarSlice.reducer;
