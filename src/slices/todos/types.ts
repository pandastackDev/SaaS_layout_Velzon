export interface Assignee {
	id: number;
	name: string;
	img: string;
}

export interface Todo {
	id: string | number;
	task: string;
	dueDate: string;
	status: string;
	priority: string;
	subItem?: Assignee[];
}

export interface Project {
	id: string | number;
	title: string;
	subItem?: { id: number; version: string; iconClass: string }[];
}
