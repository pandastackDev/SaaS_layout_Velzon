import PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
//i18n
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Collapse } from "reactstrap";
import { createSelector } from "reselect";
import withRouter from "../../Components/Common/withRouter";
// Import Data
import navdata from "../LayoutMenuData";

interface MenuItem {
	label: string;
	isHeader?: boolean;
	id?: string;
	icon?: string;
	link?: string;
	badgeName?: string;
	badgeColor?: string;
	subItems?: MenuItem[];
	childItems?: MenuItem[];
	isChildItem?: boolean;
	stateVariables?: boolean;
	click?: () => void;
	[key: string]: unknown;
}

interface VerticalLayoutProps {
	router: {
		location: {
			pathname: string;
		};
	};
	t: (key: string) => string;
	layoutType?: string;
	[key: string]: unknown;
}

const VerticalLayout = (props: VerticalLayoutProps) => {
	const navDataResult = navdata();
	const navData =
		((navDataResult as { props?: { children?: MenuItem[] } })?.props
			?.children as MenuItem[]) || [];
	const path = props.router.location.pathname;

	/*
	 layout settings
	*/

	const selectLayoutState = (state: { Layout: Record<string, unknown> }) =>
		state.Layout;
	const selectLayoutProperties = createSelector(
		selectLayoutState,
		(layout) => ({
			leftsidbarSizeType: layout.leftsidbarSizeType,
			sidebarVisibilitytype: layout.sidebarVisibilitytype,
			layoutType: layout.layoutType,
		}),
	);
	// Inside your component
	const { leftsidbarSizeType, sidebarVisibilitytype, layoutType } = useSelector(
		selectLayoutProperties,
	);

	//vertical and semibox resize events
	const resizeSidebarMenu = useCallback(() => {
		const windowSize = document.documentElement.clientWidth;
		const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
		const hamburgerIcon = document.querySelector(".hamburger-icon");
		if (windowSize >= 1025) {
			if (document.documentElement.getAttribute("data-layout") === "vertical") {
				document.documentElement.setAttribute(
					"data-sidebar-size",
					leftsidbarSizeType,
				);
			}
			if (document.documentElement.getAttribute("data-layout") === "semibox") {
				document.documentElement.setAttribute(
					"data-sidebar-size",
					leftsidbarSizeType,
				);
			}
			if (
				(sidebarVisibilitytype === "show" ||
					layoutType === "vertical" ||
					layoutType === "twocolumn") &&
				document.querySelector(".hamburger-icon")
			) {
				if (hamburgerIcon !== null) {
					hamburgerIcon.classList.remove("open");
				}
			} else {
				// var hamburgerIcon = document.querySelector(".hamburger-icon");
				if (hamburgerIcon !== null) {
					hamburgerIcon.classList.add("open");
				}
			}
		} else if (windowSize < 1025 && windowSize > 767) {
			document.body.classList.remove("twocolumn-panel");
			if (document.documentElement.getAttribute("data-layout") === "vertical") {
				document.documentElement.setAttribute("data-sidebar-size", "sm");
			}
			if (document.documentElement.getAttribute("data-layout") === "semibox") {
				document.documentElement.setAttribute("data-sidebar-size", "sm");
			}
			if (hamburgerIcon) {
				hamburgerIcon.classList.add("open");
			}
		} else if (windowSize <= 767) {
			document.body.classList.remove("vertical-sidebar-enable");
			if (
				document.documentElement.getAttribute("data-layout") !== "horizontal"
			) {
				document.documentElement.setAttribute("data-sidebar-size", "lg");
			}
			if (hamburgerIcon) {
				hamburgerIcon.classList.add("open");
			}
		}
	}, [leftsidbarSizeType, sidebarVisibilitytype, layoutType]);

	useEffect(() => {
		window.addEventListener("resize", resizeSidebarMenu, true);
	}, [resizeSidebarMenu]);

	function activateParentDropdown(item: HTMLAnchorElement) {
		item.classList.add("active");
		const parentCollapseDiv = item.closest(".collapse.menu-dropdown");

		if (parentCollapseDiv) {
			// to set aria expand true remaining
			parentCollapseDiv.classList.add("show");
			parentCollapseDiv.parentElement.children[0].classList.add("active");
			parentCollapseDiv.parentElement.children[0].setAttribute(
				"aria-expanded",
				"true",
			);
			if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
				parentCollapseDiv.parentElement
					.closest(".collapse")
					.classList.add("show");
				if (
					parentCollapseDiv.parentElement.closest(".collapse")
						.previousElementSibling
				)
					parentCollapseDiv.parentElement
						.closest(".collapse")
						.previousElementSibling.classList.add("active");
				if (
					parentCollapseDiv.parentElement
						.closest(".collapse")
						.previousElementSibling.closest(".collapse")
				) {
					parentCollapseDiv.parentElement
						.closest(".collapse")
						.previousElementSibling.closest(".collapse")
						.classList.add("show");
					parentCollapseDiv.parentElement
						.closest(".collapse")
						.previousElementSibling.closest(".collapse")
						.previousElementSibling.classList.add("active");
				}
			}
			return false;
		}
		return false;
	}

	const removeActivation = (items: HTMLAnchorElement[]) => {
		const actiItems = items.filter((x) => x.classList.contains("active"));

		actiItems.forEach((item) => {
			if (item.classList.contains("menu-link")) {
				if (!item.classList.contains("active")) {
					item.setAttribute("aria-expanded", false);
				}
				if (item.nextElementSibling) {
					item.nextElementSibling.classList.remove("show");
				}
			}
			if (item.classList.contains("nav-link")) {
				if (item.nextElementSibling) {
					item.nextElementSibling.classList.remove("show");
				}
				item.setAttribute("aria-expanded", false);
			}
			item.classList.remove("active");
		});
	};

	return (
		<React.Fragment>
			{/* menu Items */}
			{(navData || []).map((item, index) => {
				return (
					<React.Fragment
						key={`menu-${index}-${item.id || item.label || index}`}
					>
						{/* Main Header */}
						{item.isHeader ? (
							<li className="menu-title">
								<span data-key="t-menu">{props.t(item.label)} </span>
							</li>
						) : item.subItems ? (
							<li className="nav-item">
								<Link
									onClick={item.click}
									className="nav-link menu-link"
									to={item.link ? item.link : "/#"}
									data-bs-toggle="collapse"
								>
									<i className={item.icon}></i>
									<span data-key="t-apps">{props.t(item.label)}</span>
									{item.badgeName ? (
										<span
											className={`badge badge-pill bg-${item.badgeColor}`}
											data-key="t-new"
										>
											{item.badgeName}
										</span>
									) : null}
								</Link>
								<Collapse
									className="menu-dropdown"
									isOpen={item.stateVariables}
									id="sidebarApps"
								>
									<ul className="nav nav-sm flex-column test">
										{/* subItms  */}
										{item.subItems &&
											(item.subItems || []).map((subItem, subIndex) => (
												<React.Fragment
													key={`submenu-${subIndex}-${subItem.id || subItem.label || subIndex}`}
												>
													{!subItem.isChildItem ? (
														<li className="nav-item">
															<Link
																to={subItem.link ? subItem.link : "/#"}
																className="nav-link"
															>
																{props.t(subItem.label)}
																{subItem.badgeName ? (
																	<span
																		className={
																			"badge badge-pill bg-" +
																			subItem.badgeColor
																		}
																		data-key="t-new"
																	>
																		{subItem.badgeName}
																	</span>
																) : null}
															</Link>
														</li>
													) : (
														<li className="nav-item">
															<Link
																onClick={subItem.click}
																className="nav-link"
																to="/#"
																data-bs-toggle="collapse"
															>
																{props.t(subItem.label)}
																{subItem.badgeName ? (
																	<span
																		className={
																			"badge badge-pill bg-" +
																			subItem.badgeColor
																		}
																		data-key="t-new"
																	>
																		{subItem.badgeName}
																	</span>
																) : null}
															</Link>
															<Collapse
																className="menu-dropdown"
																isOpen={subItem.stateVariables}
																id="sidebarEcommerce"
															>
																<ul className="nav nav-sm flex-column">
																	{/* child subItms  */}
																	{subItem.childItems &&
																		(subItem.childItems || []).map(
																			(childItem, childIndex) => (
																				<React.Fragment
																					key={`childmenu-${childIndex}-${childItem.id || childItem.label || childIndex}`}
																				>
																					{!childItem.childItems ? (
																						<li className="nav-item">
																							<Link
																								to={
																									childItem.link
																										? childItem.link
																										: "/#"
																								}
																								className="nav-link"
																							>
																								{props.t(childItem.label)}
																							</Link>
																						</li>
																					) : (
																						<li className="nav-item">
																							<Link
																								to="/#"
																								className="nav-link"
																								onClick={childItem.click}
																								data-bs-toggle="collapse"
																							>
																								{props.t(childItem.label)}
																							</Link>
																							<Collapse
																								className="menu-dropdown"
																								isOpen={
																									childItem.stateVariables
																								}
																								id="sidebaremailTemplates"
																							>
																								<ul className="nav nav-sm flex-column">
																									{childItem.childItems.map(
																										(
																											subChildItem,
																											subChildIndex,
																										) => (
																											<li
																												className="nav-item"
																												key={`subchildmenu-${subChildIndex}-${subChildItem.id || subChildItem.label || subChildIndex}`}
																											>
																												<Link
																													to={subChildItem.link}
																													className="nav-link"
																													data-key="t-basic-action"
																												>
																													{props.t(
																														subChildItem.label,
																													)}{" "}
																												</Link>
																											</li>
																										),
																									)}
																								</ul>
																							</Collapse>
																						</li>
																					)}
																				</React.Fragment>
																			),
																		)}
																</ul>
															</Collapse>
														</li>
													)}
												</React.Fragment>
											))}
									</ul>
								</Collapse>
							</li>
						) : (
							<li className="nav-item">
								<Link
									className="nav-link menu-link"
									to={item.link ? item.link : "/#"}
								>
									<i className={item.icon}></i>{" "}
									<span>{props.t(item.label)}</span>
									{item.badgeName ? (
										<span
											className={`badge badge-pill bg-${item.badgeColor}`}
											data-key="t-new"
										>
											{item.badgeName}
										</span>
									) : null}
								</Link>
							</li>
						)}
					</React.Fragment>
				);
			})}
		</React.Fragment>
	);
};

VerticalLayout.propTypes = {
	location: PropTypes.object,
	t: PropTypes.any,
};

export default withRouter(withTranslation()(VerticalLayout));
