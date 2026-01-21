import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import SimpleBar from "simplebar-react";
import { Link } from "react-router-dom";
import { getActivities, Activity } from "../../../lib/activityTracker";

const RecentActivity = () => {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadActivities();
		
		// Refresh activities every 2 seconds to show new activities
		const interval = setInterval(() => {
			loadActivities();
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	const loadActivities = () => {
		try {
			const allActivities = getActivities();
			setActivities(allActivities);
			setIsLoading(false);
		} catch (error) {
			console.error("Error loading activities:", error);
			setIsLoading(false);
		}
	};

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return "Just now";
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		} else if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days} day${days > 1 ? "s" : ""} ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	const getActivityIcon = (icon: string, iconClass: string) => {
		return (
			<div className={`avatar-xs flex-shrink-0`}>
				<span className={`avatar-title bg-${iconClass}-subtle rounded-circle`}>
					<i className={`${icon} text-${iconClass}`}></i>
				</span>
			</div>
		);
	};

	const groupActivitiesByDate = (activities: Activity[]) => {
		const groups: { [key: string]: Activity[] } = {};
		
		activities.forEach((activity) => {
			const date = new Date(activity.timestamp);
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			let dateKey: string;
			if (date.toDateString() === today.toDateString()) {
				dateKey = "Today";
			} else if (date.toDateString() === yesterday.toDateString()) {
				dateKey = "Yesterday";
			} else {
				dateKey = date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				});
			}

			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(activity);
		});

		return groups;
	};

	const activityGroups = groupActivitiesByDate(activities);

	if (isLoading) {
		return (
			<Row className="mt-4">
				<Col xs={12}>
					<Card>
						<CardHeader>
							<h4 className="card-title mb-0 flex-grow-1">Recent Activity</h4>
						</CardHeader>
						<CardBody>
							<div className="text-center py-5">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>
		);
	}

	return (
		<Row className="mt-4">
			<Col xs={12}>
				<Card>
					<CardHeader className="align-items-center d-flex">
						<h4 className="card-title mb-0 flex-grow-1">Recent Activity</h4>
					</CardHeader>
					<CardBody className="p-0">
						{activities.length === 0 ? (
							<div className="text-center py-5">
								<i className="ri-time-line text-muted" style={{ fontSize: "3rem" }}></i>
								<p className="text-muted mb-1 mt-3">No recent activity</p>
								<p className="text-muted">Activity will appear here as you perform actions</p>
							</div>
						) : (
							<SimpleBar style={{ maxHeight: "500px" }}>
								<div className="p-3">
									{Object.entries(activityGroups).map(([dateKey, dateActivities]) => (
										<div key={dateKey}>
											<h6 className="text-muted text-uppercase mb-3 fs-11">
												{dateKey}
											</h6>
											{dateActivities.map((activity) => (
												<div
													key={activity.id}
													className="d-flex align-items-center mb-3"
												>
													{getActivityIcon(activity.icon, activity.iconClass)}
													<div className="flex-grow-1 ms-3">
														<h6 className="fs-13 mb-1">{activity.title}</h6>
														<p className="text-muted fs-12 mb-0">
															{activity.description}
														</p>
													</div>
													<div className="flex-shrink-0 text-end">
														<p className="text-muted fs-12 mb-0">
															{formatTime(activity.timestamp)}
														</p>
													</div>
												</div>
											))}
										</div>
									))}
								</div>
							</SimpleBar>
						)}
					</CardBody>
				</Card>
			</Col>
		</Row>
	);
};

export default RecentActivity;
