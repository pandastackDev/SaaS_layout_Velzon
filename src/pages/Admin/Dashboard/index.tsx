import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import AdminKPICards from "./AdminKPICards";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { KPICardsSkeleton } from "../../../Components/Common/LoadingSkeleton";

const AdminDashboard = () => {
	document.title = "Admin Dashboard | PITCH INVEST";

	const { isAdmin, loading: adminLoading } = useAdmin();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalUsers: 0,
		pendingProjects: 0,
		approvedProjects: 0,
		activeSubscriptions: 0,
		totalInvoices: 0,
		totalRevenue: 0,
	});

	useEffect(() => {
		// Don't do anything while still checking admin status
		if (adminLoading) {
			return;
		}

		// Only redirect if we're sure user is not admin (not during loading/checking)
		if (!isAdmin && !adminLoading) {
			console.log("User is not admin, redirecting to dashboard");
			navigate("/dashboard", { replace: true });
			return;
		}

		// User is admin, load data
		if (isAdmin) {
			loadStats();
		}
	}, [isAdmin, adminLoading, navigate]);

	const loadStats = async () => {
		try {
			setLoading(true);

			// Fetch total users
			const { count: usersCount } = await supabase
				.from("users")
				.select("*", { count: "exact", head: true });

			// Fetch pending projects
			const { count: pendingCount } = await supabase
				.from("projects")
				.select("*", { count: "exact", head: true })
				.eq("status", "pending");

			// Fetch approved projects
			const { count: approvedCount } = await supabase
				.from("projects")
				.select("*", { count: "exact", head: true })
				.in("status", ["approved", "active"]);

			// Fetch total invoices
			const { count: invoicesCount } = await supabase
				.from("invoices")
				.select("*", { count: "exact", head: true });

			// Fetch total revenue (sum of paid invoices)
			const { data: invoices } = await supabase
				.from("invoices")
				.select("total_amount, payment_status")
				.eq("payment_status", "paid");

			const revenue =
				invoices?.reduce(
					(sum, inv) => sum + (parseFloat(inv.total_amount) || 0),
					0
				) || 0;

			// Fetch active subscriptions
			const { count: subscriptionsCount } = await supabase
				.from("subscriptions")
				.select("*", { count: "exact", head: true })
				.eq("status", "active");

			setStats({
				totalUsers: usersCount || 0,
				pendingProjects: pendingCount || 0,
				approvedProjects: approvedCount || 0,
				activeSubscriptions: subscriptionsCount || 0,
				totalInvoices: invoicesCount || 0,
				totalRevenue: revenue,
			});
		} catch (error: any) {
			console.error("Error loading stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Dashboard" pageTitle="Admin" />
					<KPICardsSkeleton />
				</Container>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Dashboard" pageTitle="Admin" />
				
				{/* KPI Cards Section */}
				<AdminKPICards stats={stats} />

				{/* Quick Actions Section */}
				<QuickActions />

				{/* Recent Activity Section */}
				<RecentActivity />
			</Container>
		</div>
	);
};

export default AdminDashboard;
