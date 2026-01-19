import { useLocation, useNavigate, useParams } from "react-router-dom";

interface RouterProps {
	router: {
		location: { pathname: string };
		navigate: (path: string) => void;
		params: Record<string, string>;
	};
}

function withRouter<T extends Record<string, unknown>>(
	Component: React.ComponentType<T & RouterProps>,
) {
	function ComponentWithRouterProp(props: T) {
		const location = useLocation();
		const navigate = useNavigate();
		const params = useParams();
		return <Component {...props} router={{ location, navigate, params }} />;
	}

	return ComponentWithRouterProp;
}

export default withRouter;
