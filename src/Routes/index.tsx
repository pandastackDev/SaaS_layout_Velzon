import React from "react";
import { Routes, Route } from "react-router-dom";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";

//routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import AuthProtected from "./AuthProtected";

// Routes that should use VerticalLayout even without auth
const layoutRoutes = ["/dashboard", "/index", "/"];

const Index = () => {
	return (
		<React.Fragment>
			<Routes>
				<Route>
					{publicRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								layoutRoutes.includes(route.path) ? (
									<VerticalLayout>{route.component}</VerticalLayout>
								) : (
									<NonAuthLayout>{route.component}</NonAuthLayout>
								)
							}
							key={idx}
						/>
					))}
				</Route>

				<Route>
					{authProtectedRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								<AuthProtected>
									<VerticalLayout>{route.component}</VerticalLayout>
								</AuthProtected>
							}
							key={idx}
						/>
					))}
				</Route>
			</Routes>
		</React.Fragment>
	);
};

export default Index;
