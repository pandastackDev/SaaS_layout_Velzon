import { createSlice } from "@reduxjs/toolkit";
import {
	addNewProject,
	addNewTodo,
	deleteTodo,
	getProjects,
	getTodos,
	updateTodo,
} from "./thunk";
import type { Project, Todo } from "./types";

export interface TodosState {
	todos: Todo[];
	projects: Project[];
	error: Record<string, unknown> | null;
}

export const initialState: TodosState = {
	todos: [],
	projects: [],
	error: null,
};

const TodosSlice = createSlice({
	name: "TodosSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getTodos.fulfilled, (state, action) => {
			state.todos = action.payload;
		});
		builder.addCase(getTodos.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
		builder.addCase(addNewTodo.fulfilled, (state, action) => {
			state.todos.unshift(action.payload);
		});
		builder.addCase(addNewTodo.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
		builder.addCase(updateTodo.fulfilled, (state, action) => {
			state.todos = state.todos.map((todo) =>
				todo.id.toString() === action.payload.id.toString()
					? { ...todo, ...action.payload }
					: todo,
			);
		});
		builder.addCase(updateTodo.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
		builder.addCase(deleteTodo.fulfilled, (state, action) => {
			state.todos = state.todos.filter(
				(todo) => `${todo.id}` !== `${action.payload}`,
			);
		});
		builder.addCase(deleteTodo.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
		builder.addCase(getProjects.fulfilled, (state, action) => {
			state.projects = action.payload;
		});
		builder.addCase(getProjects.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
		builder.addCase(addNewProject.fulfilled, (state, action) => {
			state.projects.push(action.payload);
		});
		builder.addCase(addNewProject.rejected, (state, action) => {
			state.error = action.payload?.error || null;
		});
	},
});

export default TodosSlice.reducer;
