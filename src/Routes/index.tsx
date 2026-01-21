import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import VerticalLayout from "../Layouts/index";
//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import AuthProtected from "./AuthProtected";
//routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import "react-toastify/dist/ReactToastify.css";

// Routes that should use VerticalLayout even without auth
const layoutRoutes = ["/index"];

const Index = () => {
	return (
		<>
			<Routes>
				<Route>
					{publicRoutes.map((route) => (
						<Route
							path={route.path}
							element={
								layoutRoutes.includes(route.path) ? (
									<VerticalLayout>{route.component}</VerticalLayout>
								) : (
									<NonAuthLayout>{route.component}</NonAuthLayout>
								)
							}
							key={route.path}
						/>
					))}
				</Route>

				<Route>
					{authProtectedRoutes.map((route) => (
						<Route
							path={route.path}
							element={
								<AuthProtected>
									<VerticalLayout>{route.component}</VerticalLayout>
								</AuthProtected>
							}
							key={route.path}
						/>
					))}
				</Route>
			</Routes>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</>
	);
};

export default Index;
