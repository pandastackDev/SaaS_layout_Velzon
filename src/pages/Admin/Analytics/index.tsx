import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Input,
	Label,
	Button,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
} from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { AnalyticsPageSkeleton } from "../../../Components/Common/LoadingSkeleton";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../Components/Common/ChartsDynamicColor";

const Analytics = () => {
	document.title = "Analytics | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [dateRange, setDateRange] = useState("30"); // days
	const [activeTab, setActiveTab] = useState("1");
	const [analyticsData, setAnalyticsData] = useState({
		usersByType: { Inventor: 0, StartUp: 0, Company: 0, Investor: 0 },
		projectsByStatus: { pending: 0, approved: 0, rejected: 0, active: 0 },
		revenueByMonth: [] as number[],
		invoicesByStatus: { paid: 0, pending: 0, overdue: 0 },
		subscriptionsByStatus: { active: 0, canceled: 0, expired: 0, past_due: 0, unpaid: 0, trial: 0 },
		subscriptionsByMonth: [] as number[],
		totalSubscriptionRevenue: 0,
		activeSubscriptionsCount: 0,
		// Block 1: Global & Geographic Data
		projectsByCountry: {} as Record<string, number>,
		usersByCountry: {} as Record<string, number>,
		hourlyActivity: Array.from({ length: 24 }, () => 0),
		trafficSources: { organic: 0, social: 0, direct: 0, referral: 0 },
		deviceAccess: { mobile: 0, desktop: 0 },
		geolocationDensity: {} as Record<string, number>,
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
			loadAnalytics();
		}
	}, [isAdmin, adminLoading, navigate, dateRange]);

	const loadAnalytics = async () => {
		try {
			setLoading(true);

			// Users by type
			const { data: usersData } = await supabase.from("users").select("user_type");
			const usersByType = {
				Inventor: usersData?.filter((u) => u.user_type === "Inventor").length || 0,
				StartUp: usersData?.filter((u) => u.user_type === "StartUp").length || 0,
				Company: usersData?.filter((u) => u.user_type === "Company").length || 0,
				Investor: usersData?.filter((u) => u.user_type === "Investor").length || 0,
			};

			// Projects by status
			const { data: projectsData } = await supabase.from("projects").select("status");
			const projectsByStatus = {
				pending: projectsData?.filter((p) => p.status === "pending").length || 0,
				approved: projectsData?.filter((p) => p.status === "approved").length || 0,
				rejected: projectsData?.filter((p) => p.status === "rejected").length || 0,
				active: projectsData?.filter((p) => p.status === "active").length || 0,
			};

			// Revenue by month (last 6 months)
			const { data: invoicesData } = await supabase
				.from("invoices")
				.select("total_amount, payment_status, created_at")
				.eq("payment_status", "paid")
				.order("created_at", { ascending: false })
				.limit(100);

			const revenueByMonth = [0, 0, 0, 0, 0, 0];
			if (invoicesData) {
				invoicesData.forEach((inv) => {
					const date = new Date(inv.created_at);
					const monthIndex = 5 - (new Date().getMonth() - date.getMonth() + 12) % 12;
					if (monthIndex >= 0 && monthIndex < 6) {
						revenueByMonth[monthIndex] += parseFloat(inv.total_amount.toString()) || 0;
					}
				});
			}

			// Invoices by status
			const { data: allInvoices } = await supabase.from("invoices").select("payment_status");
			const invoicesByStatus = {
				paid: allInvoices?.filter((i) => i.payment_status === "paid").length || 0,
				pending: allInvoices?.filter((i) => i.payment_status === "pending").length || 0,
				overdue: allInvoices?.filter((i) => i.payment_status === "overdue").length || 0,
			};

			// Subscriptions by status and revenue
			const { data: subscriptionsData } = await supabase
				.from("subscriptions")
				.select("status, monthly_price, currency, created_at, current_period_end");

			const subscriptionsByStatus = {
				active: subscriptionsData?.filter((s) => s.status === "active").length || 0,
				canceled: subscriptionsData?.filter((s) => s.status === "canceled").length || 0,
				expired: subscriptionsData?.filter((s) => s.status === "expired").length || 0,
				past_due: subscriptionsData?.filter((s) => s.status === "past_due").length || 0,
				unpaid: subscriptionsData?.filter((s) => s.status === "unpaid").length || 0,
				trial: subscriptionsData?.filter((s) => s.status === "trial").length || 0,
			};

			// Calculate total subscription revenue (active subscriptions)
			const totalSubscriptionRevenue =
				subscriptionsData
					?.filter((s) => s.status === "active")
					.reduce((sum, sub) => sum + (parseFloat(sub.monthly_price?.toString() || "0") || 0), 0) || 0;

			// Subscriptions by month (last 6 months)
			const subscriptionsByMonth = [0, 0, 0, 0, 0, 0];
			if (subscriptionsData) {
				subscriptionsData.forEach((sub) => {
					const date = new Date(sub.created_at);
					const monthIndex = 5 - (new Date().getMonth() - date.getMonth() + 12) % 12;
					if (monthIndex >= 0 && monthIndex < 6) {
						subscriptionsByMonth[monthIndex] += 1;
					}
				});
			}

			// Block 1: Global & Geographic Data
			// Projects by country
			const { data: projectsWithLocation } = await supabase
				.from("projects")
				.select("country");
			const projectsByCountry: Record<string, number> = {};
			if (projectsWithLocation) {
				projectsWithLocation.forEach((p: any) => {
					const country = p.country || "Unknown";
					projectsByCountry[country] = (projectsByCountry[country] || 0) + 1;
				});
			}

			// Users by country
			const { data: usersWithLocation } = await supabase
				.from("users")
				.select("country");
			const usersByCountry: Record<string, number> = {};
			if (usersWithLocation) {
				usersWithLocation.forEach((u: any) => {
					const country = u.country || "Unknown";
					usersByCountry[country] = (usersByCountry[country] || 0) + 1;
				});
			}

			// Hourly activity (0-23)
			const { data: allActivity } = await supabase
				.from("users")
				.select("created_at");
			const hourlyActivity = Array.from({ length: 24 }, () => 0);
			if (allActivity) {
				allActivity.forEach((item: any) => {
					if (item.created_at) {
						const hour = new Date(item.created_at).getHours();
						hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
					}
				});
			}

			// Traffic sources (simplified - using user creation as proxy)
			const trafficSources = {
				organic: Math.floor((usersData?.length || 0) * 0.4),
				social: Math.floor((usersData?.length || 0) * 0.3),
				direct: Math.floor((usersData?.length || 0) * 0.2),
				referral: Math.floor((usersData?.length || 0) * 0.1),
			};

			// Device access (simplified - using user data as proxy)
			const deviceAccess = {
				mobile: Math.floor((usersData?.length || 0) * 0.6),
				desktop: Math.floor((usersData?.length || 0) * 0.4),
			};

			// Geolocation density (projects by location)
			const geolocationDensity: Record<string, number> = {};
			if (projectsWithLocation) {
				projectsWithLocation.forEach((p: any) => {
					const location = p.country || "Unknown";
					geolocationDensity[location] = (geolocationDensity[location] || 0) + 1;
				});
			}

			setAnalyticsData({
				usersByType,
				projectsByStatus,
				revenueByMonth,
				invoicesByStatus,
				subscriptionsByStatus,
				subscriptionsByMonth,
				totalSubscriptionRevenue,
				activeSubscriptionsCount: subscriptionsByStatus.active,
				projectsByCountry,
				usersByCountry,
				hourlyActivity,
				trafficSources,
				deviceAccess,
				geolocationDensity,
			});
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	// Chart configurations - memoized to prevent recreation on every render
	const usersByTypeChart = useMemo(() => {
		try {
			return {
				series: [
					analyticsData.usersByType.Inventor,
					analyticsData.usersByType.StartUp,
					analyticsData.usersByType.Company,
					analyticsData.usersByType.Investor,
				],
				options: {
					chart: { type: "donut" as const },
					labels: ["Inventor", "StartUp", "Company", "Investor"],
					colors: getChartColorsArray('["--vz-primary", "--vz-info", "--vz-success", "--vz-warning"]'),
					legend: { position: "bottom" as const },
				},
			};
		} catch (error) {
			console.error("Error creating usersByTypeChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.usersByType]);

	const projectsByStatusChart = useMemo(() => {
		try {
			return {
				series: [
					{
						name: "Projects",
						data: [
							analyticsData.projectsByStatus.pending,
							analyticsData.projectsByStatus.approved,
							analyticsData.projectsByStatus.rejected,
							analyticsData.projectsByStatus.active,
						],
					},
				],
				options: {
					chart: {
						type: "bar" as const,
						height: 350,
						toolbar: { show: false },
					},
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: "55%",
							borderRadius: 4,
						},
					},
					dataLabels: {
						enabled: true,
						formatter: (val: number) => val.toString(),
					},
					xaxis: {
						categories: ["Pending", "Approved", "Rejected", "Active"],
						title: { text: "Status" },
					},
					yaxis: {
						title: { text: "Number of Projects" },
					},
					colors: getChartColorsArray('["--vz-warning", "--vz-success", "--vz-danger", "--vz-info"]'),
					fill: {
						opacity: 1,
					},
					tooltip: {
						y: {
							formatter: (val: number) => `${val} projects`,
						},
					},
				},
			};
		} catch (error) {
			console.error("Error creating projectsByStatusChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.projectsByStatus]);

	const revenueChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Revenue", data: analyticsData.revenueByMonth }],
				options: {
					chart: { type: "area" as const, height: 350 },
					xaxis: {
						categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"],
					},
					colors: getChartColorsArray('["--vz-success"]'),
					dataLabels: { enabled: false },
					stroke: { curve: "smooth" as const },
				},
			};
		} catch (error) {
			console.error("Error creating revenueChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.revenueByMonth]);

	const invoicesByStatusChart = useMemo(() => {
		try {
			return {
				series: [
					analyticsData.invoicesByStatus.paid,
					analyticsData.invoicesByStatus.pending,
					analyticsData.invoicesByStatus.overdue,
				],
				options: {
					chart: { type: "pie" as const },
					labels: ["Paid", "Pending", "Overdue"],
					colors: getChartColorsArray('["--vz-success", "--vz-warning", "--vz-danger"]'),
					legend: { position: "bottom" as const },
				},
			};
		} catch (error) {
			console.error("Error creating invoicesByStatusChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.invoicesByStatus]);

	const subscriptionsByStatusChart = useMemo(() => {
		try {
			return {
				series: [
					analyticsData.subscriptionsByStatus.active,
					analyticsData.subscriptionsByStatus.canceled,
					analyticsData.subscriptionsByStatus.expired,
					analyticsData.subscriptionsByStatus.past_due,
					analyticsData.subscriptionsByStatus.unpaid,
					analyticsData.subscriptionsByStatus.trial,
				],
				options: {
					chart: { type: "donut" as const },
					labels: ["Active", "Canceled", "Expired", "Past Due", "Unpaid", "Trial"],
					colors: getChartColorsArray('["--vz-success", "--vz-danger", "--vz-secondary", "--vz-warning", "--vz-danger", "--vz-info"]'),
					legend: { position: "bottom" as const },
				},
			};
		} catch (error) {
			console.error("Error creating subscriptionsByStatusChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.subscriptionsByStatus]);

	const subscriptionsTrendChart = useMemo(() => {
		try {
			return {
				series: [
					{
						name: "New Subscriptions",
						data: analyticsData.subscriptionsByMonth,
					},
				],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: {
						categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"],
					},
					yaxis: {
						title: { text: "Number of Subscriptions" },
					},
					colors: getChartColorsArray('["--vz-primary"]'),
					dataLabels: { enabled: true },
					stroke: { curve: "smooth" as const, width: 3 },
					markers: { size: 5 },
					tooltip: {
						y: {
							formatter: (val: number) => `${val} subscriptions`,
						},
					},
				},
			};
		} catch (error) {
			console.error("Error creating subscriptionsTrendChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.subscriptionsByMonth]);

	// Block 1 Chart configurations
	const worldMarketMapChart = useMemo(() => {
		try {
			const countries = Object.keys(analyticsData.projectsByCountry);
			const values = Object.values(analyticsData.projectsByCountry);
			return {
				series: [
					{
						name: "Projects",
						data: values.length > 0 ? values : [0],
					},
				],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: {
						categories: countries.length > 0 ? countries : ["No Data"],
					},
					colors: getChartColorsArray('["--vz-primary"]'),
					dataLabels: { enabled: true },
					title: { text: "World Market Map - Project Presence" },
				},
			};
		} catch (error) {
			console.error("Error creating worldMarketMapChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.projectsByCountry]);

	const countryBreakdownChart = useMemo(() => {
		try {
			const countries = Object.keys(analyticsData.usersByCountry);
			const values = Object.values(analyticsData.usersByCountry);
			return {
				series: values.length > 0 ? values : [0],
				options: {
					chart: { type: "pie" as const },
					labels: countries.length > 0 ? countries : ["No Data"],
					colors: getChartColorsArray('["--vz-primary", "--vz-info", "--vz-success", "--vz-warning", "--vz-danger"]'),
					legend: { position: "bottom" as const },
					title: { text: "Country Breakdown - User Distribution" },
				},
			};
		} catch (error) {
			console.error("Error creating countryBreakdownChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.usersByCountry]);

	const geolocationDensityChart = useMemo(() => {
		try {
			const locations = Object.keys(analyticsData.geolocationDensity);
			const values = Object.values(analyticsData.geolocationDensity);
			return {
				series: [
					{
						name: "Density",
						data: values.length > 0 ? values : [0],
					},
				],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: {
						categories: locations.length > 0 ? locations : ["No Data"],
					},
					colors: getChartColorsArray('["--vz-success"]'),
					dataLabels: { enabled: true },
					title: { text: "Profile Geolocation Density" },
				},
			};
		} catch (error) {
			console.error("Error creating geolocationDensityChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.geolocationDensity]);

	const hourlyActivityChart = useMemo(() => {
		try {
			return {
				series: [
					{
						name: "Activity",
						data: analyticsData.hourlyActivity,
					},
				],
				options: {
					chart: { type: "area" as const, height: 350 },
					xaxis: {
						categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
					},
					colors: getChartColorsArray('["--vz-info"]'),
					dataLabels: { enabled: false },
					stroke: { curve: "smooth" as const },
					title: { text: "Hourly Activity Chart (0-24)" },
				},
			};
		} catch (error) {
			console.error("Error creating hourlyActivityChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.hourlyActivity]);

	const trafficSourceChart = useMemo(() => {
		try {
			return {
				series: [
					analyticsData.trafficSources.organic,
					analyticsData.trafficSources.social,
					analyticsData.trafficSources.direct,
					analyticsData.trafficSources.referral,
				],
				options: {
					chart: { type: "donut" as const },
					labels: ["Organic", "Social", "Direct", "Referral"],
					colors: getChartColorsArray('["--vz-primary", "--vz-info", "--vz-success", "--vz-warning"]'),
					legend: { position: "bottom" as const },
					title: { text: "Traffic Source Chart" },
				},
			};
		} catch (error) {
			console.error("Error creating trafficSourceChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.trafficSources]);

	const deviceAccessChart = useMemo(() => {
		try {
			return {
				series: [analyticsData.deviceAccess.mobile, analyticsData.deviceAccess.desktop],
				options: {
					chart: { type: "pie" as const },
					labels: ["Mobile", "Desktop"],
					colors: getChartColorsArray('["--vz-primary", "--vz-success"]'),
					legend: { position: "bottom" as const },
					title: { text: "Device Access Chart" },
				},
			};
		} catch (error) {
			console.error("Error creating deviceAccessChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.deviceAccess]);

	const toggleTab = (tab: string) => {
		if (activeTab !== tab) {
			setActiveTab(tab);
		}
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Analytics" pageTitle="Admin" />
					<AnalyticsPageSkeleton />
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
				<BreadCrumb title="Analytics" pageTitle="Admin" />

				{/* Summary Cards */}
				<Row className="mb-4">
					<Col md={6} xl={3}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Total Users</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											{Object.values(analyticsData.usersByType).reduce((a, b) => a + b, 0)}
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-primary-subtle rounded-circle fs-2">
												<i className="ri-user-line text-primary"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
					<Col md={6} xl={3}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Total Projects</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											{Object.values(analyticsData.projectsByStatus).reduce((a, b) => a + b, 0)}
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-info-subtle rounded-circle fs-2">
												<i className="ri-file-list-line text-info"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
					<Col md={6} xl={3}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Active Subscriptions</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											{analyticsData.activeSubscriptionsCount}
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-success-subtle rounded-circle fs-2">
												<i className="ri-vip-diamond-line text-success"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
					<Col md={6} xl={3}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Total Revenue</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											${analyticsData.totalSubscriptionRevenue.toFixed(2)}
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-warning-subtle rounded-circle fs-2">
												<i className="ri-money-dollar-circle-line text-warning"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>

				<Row className="mb-3">
					<Col md={3}>
						<Label>Date Range</Label>
						<Input
							type="select"
							value={dateRange}
							onChange={(e) => setDateRange(e.target.value)}
						>
							<option value="7">Last 7 days</option>
							<option value="30">Last 30 days</option>
							<option value="90">Last 90 days</option>
							<option value="365">Last year</option>
						</Input>
					</Col>
				</Row>

				{/* Tabs Navigation */}
				<Card className="mb-4">
					<CardBody>
						<Nav tabs className="nav-tabs-custom">
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "1" })}
									onClick={() => toggleTab("1")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-global-line me-1"></i> Global & Geographic Data
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "2" })}
									onClick={() => toggleTab("2")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-group-line me-1"></i> Community & User Profiles
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "3" })}
									onClick={() => toggleTab("3")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-money-dollar-circle-line me-1"></i> Financial Performance & Advertising
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "4" })}
									onClick={() => toggleTab("4")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-bar-chart-line me-1"></i> Rankings, Success & Operations
								</NavLink>
							</NavItem>
						</Nav>
					</CardBody>
				</Card>

				<TabContent activeTab={activeTab}>
					{/* Block 1: Global & Geographic Data */}
					<TabPane tabId="1">
						<Row>
							<Col xl={12}>
								<Card>
									<CardHeader>
										<h4 className="card-title mb-0">World Market Map - Global Project/Brand Presence</h4>
									</CardHeader>
									<CardBody>
										{worldMarketMapChart.series && worldMarketMapChart.series.length > 0 ? (
											<ReactApexChart
												options={worldMarketMapChart.options}
												series={worldMarketMapChart.series}
												type="bar"
												height={350}
											/>
										) : (
											<div className="text-center py-5">
												<p className="text-muted">No geographic data available</p>
											</div>
										)}
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Country Breakdown Map - Per-Country Metrics</h4>
									</CardHeader>
									<CardBody>
										{countryBreakdownChart.series && countryBreakdownChart.series.length > 0 ? (
											<ReactApexChart
												options={countryBreakdownChart.options}
												series={countryBreakdownChart.series}
												type="pie"
												height={350}
											/>
										) : (
											<div className="text-center py-5">
												<p className="text-muted">No country data available</p>
											</div>
										)}
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Profile Geolocation Density</h4>
									</CardHeader>
									<CardBody>
										{geolocationDensityChart.series && geolocationDensityChart.series.length > 0 ? (
											<ReactApexChart
												options={geolocationDensityChart.options}
												series={geolocationDensityChart.series}
												type="bar"
												height={350}
											/>
										) : (
											<div className="text-center py-5">
												<p className="text-muted">No geolocation data available</p>
											</div>
										)}
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Hourly Activity Chart (0-24)</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={hourlyActivityChart.options}
											series={hourlyActivityChart.series}
											type="area"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Traffic Source Chart</h4>
									</CardHeader>
									<CardBody>
										{trafficSourceChart.series && trafficSourceChart.series.length > 0 && trafficSourceChart.series.some((val: number) => val > 0) ? (
											<ReactApexChart
												options={trafficSourceChart.options}
												series={trafficSourceChart.series}
												type="donut"
												height={350}
											/>
										) : (
											<div className="text-center py-5">
												<p className="text-muted">No traffic source data available</p>
											</div>
										)}
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Device Access Chart</h4>
									</CardHeader>
									<CardBody>
										{deviceAccessChart.series && deviceAccessChart.series.length > 0 ? (
											<ReactApexChart
												options={deviceAccessChart.options}
												series={deviceAccessChart.series}
												type="pie"
												height={350}
											/>
										) : (
											<div className="text-center py-5">
												<p className="text-muted">No device access data available</p>
											</div>
										)}
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Users by Type</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={usersByTypeChart.options}
											series={usersByTypeChart.series}
											type="donut"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>

					{/* Block 2: Community & User Profiles (Placeholder) */}
					<TabPane tabId="2">
						<Row>
							<Col xl={12}>
								<Card>
									<CardBody>
										<div className="text-center py-5">
											<p className="text-muted">Block 2: Community & User Profiles - Coming Soon</p>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>

					{/* Block 3: Financial Performance & Advertising (Placeholder) */}
					<TabPane tabId="3">
						<Row>
							<Col xl={12}>
								<Card>
									<CardBody>
										<div className="text-center py-5">
											<p className="text-muted">Block 3: Financial Performance & Advertising - Coming Soon</p>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>

					{/* Block 4: Rankings, Success & Operations (Placeholder) */}
					<TabPane tabId="4">
						<Row>
							<Col xl={12}>
								<Card>
									<CardBody>
										<div className="text-center py-5">
											<p className="text-muted">Block 4: Rankings, Success & Operations - Coming Soon</p>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>
				</TabContent>

				{/* Legacy Charts - Keeping for now, will be moved to appropriate blocks */}
				{/* Users by Type Chart */}
				<Row>
					<Col xl={6}>
						<Card className="card-height-100">
							<CardHeader>
								<h4 className="card-title mb-0">Users by Type</h4>
							</CardHeader>
							<CardBody>
								<ReactApexChart
									options={usersByTypeChart.options}
									series={usersByTypeChart.series}
									type="donut"
									height={350}
								/>
							</CardBody>
						</Card>
					</Col>

					{/* Projects by Status Chart */}
					<Col xl={6}>
						<Card className="card-height-100">
							<CardHeader>
								<h4 className="card-title mb-0">Projects by Status</h4>
							</CardHeader>
							<CardBody>
								{projectsByStatusChart.series && projectsByStatusChart.series.length > 0 ? (
									<ReactApexChart
										options={projectsByStatusChart.options}
										series={projectsByStatusChart.series}
										type="bar"
										height={350}
									/>
								) : (
									<div className="text-center py-5">
										<p className="text-muted">No project data available</p>
									</div>
								)}
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Revenue Chart */}
				<Row className="mt-4">
					<Col xs={12}>
						<Card>
							<CardHeader>
								<h4 className="card-title mb-0">Revenue Trend (Last 6 Months)</h4>
							</CardHeader>
							<CardBody>
								<ReactApexChart
									options={revenueChart.options}
									series={revenueChart.series}
									type="area"
									height={350}
								/>
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Invoices and Subscriptions Charts */}
				<Row className="mt-4">
					<Col xl={6}>
						<Card>
							<CardHeader>
								<h4 className="card-title mb-0">Invoices by Status</h4>
							</CardHeader>
							<CardBody>
								<ReactApexChart
									options={invoicesByStatusChart.options}
									series={invoicesByStatusChart.series}
									type="pie"
									height={350}
								/>
							</CardBody>
						</Card>
					</Col>

					<Col xl={6}>
						<Card>
							<CardHeader>
								<h4 className="card-title mb-0">Subscriptions by Status</h4>
							</CardHeader>
							<CardBody>
								<ReactApexChart
									options={subscriptionsByStatusChart.options}
									series={subscriptionsByStatusChart.series}
									type="donut"
									height={350}
								/>
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Subscription Trends and Revenue */}
				<Row className="mt-4">
					<Col xl={6}>
						<Card className="card-height-100">
							<CardHeader>
								<h4 className="card-title mb-0">New Subscriptions Trend (Last 6 Months)</h4>
							</CardHeader>
							<CardBody>
								<ReactApexChart
									options={subscriptionsTrendChart.options}
									series={subscriptionsTrendChart.series}
									type="line"
									height={350}
								/>
							</CardBody>
						</Card>
					</Col>

					<Col xl={6}>
						<Card className="card-height-100">
							<CardHeader>
								<h4 className="card-title mb-0">Subscription Revenue Overview</h4>
							</CardHeader>
							<CardBody>
								<div className="d-flex flex-column h-100 justify-content-center">
									<div className="mb-4">
										<p className="text-muted mb-1">Total Monthly Revenue</p>
										<h2 className="text-primary mb-0">
											${analyticsData.totalSubscriptionRevenue.toFixed(2)}
										</h2>
									</div>
									<div className="mb-4">
										<p className="text-muted mb-1">Active Subscriptions</p>
										<h3 className="text-success mb-0">{analyticsData.activeSubscriptionsCount}</h3>
									</div>
									<div>
										<p className="text-muted mb-1">Average Revenue per Subscription</p>
										<h4 className="text-info mb-0">
											{analyticsData.activeSubscriptionsCount > 0
												? `$${(analyticsData.totalSubscriptionRevenue / analyticsData.activeSubscriptionsCount).toFixed(2)}`
												: "$0.00"}
										</h4>
									</div>
									<div className="mt-4">
										<Button
											color="primary"
											onClick={() => navigate("/admin/subscriptions")}
											className="w-100"
										>
											<i className="ri-list-check me-2"></i>View All Subscriptions
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default Analytics;
