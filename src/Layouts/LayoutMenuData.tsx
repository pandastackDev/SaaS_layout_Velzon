import React from "react";

interface MenuItem {
	label: string;
	isHeader?: boolean;
	id?: string;
	icon?: string;
	link?: string;
	badgeName?: string;
	badgeColor?: string;
	subItems?: MenuItem[];
}

const Navdata = () => {
	const menuItems: MenuItem[] = [
		{
			label: "Menu",
			isHeader: true,
		},
		{
			id: "admin-dashboard",
			label: "Dashboard",
			link: "/admin/dashboard",
			icon: "ri-dashboard-2-line",
		},
		{
			id: "admin-projects",
			label: "Manage Projects",
			link: "/admin/projects",
			icon: "ri-file-edit-line",
		},
		{
			id: "admin-profile-approval",
			label: "Profile Approval",
			link: "/admin/profile-approval",
			icon: "ri-user-star-line",
		},
		{
			id: "admin-users",
			label: "Manage Users",
			link: "/admin/users",
			icon: "ri-user-settings-line",
		},
		{
			id: "admin-analytics",
			label: "Analytics",
			link: "/admin/analytics",
			icon: "ri-bar-chart-line",
		},
		{
			id: "admin-invoices",
			label: "View Invoices",
			link: "/admin/invoices",
			icon: "ri-file-list-line",
		},
		{
			id: "admin-pricing",
			label: "Manage Pricing",
			link: "/admin/pricing",
			icon: "ri-money-dollar-circle-line",
		},
		{
			id: "admin-advertising",
			label: "Advertising",
			link: "/admin/advertising",
			icon: "ri-image-line",
		},
		{
			id: "admin-subscriptions",
			label: "Subscriptions",
			link: "/admin/subscriptions",
			icon: "ri-vip-diamond-line",
		},
	];
	return menuItems;
};

export default Navdata;
