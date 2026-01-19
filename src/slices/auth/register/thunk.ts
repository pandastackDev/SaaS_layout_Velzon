//Include Both Helper File with needed methods

import {
	postFakeRegister,
	postJwtRegister,
} from "../../../helpers/fakebackend_helper";
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

// action
import {
	registerUserFailed,
	registerUserSuccessful,
	resetRegisterFlagChange,
	// apiErrorChange
} from "./reducer";

// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend();

// Is user register successfull then direct plot user in redux.
export const registerUser =
	(user: { email: string; password: string; [key: string]: unknown }) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			let response: Promise<unknown>;

			if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
				response = fireBaseBackend.registerUser(user.email, user.password);
				// yield put(registerUserSuccessful(response));
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH === "jwt") {
				response = postJwtRegister("/post-jwt-register", user);
				// yield put(registerUserSuccessful(response));
			} else if (import.meta.env.VITE_APP_API_URL) {
				response = postFakeRegister(user);
				const data = (await response) as {
					message?: string;
					[key: string]: unknown;
				};

				if (data.message === "success") {
					dispatch(registerUserSuccessful(data));
				} else {
					dispatch(registerUserFailed(data));
				}
			} else {
				response = Promise.resolve(null);
			}
		} catch (error) {
			dispatch(registerUserFailed(error));
		}
	};

export const resetRegisterFlag = () => {
	try {
		const response = resetRegisterFlagChange();
		return response;
	} catch (error) {
		return error;
	}
};

// export const apiError = () => async (dispatch : any) => {
//   try {
//     const response = dispatch(apiErrorChange(false));
//     return response;
//   } catch (error) {
//     return error;
//   }
// };
