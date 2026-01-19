import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import withRouter from "./withRouter";

interface RightSidebarProps {
	router: {
		location: {
			pathname: string;
		};
	};
}

const RightSidebar = (props: RightSidebarProps) => {
	const selectLayoutProperties = createSelector(
		(state: { Layout: { preloader: string } }) => state.Layout,
		(layout) => ({
			preloader: layout.preloader,
		}),
	);

	const { preloader } = useSelector(selectLayoutProperties);

	window.onscroll = () => {
		scrollFunction();
	};

	const scrollFunction = () => {
		const element = document.getElementById("back-to-top");
		if (element) {
			if (
				document.body.scrollTop > 100 ||
				document.documentElement.scrollTop > 100
			) {
				element.style.display = "block";
			} else {
				element.style.display = "none";
			}
		}
	};

	const toTop = () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	};

	const _pathName = props.router.location.pathname;

	useEffect(() => {
		const preloaderElement = document.getElementById(
			"preloader",
		) as HTMLElement;

		if (preloaderElement) {
			preloaderElement.style.opacity = "1";
			preloaderElement.style.visibility = "visible";

			setTimeout(() => {
				preloaderElement.style.opacity = "0";
				preloaderElement.style.visibility = "hidden";
			}, 1000);
		}
	}, []);

	return (
		<React.Fragment>
			{/* Back to Top Button */}
			<button
				type="button"
				onClick={() => toTop()}
				className="btn btn-danger btn-icon"
				id="back-to-top"
			>
				<i className="ri-arrow-up-line"></i>
			</button>

			{/* Preloader - Always Enabled */}
			{preloader === "enable" && (
				<div id="preloader">
					<div id="status" role="status" aria-label="Loading">
						<div className="spinner-border text-primary avatar-sm">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
};

export default withRouter(RightSidebar);
