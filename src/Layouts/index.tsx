import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
//redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import RightSidebar from "../Components/Common/RightSidebar";
import withRouter from "../Components/Common/withRouter";
//import actions
import {
	changeLayout,
	changeLayoutMode,
	changeLayoutPosition,
	changeLayoutWidth,
	changeLeftsidebarSizeType,
	changeLeftsidebarViewType,
	changeSidebarImageType,
	changeSidebarTheme,
	changeSidebarVisibility,
	changeTopbarTheme,
} from "../slices/thunks";
import Footer from "./Footer";
//import Components
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
	children: React.ReactNode;
	[key: string]: unknown;
}

const Layout = (props: LayoutProps) => {
	const [headerClass, setHeaderClass] = useState("");
	const dispatch = useDispatch();

	const selectLayoutState = (state: { Layout: Record<string, unknown> }) =>
		state.Layout;
	const selectLayoutProperties = createSelector(
		selectLayoutState,
		(layout) => ({
			layoutType: layout.layoutType,
			leftSidebarType: layout.leftSidebarType,
			layoutModeType: layout.layoutModeType,
			layoutWidthType: layout.layoutWidthType,
			layoutPositionType: layout.layoutPositionType,
			topbarThemeType: layout.topbarThemeType,
			leftsidbarSizeType: layout.leftsidbarSizeType,
			leftSidebarViewType: layout.leftSidebarViewType,
			leftSidebarImageType: layout.leftSidebarImageType,
			sidebarVisibilitytype: layout.sidebarVisibilitytype,
		}),
	);

	const {
		layoutType,
		leftSidebarType,
		layoutModeType,
		layoutWidthType,
		layoutPositionType,
		topbarThemeType,
		leftsidbarSizeType,
		leftSidebarViewType,
		leftSidebarImageType,
		sidebarVisibilitytype,
	} = useSelector(selectLayoutProperties);

	/*
    layout settings - Fixed values applied on mount
    */
	useEffect(() => {
		// Apply fixed layout settings
		dispatch(changeLayout(layoutType));
		dispatch(changeLayoutMode(layoutModeType));
		dispatch(changeLayoutWidth(layoutWidthType));
		dispatch(changeLayoutPosition(layoutPositionType));
		dispatch(changeTopbarTheme(topbarThemeType));
		dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
		dispatch(changeLeftsidebarViewType(leftSidebarViewType));
		dispatch(changeSidebarTheme(leftSidebarType));
		dispatch(changeSidebarImageType(leftSidebarImageType));
		dispatch(changeSidebarVisibility(sidebarVisibilitytype));
		window.dispatchEvent(new Event("resize"));
	}, [
		dispatch,
		layoutType,
		leftSidebarType,
		layoutModeType,
		layoutWidthType,
		layoutPositionType,
		topbarThemeType,
		leftsidbarSizeType,
		leftSidebarViewType,
		leftSidebarImageType,
		sidebarVisibilitytype,
	]);

	// class add remove in header
	useEffect(() => {
		window.addEventListener("scroll", scrollNavigation, true);
		return () => window.removeEventListener("scroll", scrollNavigation, true);
	});

	function scrollNavigation() {
		const scrollup = document.documentElement.scrollTop;
		if (scrollup > 50) {
			setHeaderClass("topbar-shadow");
		} else {
			setHeaderClass("");
		}
	}

	useEffect(() => {
		const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
		if (sidebarVisibilitytype === "show" || layoutType === "vertical") {
			humberIcon?.classList.remove("open");
		} else {
			humberIcon?.classList.add("open");
		}
	}, [sidebarVisibilitytype, layoutType]);

	return (
		<React.Fragment>
			<div id="layout-wrapper">
				<Header headerClass={headerClass} />
				<Sidebar layoutType={layoutType} />
				<div className="main-content">
					{props.children}
					<Footer />
				</div>
			</div>
			<RightSidebar />
		</React.Fragment>
	);
};

Layout.propTypes = {
	children: PropTypes.object,
};

export default withRouter(Layout);
