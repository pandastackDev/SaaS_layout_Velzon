import React from "react";

const Navdata = () => {
	const menuItems: any = [
		{
			label: "Menu",
			isHeader: true,
		},
		{
			id: "dashboard",
			label: "Dashboard",
			icon: "ri-dashboard-2-line",
			link: "/dashboard",
		},
		{
			id: "gallery",
			label: "Gallery",
			icon: "ri-gallery-line",
			link: "/gallery",
		},
		{
			id: "investors",
			label: "Investors",
			icon: "ri-user-star-line",
			link: "/investors",
		},
		{
			id: "blog",
			label: "Blog",
			icon: "ri-article-line",
			link: "/blog",
		},
		{
			id: "contact",
			label: "Contact",
			icon: "ri-contacts-line",
			link: "/contact",
		},
		{
			id: "about-us",
			label: "About Us",
			icon: "ri-information-line",
			link: "/about-us",
		},
	];
	return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
