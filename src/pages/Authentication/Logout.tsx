import PropTypes from "prop-types";
import { useEffect } from "react";
//redux
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { createSelector } from "reselect";

import withRouter from "../../Components/Common/withRouter";
import { logoutUser } from "../../slices/thunks";

const Logout = (_props: any) => {
	const dispatch: any = useDispatch();

	const logoutData = createSelector(
		// (state) => state.Dashboard.productOverviewChart,
		(state) => state.Login,
		(isUserLogout: any) => isUserLogout.isUserLogout,
	);

	// Inside your component
	const isUserLogout = useSelector(logoutData);

	useEffect(() => {
		dispatch(logoutUser());
	}, [dispatch]);

	if (isUserLogout) {
		return <Navigate to="/login" />;
	}

	return <></>;
};

Logout.propTypes = {
	history: PropTypes.object,
};

export default withRouter(Logout);
