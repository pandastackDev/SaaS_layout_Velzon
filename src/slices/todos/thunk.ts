import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
	addNewProject as addNewProjectApi,
	addNewTodo as addNewTodoApi,
	deleteTodo as deleteTodoApi,
	getProjects as getProjectsApi,
	getTodos as getTodosApi,
	updateTodo as updateTodoApi,
} from "../../helpers/fakebackend_helper";
// Import types
import type { Project, Todo } from "./types";

export const getTodos = createAsyncThunk("todos/getTodos", async () => {
	try {
		const response = getTodosApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const addNewTodo = createAsyncThunk(
	"todos/addNewTodo",
	async (todo: Todo) => {
		try {
			const response = addNewTodoApi(todo);
			const data = await response;
			toast.success("Todo Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Todo Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const updateTodo = createAsyncThunk(
	"todos/updateTodo",
	async (todo: Todo) => {
		try {
			const response = updateTodoApi(todo);
			const data = await response;
			toast.success("Todo Updated Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Todo Updated Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const deleteTodo = createAsyncThunk(
	"todos/deleteTodo",
	async (todo: Todo) => {
		try {
			const response = deleteTodoApi(todo);
			const data = await response;
			toast.success("Todo Delete Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Todo Delete Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const getProjects = createAsyncThunk("todos/getProjects", async () => {
	try {
		const response = getProjectsApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const addNewProject = createAsyncThunk(
	"todos/addNewProject",
	async (project: Project) => {
		try {
			const response = addNewProjectApi(project);
			const data = await response;
			toast.success("Project Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Project Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);
