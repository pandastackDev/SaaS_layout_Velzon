import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addCardData,
	addNewTask,
	deleteKanban,
	deleteTask,
	getTaskList,
	getTasks,
	updateCardData,
	updateTask,
} from "./thunk";

interface Task {
	id: string | number;
	[key: string]: unknown;
}

interface KanbanCard {
	id: string | number;
	kanId?: string | number;
	[key: string]: unknown;
}

interface KanbanList {
	id: string | number;
	cards?: KanbanCard[];
	[key: string]: unknown;
}

interface TasksState {
	taskList: Task[];
	tasks: KanbanList[];
	error?: Record<string, unknown> | null;
	isTaskCreated?: boolean;
	isTaskSuccess?: boolean;
	isTaskAdd?: boolean;
	isTaskAddFail?: boolean;
	isTaskUpdate?: boolean;
	isTaskUpdateFail?: boolean;
	isTaskDelete?: boolean;
	isTaskDeleteFail?: boolean;
}

export const initialState: TasksState = {
	taskList: [],
	tasks: [],
};
const TasksSlice = createSlice({
	name: "TasksSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getTaskList.fulfilled,
			(state, action: PayloadAction<Task[]>) => {
				state.taskList = action.payload;
				state.isTaskCreated = false;
				state.isTaskSuccess = true;
			},
		);
		builder.addCase(getTaskList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isTaskCreated = false;
			state.isTaskSuccess = true;
		});
		builder.addCase(
			addNewTask.fulfilled,
			(state, action: PayloadAction<Task>) => {
				state.taskList.push(action.payload);
				state.isTaskCreated = true;
				state.isTaskAdd = true;
				state.isTaskAddFail = false;
			},
		);
		builder.addCase(addNewTask.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isTaskAdd = false;
			state.isTaskAddFail = true;
		});
		builder.addCase(
			updateTask.fulfilled,
			(state, action: PayloadAction<Task>) => {
				state.taskList = state.taskList.map((task) =>
					task.id === action.payload.id ? { ...task, ...action.payload } : task,
				);
				state.isTaskUpdate = true;
				state.isTaskUpdateFail = false;
			},
		);
		builder.addCase(updateTask.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isTaskUpdate = false;
			state.isTaskUpdateFail = true;
		});
		builder.addCase(
			deleteTask.fulfilled,
			(state, action: PayloadAction<{ task: string | number }>) => {
				state.taskList = state.taskList.filter(
					(task) => task.id.toString() !== action.payload.task.toString(),
				);
				state.isTaskDelete = true;
				state.isTaskDeleteFail = false;
			},
		);
		builder.addCase(deleteTask.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isTaskDelete = false;
			state.isTaskDeleteFail = true;
		});
		// Kanban Board
		builder.addCase(
			getTasks.fulfilled,
			(state, action: PayloadAction<KanbanList[]>) => {
				state.tasks = action.payload;
			},
		);
		builder.addCase(getTasks.rejected, (state, action) => {
			state.error = action.payload
				? (action.payload as { error?: unknown })?.error
				: null;
		});
		builder.addCase(
			addCardData.fulfilled,
			(
				state,
				action: PayloadAction<KanbanCard & { kanId: string | number }>,
			) => {
				const existingTaskList = state.tasks.find(
					(kanbanList) => kanbanList.id === action.payload.kanId,
				);
				if (existingTaskList) {
					state.tasks = state.tasks.map((kanbanList) => {
						if (kanbanList.id === action.payload.kanId) {
							const updatedTaskList = {
								...kanbanList,
								cards: [...(kanbanList.cards || []), action.payload],
							};
							return updatedTaskList;
						}
						return kanbanList;
					});
				} else {
					state.tasks = [
						...state.tasks,
						action.payload as unknown as KanbanList,
					];
				}
			},
		);
		builder.addCase(addCardData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			updateCardData.fulfilled,
			(
				state,
				action: PayloadAction<KanbanCard & { kanId: string | number }>,
			) => {
				state.tasks = state.tasks.map((task) => {
					if (task.id === action.payload.kanId) {
						return {
							...task,
							cards: (task.cards || []).map((card) =>
								card.id.toString() === action.payload.id.toString()
									? { ...card, ...action.payload }
									: card,
							),
						};
					}
					return task;
				});
			},
		);
		builder.addCase(updateCardData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown }) || null;
		});
		builder.addCase(
			deleteKanban.fulfilled,
			(state, action: PayloadAction<string | number>) => {
				state.tasks = state.tasks.map((kanbanList) => {
					const updatedTaskList = {
						...kanbanList,
						cards: (kanbanList.cards || []).filter((task) => {
							return task.id.toString() !== action.payload.toString();
						}),
					};
					return updatedTaskList;
				});
			},
		);
		builder.addCase(deleteKanban.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});
export default TasksSlice.reducer;
