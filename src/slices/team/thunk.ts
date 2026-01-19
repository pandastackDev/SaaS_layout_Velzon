import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Include Both Helper File with needed methods
import {
	addTeamData as addTeamDataApi,
	deleteTeamData as deleteTeamDataApi,
	getTeamData as getTeamDataApi,
	updateTeamData as updateTeamDataApi,
} from "../../helpers/fakebackend_helper";

export const getTeamData = createAsyncThunk("team/getTeamData", async () => {
	try {
		const response = getTeamDataApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const addTeamData = createAsyncThunk(
	"team/addTeamData",
	async (team: Record<string, unknown>) => {
		try {
			const response = addTeamDataApi(team);
			toast.success("Team Data Added Successfully", { autoClose: 3000 });
			return response;
		} catch (error) {
			toast.error("Team Data Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const updateTeamData = createAsyncThunk(
	"team/updateTeamData",
	async (project: Record<string, unknown>) => {
		try {
			const response = updateTeamDataApi(project);
			toast.success("Team Data Updated Successfully", { autoClose: 3000 });
			return response;
		} catch (error) {
			toast.error("Team Data Updated Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const deleteTeamData = createAsyncThunk(
	"team/deleteTeamData",
	async (team: string | number | Record<string, unknown>) => {
		try {
			const response = deleteTeamDataApi(team);
			toast.success("Team Data Delete Successfully", { autoClose: 3000 });
			return response;
		} catch (error) {
			toast.error("Team Data Delete Failed", { autoClose: 3000 });
			return error;
		}
	},
);
