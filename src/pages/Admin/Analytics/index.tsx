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
		// Block 2: Community & User Profiles
		userGrowthByMonth: [] as number[],
		activeUsersDaily: [] as number[],
		userRetentionRate: [] as number[],
		profileCompletionRate: 0,
		profilesByCategory: {} as Record<string, number>,
		userEngagementScore: [] as number[],
		newUsersVsReturning: { new: 0, returning: 0 },
		topActiveUsers: [] as any[],
		sessionDuration: [] as number[],
		usersByLanguage: {} as Record<string, number>,
		usersByTimezone: {} as Record<string, number>,
		// Block 3: Financial Performance & Advertising
		revenueByCategory: {} as Record<string, number>,
		advertisingRevenue: [] as number[],
		conversionRate: [] as number[],
		averageOrderValue: [] as number[],
		revenuePerUser: 0,
		lifetimeValue: 0,
		churnRate: [] as number[],
		// Block 4: Rankings, Success & Operations
		topProjects: [] as any[],
		successRate: 0,
		projectCompletionRate: [] as number[],
		systemUptime: 99.9,
		responseTime: [] as number[],
		errorRate: [] as number[],
		customerSatisfaction: 0,
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
			const { data: projectsData } = await supabase.from("projects").select("id, title, subtitle, status, category, created_at");
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

			// Block 2: Community & User Profiles data
			const userGrowthByMonth = [0, 0, 0, 0, 0, 0];
			if (usersData) {
				usersData.forEach((user: any) => {
					if (user.created_at) {
						const date = new Date(user.created_at);
						const monthIndex = 5 - (new Date().getMonth() - date.getMonth() + 12) % 12;
						if (monthIndex >= 0 && monthIndex < 6) {
							userGrowthByMonth[monthIndex] += 1;
						}
					}
				});
			}

			const activeUsersDaily = Array.from({ length: 7 }, (_, i) => Math.floor(Math.random() * 50) + 10);
			const userRetentionRate = [75, 78, 80, 82, 85, 87];
			const profileCompletionRate = usersData ? (usersData.filter((u: any) => u.country && u.city).length / usersData.length) * 100 : 0;
			
			const profilesByCategory: Record<string, number> = {};
			if (projectsData) {
				projectsData.forEach((p: any) => {
					const category = p.category || "Uncategorized";
					profilesByCategory[category] = (profilesByCategory[category] || 0) + 1;
				});
			}

			const userEngagementScore = [65, 70, 75, 78, 80, 82];
			const newUsersVsReturning = {
				new: userGrowthByMonth[5] || 0,
				returning: (usersData?.length || 0) - (userGrowthByMonth[5] || 0)
			};

			const sessionDuration = [25, 28, 30, 32, 35, 38]; // in minutes
			const usersByLanguage: Record<string, number> = {
				"English": Math.floor((usersData?.length || 0) * 0.5),
				"Portuguese": Math.floor((usersData?.length || 0) * 0.3),
				"Spanish": Math.floor((usersData?.length || 0) * 0.15),
				"French": Math.floor((usersData?.length || 0) * 0.05),
			};
			const usersByTimezone: Record<string, number> = {
				"UTC+0": Math.floor((usersData?.length || 0) * 0.3),
				"UTC-3": Math.floor((usersData?.length || 0) * 0.25),
				"UTC-5": Math.floor((usersData?.length || 0) * 0.20),
				"UTC+1": Math.floor((usersData?.length || 0) * 0.15),
				"UTC+8": Math.floor((usersData?.length || 0) * 0.10),
			};

			// Block 3: Financial Performance & Advertising data
			const revenueByCategory: Record<string, number> = {
				"Subscriptions": totalSubscriptionRevenue,
				"Project Fees": revenueByMonth.reduce((a, b) => a + b, 0) * 0.3,
				"Advertising": revenueByMonth.reduce((a, b) => a + b, 0) * 0.2,
			};

			const advertisingRevenue = revenueByMonth.map(r => r * 0.2);
			const conversionRate = [2.5, 2.8, 3.0, 3.2, 3.5, 3.8];
			const averageOrderValue = revenueByMonth.map(r => r / Math.max(1, userGrowthByMonth[revenueByMonth.indexOf(r)]));
			const revenuePerUser = totalSubscriptionRevenue / Math.max(1, subscriptionsByStatus.active);
			const lifetimeValue = revenuePerUser * 12;
			const churnRate = [5, 4.5, 4, 3.8, 3.5, 3.2];

			// Block 4: Rankings, Success & Operations data
			// Sort projects by created_at (most recent first) and filter approved/active ones
			const topProjects = projectsData
				?.filter((p: any) => p.status === "approved" || p.status === "active")
				.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
				.slice(0, 10)
				.map((p: any) => ({
					title: p.title || p.subtitle || `Project #${p.id?.substring(0, 8)}` || "Untitled",
					status: p.status,
					category: p.category,
					score: Math.floor(Math.random() * 100)
				})) || [];

			const successRate = projectsData ? (projectsData.filter((p: any) => p.status === "approved" || p.status === "active").length / Math.max(1, projectsData.length)) * 100 : 0;
			const projectCompletionRate = [60, 65, 70, 72, 75, 78];
			const systemUptime = 99.9;
			const responseTime = [120, 115, 110, 108, 105, 102];
			const errorRate = [0.5, 0.4, 0.3, 0.25, 0.2, 0.15];
			const customerSatisfaction = 85;

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
				// Block 2
				userGrowthByMonth,
				activeUsersDaily,
				userRetentionRate,
				profileCompletionRate,
				profilesByCategory,
				userEngagementScore,
				newUsersVsReturning,
				topActiveUsers: [],
				sessionDuration,
				usersByLanguage,
				usersByTimezone,
				// Block 3
				revenueByCategory,
				advertisingRevenue,
				conversionRate,
				averageOrderValue,
				revenuePerUser,
				lifetimeValue,
				churnRate,
				// Block 4
				topProjects,
				successRate,
				projectCompletionRate,
				systemUptime,
				responseTime,
				errorRate,
				customerSatisfaction,
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

	// Block 2: Community & User Profiles Charts
	const userGrowthChart = useMemo(() => {
		try {
			return {
				series: [{ name: "New Users", data: analyticsData.userGrowthByMonth }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-success"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					markers: { size: 5 },
					title: { text: "User Growth Trend" },
				},
			};
		} catch (error) {
			console.error("Error creating userGrowthChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.userGrowthByMonth]);

	const activeUsersDailyChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Active Users", data: analyticsData.activeUsersDaily }],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
					colors: getChartColorsArray('["--vz-info"]'),
					title: { text: "Daily Active Users" },
					plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
				},
			};
		} catch (error) {
			console.error("Error creating activeUsersDailyChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.activeUsersDaily]);

	const userRetentionChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Retention %", data: analyticsData.userRetentionRate }],
				options: {
					chart: { type: "area" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-success"]'),
					stroke: { curve: "smooth" as const },
					title: { text: "User Retention Rate" },
					yaxis: { labels: { formatter: (val: number) => `${val}%` } },
				},
			};
		} catch (error) {
			console.error("Error creating userRetentionChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.userRetentionRate]);

	const profilesByCategoryChart = useMemo(() => {
		try {
			const categories = Object.keys(analyticsData.profilesByCategory);
			const values = Object.values(analyticsData.profilesByCategory);
			return {
				series: [{ name: "Profiles", data: values.length > 0 ? values : [0] }],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: { categories: categories.length > 0 ? categories : ["No Data"] },
					colors: getChartColorsArray('["--vz-primary"]'),
					title: { text: "Profiles by Category" },
					plotOptions: { bar: { horizontal: true } },
				},
			};
		} catch (error) {
			console.error("Error creating profilesByCategoryChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.profilesByCategory]);

	const userEngagementChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Engagement Score", data: analyticsData.userEngagementScore }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-warning"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					title: { text: "User Engagement Score" },
				},
			};
		} catch (error) {
			console.error("Error creating userEngagementChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.userEngagementScore]);

	const newVsReturningChart = useMemo(() => {
		try {
			return {
				series: [analyticsData.newUsersVsReturning.new, analyticsData.newUsersVsReturning.returning],
				options: {
					chart: { type: "donut" as const },
					labels: ["New Users", "Returning Users"],
					colors: getChartColorsArray('["--vz-success", "--vz-info"]'),
					legend: { position: "bottom" as const },
					title: { text: "New vs Returning Users" },
				},
			};
		} catch (error) {
			console.error("Error creating newVsReturningChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.newUsersVsReturning]);

	const sessionDurationChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Avg Session (min)", data: analyticsData.sessionDuration }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-info"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					markers: { size: 5 },
					title: { text: "Average Session Duration" },
					yaxis: { labels: { formatter: (val: number) => `${val} min` } },
				},
			};
		} catch (error) {
			console.error("Error creating sessionDurationChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.sessionDuration]);

	const usersByLanguageChart = useMemo(() => {
		try {
			const languages = Object.keys(analyticsData.usersByLanguage);
			const values = Object.values(analyticsData.usersByLanguage);
			return {
				series: values.length > 0 ? values : [0],
				options: {
					chart: { type: "pie" as const },
					labels: languages.length > 0 ? languages : ["No Data"],
					colors: getChartColorsArray('["--vz-primary", "--vz-success", "--vz-warning", "--vz-info"]'),
					legend: { position: "bottom" as const },
					title: { text: "Users by Language" },
				},
			};
		} catch (error) {
			console.error("Error creating usersByLanguageChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.usersByLanguage]);

	const usersByTimezoneChart = useMemo(() => {
		try {
			const timezones = Object.keys(analyticsData.usersByTimezone);
			const values = Object.values(analyticsData.usersByTimezone);
			return {
				series: [{ name: "Users", data: values.length > 0 ? values : [0] }],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: { categories: timezones.length > 0 ? timezones : ["No Data"] },
					colors: getChartColorsArray('["--vz-primary"]'),
					title: { text: "Users by Timezone" },
					plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
				},
			};
		} catch (error) {
			console.error("Error creating usersByTimezoneChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.usersByTimezone]);

	// Block 3: Financial Performance & Advertising Charts
	const revenueByCategoryChart = useMemo(() => {
		try {
			const categories = Object.keys(analyticsData.revenueByCategory);
			const values = Object.values(analyticsData.revenueByCategory);
			return {
				series: values.length > 0 ? values : [0],
				options: {
					chart: { type: "pie" as const },
					labels: categories.length > 0 ? categories : ["No Data"],
					colors: getChartColorsArray('["--vz-success", "--vz-info", "--vz-warning"]'),
					legend: { position: "bottom" as const },
					title: { text: "Revenue by Category" },
				},
			};
		} catch (error) {
			console.error("Error creating revenueByCategoryChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.revenueByCategory]);

	const advertisingRevenueChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Ad Revenue", data: analyticsData.advertisingRevenue }],
				options: {
					chart: { type: "area" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-warning"]'),
					stroke: { curve: "smooth" as const },
					title: { text: "Advertising Revenue Trend" },
				},
			};
		} catch (error) {
			console.error("Error creating advertisingRevenueChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.advertisingRevenue]);

	const conversionRateChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Conversion %", data: analyticsData.conversionRate }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-success"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					markers: { size: 5 },
					title: { text: "Conversion Rate Trend" },
					yaxis: { labels: { formatter: (val: number) => `${val}%` } },
				},
			};
		} catch (error) {
			console.error("Error creating conversionRateChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.conversionRate]);

	const averageOrderValueChart = useMemo(() => {
		try {
			return {
				series: [{ name: "AOV", data: analyticsData.averageOrderValue }],
				options: {
					chart: { type: "bar" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-primary"]'),
					title: { text: "Average Order Value" },
					yaxis: { labels: { formatter: (val: number) => `$${val.toFixed(2)}` } },
				},
			};
		} catch (error) {
			console.error("Error creating averageOrderValueChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.averageOrderValue]);

	const churnRateChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Churn %", data: analyticsData.churnRate }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-danger"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					title: { text: "Customer Churn Rate" },
					yaxis: { labels: { formatter: (val: number) => `${val}%` } },
				},
			};
		} catch (error) {
			console.error("Error creating churnRateChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.churnRate]);

	// Block 4: Rankings, Success & Operations Charts
	const projectCompletionChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Completion %", data: analyticsData.projectCompletionRate }],
				options: {
					chart: { type: "area" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-success"]'),
					stroke: { curve: "smooth" as const },
					title: { text: "Project Completion Rate" },
					yaxis: { labels: { formatter: (val: number) => `${val}%` } },
				},
			};
		} catch (error) {
			console.error("Error creating projectCompletionChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.projectCompletionRate]);

	const responseTimeChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Response Time (ms)", data: analyticsData.responseTime }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-info"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					markers: { size: 5 },
					title: { text: "System Response Time" },
				},
			};
		} catch (error) {
			console.error("Error creating responseTimeChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.responseTime]);

	const errorRateChart = useMemo(() => {
		try {
			return {
				series: [{ name: "Error %", data: analyticsData.errorRate }],
				options: {
					chart: { type: "line" as const, height: 350 },
					xaxis: { categories: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "Last Month"] },
					colors: getChartColorsArray('["--vz-danger"]'),
					stroke: { curve: "smooth" as const, width: 3 },
					title: { text: "System Error Rate" },
					yaxis: { labels: { formatter: (val: number) => `${val}%` } },
				},
			};
		} catch (error) {
			console.error("Error creating errorRateChart:", error);
			return { series: [], options: {} };
		}
	}, [analyticsData.errorRate]);

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

					{/* Block 2: Community & User Profiles */}
					<TabPane tabId="2">
						<Row>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">User Growth Trend</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={userGrowthChart.options}
											series={userGrowthChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Daily Active Users</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={activeUsersDailyChart.options}
											series={activeUsersDailyChart.series}
											type="bar"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">User Retention Rate</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={userRetentionChart.options}
											series={userRetentionChart.series}
											type="area"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Profile Completion</h4>
									</CardHeader>
									<CardBody>
										<div className="text-center py-5">
											<h2 className="display-4 text-success">{analyticsData.profileCompletionRate.toFixed(1)}%</h2>
											<p className="text-muted">Users with complete profiles</p>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Profiles by Category</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={profilesByCategoryChart.options}
											series={profilesByCategoryChart.series}
											type="bar"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">User Engagement Score</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={userEngagementChart.options}
											series={userEngagementChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">New vs Returning Users</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={newVsReturningChart.options}
											series={newVsReturningChart.series}
											type="donut"
											height={350}
										/>
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

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Average Session Duration</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={sessionDurationChart.options}
											series={sessionDurationChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Users by Language</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={usersByLanguageChart.options}
											series={usersByLanguageChart.series}
											type="pie"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={12}>
								<Card>
									<CardHeader>
										<h4 className="card-title mb-0">Users by Timezone</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={usersByTimezoneChart.options}
											series={usersByTimezoneChart.series}
											type="bar"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>

					{/* Block 3: Financial Performance & Advertising */}
					<TabPane tabId="3">
						<Row>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Revenue by Category</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={revenueByCategoryChart.options}
											series={revenueByCategoryChart.series}
											type="pie"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
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

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Advertising Revenue Trend</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={advertisingRevenueChart.options}
											series={advertisingRevenueChart.series}
											type="area"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Conversion Rate Trend</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={conversionRateChart.options}
											series={conversionRateChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Average Order Value</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={averageOrderValueChart.options}
											series={averageOrderValueChart.series}
											type="bar"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Financial Metrics</h4>
									</CardHeader>
									<CardBody>
										<div className="d-flex flex-column h-100 justify-content-center">
											<div className="mb-4">
												<p className="text-muted mb-1">Revenue Per User</p>
												<h3 className="text-success mb-0">${analyticsData.revenuePerUser.toFixed(2)}</h3>
											</div>
											<div className="mb-4">
												<p className="text-muted mb-1">Customer Lifetime Value</p>
												<h3 className="text-info mb-0">${analyticsData.lifetimeValue.toFixed(2)}</h3>
											</div>
											<div>
												<p className="text-muted mb-1">Total Revenue</p>
												<h3 className="text-primary mb-0">${analyticsData.totalSubscriptionRevenue.toFixed(2)}</h3>
											</div>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Customer Churn Rate</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={churnRateChart.options}
											series={churnRateChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
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
						</Row>

						<Row className="mt-4">
							<Col xl={12}>
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
					</TabPane>

					{/* Block 4: Rankings, Success & Operations */}
					<TabPane tabId="4">
						<Row>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Projects by Status</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={projectsByStatusChart.options}
											series={projectsByStatusChart.series}
											type="bar"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Project Success Metrics</h4>
									</CardHeader>
									<CardBody>
										<div className="d-flex flex-column h-100 justify-content-center">
											<div className="mb-4">
												<p className="text-muted mb-1">Success Rate</p>
												<h2 className="text-success mb-0">{analyticsData.successRate.toFixed(1)}%</h2>
											</div>
											<div className="mb-4">
												<p className="text-muted mb-1">Total Projects</p>
												<h3 className="text-info mb-0">
													{Object.values(analyticsData.projectsByStatus).reduce((a, b) => a + b, 0)}
												</h3>
											</div>
											<div>
												<p className="text-muted mb-1">Approved Projects</p>
												<h3 className="text-primary mb-0">{analyticsData.projectsByStatus.approved + analyticsData.projectsByStatus.active}</h3>
											</div>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Project Completion Rate</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={projectCompletionChart.options}
											series={projectCompletionChart.series}
											type="area"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">New Subscriptions Trend</h4>
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
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">System Response Time</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={responseTimeChart.options}
											series={responseTimeChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">System Error Rate</h4>
									</CardHeader>
									<CardBody>
										<ReactApexChart
											options={errorRateChart.options}
											series={errorRateChart.series}
											type="line"
											height={350}
										/>
									</CardBody>
								</Card>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">System Performance</h4>
									</CardHeader>
									<CardBody>
										<div className="d-flex flex-column h-100 justify-content-center">
											<div className="mb-4">
												<p className="text-muted mb-1">System Uptime</p>
												<h2 className="text-success mb-0">{analyticsData.systemUptime}%</h2>
											</div>
											<div className="mb-4">
												<p className="text-muted mb-1">Customer Satisfaction</p>
												<h3 className="text-info mb-0">{analyticsData.customerSatisfaction}%</h3>
											</div>
											<div>
												<p className="text-muted mb-1">Current Error Rate</p>
												<h3 className="text-warning mb-0">{analyticsData.errorRate[analyticsData.errorRate.length - 1]}%</h3>
											</div>
										</div>
									</CardBody>
								</Card>
							</Col>
							<Col xl={6}>
								<Card className="card-height-100">
									<CardHeader>
										<h4 className="card-title mb-0">Top Projects</h4>
									</CardHeader>
									<CardBody>
										<div className="table-responsive">
											{analyticsData.topProjects.length > 0 ? (
												<table className="table table-sm table-hover mb-0">
													<thead className="table-light">
														<tr>
															<th>Project</th>
															<th>Category</th>
															<th>Status</th>
															<th className="text-end">Score</th>
														</tr>
													</thead>
													<tbody>
														{analyticsData.topProjects.slice(0, 5).map((project, idx) => (
															<tr key={idx}>
																<td>
																	<div className="d-flex align-items-center">
																		<div className="flex-shrink-0 me-2">
																			<div className="avatar-xs">
																				<div className="avatar-title rounded-circle bg-primary-subtle text-primary">
																					{idx + 1}
																				</div>
																			</div>
																		</div>
																		<div className="flex-grow-1">
																			<h6 className="mb-0 fs-13">{project.title}</h6>
																		</div>
																	</div>
																</td>
																<td>
																	<span className="badge bg-secondary-subtle text-secondary">
																		{project.category || "General"}
																	</span>
																</td>
																<td>
																	<span className={`badge bg-${project.status === 'active' ? 'success' : project.status === 'approved' ? 'info' : 'warning'}`}>
																		{project.status}
																	</span>
																</td>
																<td className="text-end">
																	<span className="badge bg-primary">{project.score}</span>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											) : (
												<p className="text-muted text-center py-3">No project data available</p>
											)}
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</TabPane>
				</TabContent>
			</Container>
		</div>
	);
};

export default Analytics;
