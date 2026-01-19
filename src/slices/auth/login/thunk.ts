//Include Both Helper File with needed methods

import {
	postFakeLogin,
	postJwtLogin,
} from "../../../helpers/fakebackend_helper";
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

import {
	apiError,
	loginSuccess,
	logoutUserSuccess,
	reset_login_flag,
} from "./reducer";

export const loginUser =
	(
		user: { email: string; password: string },
		history: (path: string) => void,
	) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			let response: Promise<unknown>;
			if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
				const fireBaseBackend = getFirebaseBackend();
				response = fireBaseBackend.loginUser(user.email, user.password);
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH === "jwt") {
				response = postJwtLogin({
					email: user.email,
					password: user.password,
				});
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH) {
				response = postFakeLogin({
					email: user.email,
					password: user.password,
				});
			} else {
				response = Promise.resolve(null);
			}

			const data = await response;

			if (data) {
				sessionStorage.setItem("authUser", JSON.stringify(data));
				if (import.meta.env.VITE_APP_DEFAULTAUTH === "fake") {
					const finallogin: unknown = JSON.parse(JSON.stringify(data));
					const parsedLogin = finallogin as { status?: string; data?: unknown };
					const loginData = parsedLogin.data;
					if (parsedLogin.status === "success") {
						dispatch(loginSuccess(loginData));
						history("/dashboard");
					} else {
						dispatch(apiError(finallogin));
					}
				} else {
					dispatch(loginSuccess(data));
					history("/dashboard");
				}
			}
		} catch (error) {
			dispatch(apiError(error));
		}
	};

export const logoutUser = () => async (dispatch: (action: unknown) => void) => {
	try {
		sessionStorage.removeItem("authUser");
		const fireBaseBackend = getFirebaseBackend();
		if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
			const response = fireBaseBackend.logout;
			dispatch(logoutUserSuccess(response));
		} else {
			dispatch(logoutUserSuccess(true));
		}
	} catch (error) {
		dispatch(apiError(error));
	}
};

export const socialLogin =
	(type: string, history: (path: string) => void) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			let response: Promise<unknown>;

			if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
				const fireBaseBackend = getFirebaseBackend();
				response = fireBaseBackend.socialLoginUser(type);
			} else {
				response = Promise.resolve(null);
			}
			//  else {
			//   response = postSocialLogin(data);
			// }

			const socialdata = await response;
			if (socialdata) {
				sessionStorage.setItem("authUser", JSON.stringify(response));
				dispatch(loginSuccess(response));
				history("/dashboard");
			}
		} catch (error) {
			dispatch(apiError(error));
		}
	};

export const resetLoginFlag =
	() => async (dispatch: (action: unknown) => void) => {
		try {
			const response = dispatch(reset_login_flag());
			return response;
		} catch (error) {
			dispatch(apiError(error));
		}
	};
