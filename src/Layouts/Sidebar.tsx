import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import SimpleBar from "simplebar-react";
//import logo
import mainLogo from "../assets/images/main-logo/logo.png";
import smallLogo from "../assets/images/main-logo/small-logo.png";
//Import Components
import VerticalLayout from "./VerticalLayouts";

interface SidebarProps {
	layoutType?: string;
}

const Sidebar = ({ layoutType }: SidebarProps) => {
	useEffect(() => {
		const verticalOverlay = document.getElementsByClassName("vertical-overlay");
		if (verticalOverlay) {
			verticalOverlay[0].addEventListener("click", () => {
				document.body.classList.remove("vertical-sidebar-enable");
			});
		}
	});

	const addEventListenerOnSmHoverMenu = () => {
		// add listener Sidebar Hover icon on change layout from setting
		if (
			document.documentElement.getAttribute("data-sidebar-size") === "sm-hover"
		) {
			document.documentElement.setAttribute(
				"data-sidebar-size",
				"sm-hover-active",
			);
		} else if (
			document.documentElement.getAttribute("data-sidebar-size") ===
			"sm-hover-active"
		) {
			document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
		} else {
			document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
		}
	};

	return (
		<React.Fragment>
			<div className="app-menu navbar-menu">
				<div className="navbar-brand-box">
					<Link to="/" className="logo logo-dark">
						<span className="logo-sm">
							<img
								src={smallLogo}
								alt=""
								height="22"
								style={{
									transform: "scale(1.8)",
									transformOrigin: "center center",
								}}
							/>
						</span>
						<span className="logo-lg">
							<img
								src={mainLogo}
								alt=""
								height="17"
								style={{
									transform: "scale(2.5)",
									transformOrigin: "center center",
								}}
							/>
						</span>
					</Link>

					<Link to="/" className="logo logo-light">
						<span className="logo-sm">
							<img
								src={smallLogo}
								alt=""
								height="22"
								style={{
									transform: "scale(1.8)",
									transformOrigin: "center center",
								}}
							/>
						</span>
						<span className="logo-lg">
							<img
								src={mainLogo}
								alt=""
								height="17"
								style={{
									transform: "scale(2.5)",
									transformOrigin: "center center",
								}}
							/>
						</span>
					</Link>
					<button
						onClick={addEventListenerOnSmHoverMenu}
						type="button"
						className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
						id="vertical-hover"
					>
						<i className="ri-record-circle-line"></i>
					</button>
				</div>
				{/* Vertical Layout Only */}
				<SimpleBar id="scrollbar" className="h-100">
					<Container fluid>
						<div id="two-column-menu"></div>
						<ul className="navbar-nav" id="navbar-nav">
							<VerticalLayout layoutType={layoutType} />
						</ul>
					</Container>
				</SimpleBar>
				<div className="sidebar-background"></div>
			</div>
			<div className="vertical-overlay"></div>
		</React.Fragment>
	);
};

export default Sidebar;
