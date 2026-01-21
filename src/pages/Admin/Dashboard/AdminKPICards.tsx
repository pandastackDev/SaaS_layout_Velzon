import React from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

interface KPICard {
	title: string;
	value: number;
	icon: string;
	iconClass: string;
	color: string;
	link: string;
	isCurrency?: boolean;
}

interface AdminKPICardsProps {
	stats: {
		totalUsers: number;
		pendingProjects: number;
		approvedProjects: number;
		activeSubscriptions: number;
		totalInvoices: number;
		totalRevenue: number;
	};
}

const AdminKPICards: React.FC<AdminKPICardsProps> = ({ stats }) => {
	const kpiCards: KPICard[] = [
		{
			title: "Total Users",
			value: stats.totalUsers,
			icon: "ri-user-line",
			iconClass: "primary",
			color: "primary",
			link: "/admin/users",
		},
		{
			title: "Pending Projects",
			value: stats.pendingProjects,
			icon: "ri-time-line",
			iconClass: "warning",
			color: "warning",
			link: "/admin/projects",
		},
		{
			title: "Approved Projects",
			value: stats.approvedProjects,
			icon: "ri-checkbox-circle-line",
			iconClass: "success",
			color: "success",
			link: "/admin/projects",
		},
		{
			title: "Active Subscriptions",
			value: stats.activeSubscriptions,
			icon: "ri-vip-diamond-line",
			iconClass: "info",
			color: "info",
			link: "/admin/subscriptions",
		},
		{
			title: "Total Invoices",
			value: stats.totalInvoices,
			icon: "ri-file-list-line",
			iconClass: "secondary",
			color: "secondary",
			link: "/admin/invoices",
		},
		{
			title: "Total Revenue",
			value: stats.totalRevenue,
			icon: "ri-money-dollar-circle-line",
			iconClass: "success",
			color: "success",
			link: "/admin/invoices",
			isCurrency: true,
		},
	];

	return (
		<Row>
			{kpiCards.map((card, key) => (
				<Col xl={4} md={6} sm={12} key={key}>
					<Card className="card-animate">
						<CardBody>
							<div className="d-flex justify-content-between">
								<div>
									<p className="fw-medium text-muted mb-0">{card.title}</p>
									<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
										<span className="counter-value" data-target={card.value}>
											{card.isCurrency ? (
												<>
													$
													<CountUp
														start={0}
														end={card.value}
														decimals={2}
														duration={4}
													/>
												</>
											) : (
												<CountUp
													start={0}
													end={card.value}
													duration={4}
												/>
											)}
										</span>
									</h2>
									<p className="mb-0 text-muted text-truncate">
										<Link to={card.link} className="link-primary">
											View Details <i className="ri-arrow-right-line align-middle"></i>
										</Link>
									</p>
								</div>
								<div>
									<div className="avatar-sm flex-shrink-0">
										<span
											className={`avatar-title bg-${card.color}-subtle rounded-circle fs-2`}
										>
											<i className={`${card.icon} text-${card.color}`}></i>
										</span>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			))}
		</Row>
	);
};

export default AdminKPICards;
