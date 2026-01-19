import React, { useEffect } from "react";
import withRouter from "./withRouter";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const RightSidebar = (props: any) => {
	const selectLayoutProperties = createSelector(
		(state: any) => state.Layout,
		(layout) => ({
			preloader: layout.preloader,
		}),
	);

	const { preloader } = useSelector(selectLayoutProperties);

	window.onscroll = function () {
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

	const pathName = props.router.location.pathname;

	useEffect(() => {
		const preloaderElement = document.getElementById(
			"preloader",
		) as HTMLElement;

		if (preloaderElement) {
			preloaderElement.style.opacity = "1";
			preloaderElement.style.visibility = "visible";

			setTimeout(function () {
				preloaderElement.style.opacity = "0";
				preloaderElement.style.visibility = "hidden";
			}, 1000);
		}
	}, [preloader, pathName]);

	return (
		<React.Fragment>
			{/* Back to Top Button */}
			<button
				onClick={() => toTop()}
				className="btn btn-danger btn-icon"
				id="back-to-top"
			>
				<i className="ri-arrow-up-line"></i>
			</button>

			{/* Preloader - Always Enabled */}
			{preloader === "enable" && (
				<div id="preloader">
					<div id="status">
						<div
							className="spinner-border text-primary avatar-sm"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
};

export default withRouter(RightSidebar);
