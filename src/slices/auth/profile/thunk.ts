//Include Both Helper File with needed methods

import {
	postFakeProfile,
	postJwtProfile,
} from "../../../helpers/fakebackend_helper";
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

// action
import {
	profileError,
	profileSuccess,
	resetProfileFlagChange,
} from "./reducer";

const fireBaseBackend = getFirebaseBackend();

export const editProfile =
	(user: {
		username?: string;
		idx?: string | number;
		[key: string]: unknown;
	}) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			let response: Promise<unknown>;

			if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
				response = fireBaseBackend.editProfileAPI(user.username, user.idx);
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH === "jwt") {
				response = postJwtProfile({
					username: user.username,
					idx: user.idx,
				});
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH === "fake") {
				response = postFakeProfile(user);
			} else {
				response = Promise.resolve(null);
			}

			const data = await response;

			if (data) {
				dispatch(profileSuccess(data));
			}
		} catch (error) {
			dispatch(profileError(error));
		}
	};

export const resetProfileFlag = () => {
	try {
		const response = resetProfileFlagChange();
		return response;
	} catch (error) {
		return error;
	}
};
