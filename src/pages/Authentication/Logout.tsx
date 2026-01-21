import PropTypes from "prop-types";
import { useEffect, useState } from "react";
//redux
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { createSelector } from "reselect";

import withRouter from "../../Components/Common/withRouter";
import { logoutUser } from "../../slices/thunks";
import { useAuth } from "../../hooks/useAuth";

const Logout = (_props: any) => {
	const dispatch: any = useDispatch();
	const { user, signOut } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const logoutData = createSelector(
		// (state) => state.Dashboard.productOverviewChart,
		(state) => state.Login,
		(isUserLogout: any) => isUserLogout.isUserLogout,
	);

	// Inside your component
	const isUserLogout = useSelector(logoutData);

	useEffect(() => {
		const performLogout = async () => {
			if (isLoggingOut) return;
			setIsLoggingOut(true);

			try {
				// If Supabase user exists, use Supabase signOut
				if (user) {
					await signOut();
					// Clear sessionStorage
					sessionStorage.removeItem("authUser");
				}
				
				// Always call Redux logout for compatibility
				dispatch(logoutUser());
			} catch (error) {
				console.error("Logout error:", error);
				// Still proceed with Redux logout
				dispatch(logoutUser());
			} finally {
				setIsLoggingOut(false);
			}
		};

		performLogout();
	}, [dispatch, user, signOut, isLoggingOut]);

	if (isUserLogout || isLoggingOut) {
		return <Navigate to="/login" replace />;
	}

	return <></>;
};

Logout.propTypes = {
	history: PropTypes.object,
};

export default withRouter(Logout);
