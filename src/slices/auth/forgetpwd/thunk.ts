import {
	postFakeForgetPwd,
	postJwtForgetPwd,
} from "../../../helpers/fakebackend_helper";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import { userForgetPasswordError, userForgetPasswordSuccess } from "./reducer";

const fireBaseBackend = getFirebaseBackend();

export const userForgetPassword =
	(user: { email: string; [key: string]: unknown }, _history: unknown) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			let response: Promise<unknown>;
			if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
				response = fireBaseBackend.forgetPassword(user.email);
			} else if (import.meta.env.VITE_APP_DEFAULTAUTH === "jwt") {
				response = postJwtForgetPwd(user.email);
			} else {
				response = postFakeForgetPwd(user.email);
			}

			const data = await response;

			if (data) {
				dispatch(
					userForgetPasswordSuccess(
						"Reset link are sended to your mailbox, check there first",
					),
				);
			}
		} catch (forgetError) {
			dispatch(userForgetPasswordError(forgetError));
		}
	};
