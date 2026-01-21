import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

interface QuickAction {
	title: string;
	description: string;
	icon: string;
	iconClass: string;
	color: string;
	link: string;
}

const quickActions: QuickAction[] = [
	{
		title: "Manage Projects",
		description: "Approve or reject pending projects",
		icon: "ri-file-edit-line",
		iconClass: "primary",
		color: "primary",
		link: "/admin/projects",
	},
	{
		title: "Profile Approval",
		description: "Approve or reject user profiles",
		icon: "ri-user-star-line",
		iconClass: "success",
		color: "success",
		link: "/admin/profile-approval",
	},
	{
		title: "Manage Users",
		description: "View and manage all users",
		icon: "ri-user-line",
		iconClass: "info",
		color: "info",
		link: "/admin/users",
	},
	{
		title: "Analytics",
		description: "View charts and performance metrics",
		icon: "ri-bar-chart-line",
		iconClass: "purple",
		color: "purple",
		link: "/admin/analytics",
	},
	{
		title: "View Invoices",
		description: "View all invoices and payments",
		icon: "ri-file-list-line",
		iconClass: "teal",
		color: "teal",
		link: "/admin/invoices",
	},
	{
		title: "Manage Pricing",
		description: "Set subscription and advertising prices",
		icon: "ri-money-dollar-circle-line",
		iconClass: "warning",
		color: "warning",
		link: "/admin/pricing",
	},
	{
		title: "Advertising",
		description: "Upload and manage banners and logos",
		icon: "ri-image-line",
		iconClass: "danger",
		color: "danger",
		link: "/admin/advertising",
	},
	{
		title: "Subscriptions",
		description: "View all subscription history and details",
		icon: "ri-vip-diamond-line",
		iconClass: "info",
		color: "info",
		link: "/admin/subscriptions",
	},
];

const QuickActions = () => {
	return (
		<Row>
			<Col xs={12}>
				<h4 className="card-title mb-4">Quick Actions</h4>
			</Col>
			{quickActions.map((action, key) => (
				<Col xl={3} md={4} sm={6} key={key}>
					<Card className="card-animate">
						<CardBody>
							<Link to={action.link} className="text-decoration-none text-body">
								<div className="d-flex align-items-center">
									<div className="flex-shrink-0">
										<div className="avatar-sm flex-shrink-0">
											<span
												className={`avatar-title bg-${action.color}-subtle rounded-circle fs-2`}
											>
												<i className={`${action.icon} text-${action.color}`}></i>
											</span>
										</div>
									</div>
									<div className="flex-grow-1 ms-3">
										<h6 className="mb-1">{action.title}</h6>
										<p className="text-muted mb-0">{action.description}</p>
									</div>
									<div className="flex-shrink-0">
										<i className="ri-arrow-right-line text-muted"></i>
									</div>
								</div>
							</Link>
						</CardBody>
					</Card>
				</Col>
			))}
		</Row>
	);
};

export default QuickActions;
