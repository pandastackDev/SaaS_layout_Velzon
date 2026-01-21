import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	Badge,
	Button,
	Spinner,
	Table,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
	Label,
} from "reactstrap";
import classnames from "classnames";
import { showToast } from "../../../lib/toast";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";

interface User {
	id: string;
	full_name: string;
	personal_email: string;
	user_type: string;
	profile_status: string;
	photo_url?: string;
	country?: string;
	city?: string;
	telephone?: string;
	created_at: string;
	updated_at: string;
	is_banned?: boolean;
	bio?: string;
	company_name?: string;
	company_position?: string;
	linkedin_url?: string;
	website_url?: string;
}

interface Subscription {
	id: string;
	user_id: string;
	status: string;
	created_at?: string;
	current_period_start?: string;
	current_period_end?: string;
	pricing_plan?: {
		plan_name: string;
		monthly_price: number;
		currency: string;
		plan_type: string;
	};
}

interface Project {
	id: string;
	title: string;
	status: string;
	created_at: string;
	cover_image_url?: string;
}

const UserDetails = () => {
	document.title = "User Details | PITCH INVEST";
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const userId = searchParams.get("id");
	const { isAdmin, loading: adminLoading } = useAdmin();
	
	const [activeTab, setActiveTab] = useState("1");
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	// Lightweight subscription summary (mirrors Users list logic)
	const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
	const [subscriptionPeriod, setSubscriptionPeriod] = useState<{ start?: string | null; end?: string | null } | null>(null);
	const [projects, setProjects] = useState<Project[]>([]);
	const [adminNotes, setAdminNotes] = useState("");
	const [savingNotes, setSavingNotes] = useState(false);
	
	// Modals
	const [banModal, setBanModal] = useState(false);
	const [unbanModal, setUnbanModal] = useState(false);
	const [statusModal, setStatusModal] = useState(false);
	const [subscriptionModal, setSubscriptionModal] = useState(false);
	const [cancelSubscriptionModal, setCancelSubscriptionModal] = useState(false);
	const [availablePlans, setAvailablePlans] = useState<any[]>([]);
	const [selectedPlanId, setSelectedPlanId] = useState("");
	const [processingSubscription, setProcessingSubscription] = useState(false);
	const [newStatus, setNewStatus] = useState("");

	useEffect(() => {
		if (adminLoading) return;
		
		if (!isAdmin && !adminLoading) {
			navigate("/dashboard", { replace: true });
			return;
		}
		
		if (userId) {
			console.log("Fetching user details for ID:", userId);
			fetchUserDetails();
		} else {
			console.log("No user ID provided in URL");
			setLoading(false);
		}
	}, [userId, isAdmin, adminLoading]);

	const fetchUserDetails = async () => {
		if (!userId) return;
		
		setLoading(true);
		try {
			// Fetch user profile from users table (not profiles)
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();

			if (userError) {
				console.error("Error fetching user:", userError);
				if (userError.code === 'PGRST116') {
					// User not found
					setUser(null);
				} else {
					throw userError;
				}
				setLoading(false);
				return;
			}
			
			if (!userData) {
				setUser(null);
				setLoading(false);
				return;
			}
			
			setUser(userData);
			console.log("User data loaded:", userData);

			// Fetch subscription summary similar to Users list: prefer 'active', else latest
			console.log("Fetching subscription summary for user:", userId);
			const { data: subsList, error: subsListError } = await supabase
				.from("subscriptions")
				.select("id, status, current_period_start, current_period_end, created_at, pricing_plan_id")
				.eq("user_id", userId);

			if (subsListError) {
				console.warn("Could not load subscriptions summary:", subsListError);
			} else if (subsList && subsList.length > 0) {
				const active = subsList.find((s: any) => s.status === "active");
				const latest = [...subsList].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
				const chosen = active || latest;
				setSubscriptionStatus(chosen?.status || null);
				setSubscriptionPeriod({ start: chosen?.current_period_start, end: chosen?.current_period_end });
			}

			// Attempt to fetch full subscription with pricing plan (best-effort)
			console.log("Fetching full subscription (best-effort) for user:", userId);
			const { data: subData, error: subError } = await supabase
				.from("subscriptions")
				.select(`
					*,
					pricing_plan:pricing_plans(plan_name, monthly_price, currency, plan_type)
				`)
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(1)
				.maybeSingle();

			if (subData && !subError) {
				setSubscription(subData);
			}

			// Fetch user's projects (don't fail if no projects)
			const { data: projectsData, error: projectsError } = await supabase
				.from("projects")
				.select("id, title, status, created_at, cover_image_url")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (projectsData && !projectsError) {
				setProjects(projectsData);
			}

			// Fetch admin notes (don't fail if no notes)
			const { data: notesData, error: notesError } = await supabase
				.from("admin_notes")
				.select("notes")
				.eq("user_id", userId)
				.eq("note_type", "user_profile")
				.maybeSingle();

			if (notesData && !notesError) {
				setAdminNotes(notesData.notes || "");
			}
		} catch (error: any) {
			console.error("Error fetching user details:", error);
			showToast.error("Error loading user details");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveNotes = async () => {
		if (!userId) return;
		
		setSavingNotes(true);
		try {
			const { data: { user: currentUser } } = await supabase.auth.getUser();
			
			const { error } = await supabase
				.from("admin_notes")
				.upsert({
					user_id: userId,
					note_type: "user_profile",
					notes: adminNotes,
					created_by: currentUser?.id,
					updated_at: new Date().toISOString(),
				}, {
					onConflict: "user_id,note_type"
				});

			if (error) throw error;
			showToast.success("Admin notes saved successfully");
		} catch (error: any) {
			console.error("Error saving notes:", error);
			showToast.error("Error saving notes");
		} finally {
			setSavingNotes(false);
		}
	};

	const loadAvailablePlans = async () => {
		try {
			const { data, error } = await supabase
				.from("pricing_plans")
				.select("*")
				.eq("is_active", true)
				.eq("plan_type", "subscription")
				.order("monthly_price", { ascending: true });

			if (error) throw error;
			setAvailablePlans(data || []);
		} catch (error: any) {
			console.error("Error loading plans:", error);
			showToast.error("Failed to load available plans");
		}
	};

	const handleCreateSubscription = async () => {
		if (!userId || !selectedPlanId) {
			showToast.error("Please select a plan");
			return;
		}

		setProcessingSubscription(true);
		try {
			const selectedPlan = availablePlans.find(p => p.id === selectedPlanId);
			if (!selectedPlan) throw new Error("Plan not found");

			const now = new Date();
			const periodEnd = new Date(now);
			periodEnd.setMonth(periodEnd.getMonth() + 1);

			const { error } = await supabase
				.from("subscriptions")
				.insert({
					user_id: userId,
					pricing_plan_id: selectedPlanId,
					status: "active",
					monthly_price: selectedPlan.monthly_price,
					currency: selectedPlan.currency,
					current_period_start: now.toISOString(),
					current_period_end: periodEnd.toISOString(),
				});

			if (error) throw error;

			showToast.success("Subscription created successfully!");
			setSubscriptionModal(false);
			setSelectedPlanId("");
			fetchUserDetails();
		} catch (error: any) {
			console.error("Error creating subscription:", error);
			showToast.error("Failed to create subscription");
		} finally {
			setProcessingSubscription(false);
		}
	};

	const handleCancelSubscription = async () => {
		if (!subscription?.id) return;

		setProcessingSubscription(true);
		try {
			const { error } = await supabase
				.from("subscriptions")
				.update({
					status: "canceled",
					updated_at: new Date().toISOString(),
				})
				.eq("id", subscription.id);

			if (error) throw error;

			showToast.success("Subscription canceled successfully!");
			setCancelSubscriptionModal(false);
			fetchUserDetails();
		} catch (error: any) {
			console.error("Error canceling subscription:", error);
			showToast.error("Failed to cancel subscription");
		} finally {
			setProcessingSubscription(false);
		}
	};

	const openCreateSubscriptionModal = async () => {
		await loadAvailablePlans();
		setSubscriptionModal(true);
	};

	const handleBanUser = async () => {
		if (!userId) return;
		
		try {
			const { error } = await supabase
				.from("users")
				.update({ is_banned: true, updated_at: new Date().toISOString() })
				.eq("id", userId);

			if (error) throw error;
			
			showToast.success("User banned successfully");
			setBanModal(false);
			fetchUserDetails();
		} catch (error: any) {
			console.error("Error banning user:", error);
			showToast.error("Error banning user");
		}
	};

	const handleUnbanUser = async () => {
		if (!userId) return;
		
		try {
			const { error } = await supabase
				.from("users")
				.update({ is_banned: false, updated_at: new Date().toISOString() })
				.eq("id", userId);

			if (error) throw error;
			
			showToast.success("User unbanned successfully");
			setUnbanModal(false);
			fetchUserDetails();
		} catch (error: any) {
			console.error("Error unbanning user:", error);
			showToast.error("Error unbanning user");
		}
	};

	const handleUpdateStatus = async () => {
		if (!userId || !newStatus) return;
		
		try {
			const { error } = await supabase
				.from("users")
				.update({ profile_status: newStatus, updated_at: new Date().toISOString() })
				.eq("id", userId);

			if (error) throw error;
			
			showToast.success("User status updated successfully");
			setStatusModal(false);
			fetchUserDetails();
		} catch (error: any) {
			console.error("Error updating status:", error);
			showToast.error("Error updating status");
		}
	};

	const getStatusBadge = (status?: string, isBanned?: boolean) => {
		if (isBanned) {
			return <Badge className="bg-danger">Banned</Badge>;
		}
		
		switch (status?.toLowerCase()) {
			case "approved":
				return <Badge className="bg-success">Approved</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			case "rejected":
				return <Badge className="bg-danger">Rejected</Badge>;
			case "incomplete":
				return <Badge className="bg-secondary">Incomplete</Badge>;
			default:
				return <Badge className="bg-secondary">{status || "Unknown"}</Badge>;
		}
	};

	const getUserTypeBadge = (type?: string) => {
		switch (type?.toLowerCase()) {
			case "startup":
				return <Badge className="bg-info-subtle text-info">Startup</Badge>;
			case "investor":
				return <Badge className="bg-warning-subtle text-warning">Investor</Badge>;
			case "company":
				return <Badge className="bg-primary-subtle text-primary">Company</Badge>;
			default:
				return <Badge className="bg-secondary-subtle text-secondary">{type || "N/A"}</Badge>;
		}
	};

	const getSubscriptionBadge = (status?: string) => {
		switch (status?.toLowerCase()) {
			case "active":
				return <Badge className="bg-success">Active</Badge>;
			case "trialing":
				return <Badge className="bg-info">Trialing</Badge>;
			case "past_due":
				return <Badge className="bg-warning">Past Due</Badge>;
			case "canceled":
			case "cancelled":
				return <Badge className="bg-danger">Cancelled</Badge>;
			case "incomplete":
				return <Badge className="bg-secondary">Incomplete</Badge>;
			default:
				return <Badge className="bg-secondary">No Subscription</Badge>;
		}
	};

	const getProjectStatusBadge = (status: string) => {
		switch (status?.toLowerCase()) {
			case "approved":
				return <Badge className="bg-success-subtle text-success">Approved</Badge>;
			case "pending":
				return <Badge className="bg-warning-subtle text-warning">Pending</Badge>;
			case "active":
				return <Badge className="bg-info-subtle text-info">Active</Badge>;
			case "rejected":
				return <Badge className="bg-danger-subtle text-danger">Rejected</Badge>;
			case "completed":
				return <Badge className="bg-primary-subtle text-primary">Completed</Badge>;
			default:
				return <Badge className="bg-secondary-subtle text-secondary">{status}</Badge>;
		}
	};

	if (loading || adminLoading) {
		return (
			<div className="page-content">
				<Container fluid>
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
						<Spinner color="primary" />
					</div>
				</Container>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="User Details" pageTitle="Admin" showBackButton backPath="/admin/users" />
					<Card>
						<CardBody>
							<div className="text-center py-5">
								<i className="ri-user-line display-1 text-muted"></i>
								<h5 className="mt-3">User not found</h5>
								<Button color="primary" onClick={() => navigate("/admin/users")}>
									Back to Users
								</Button>
							</div>
						</CardBody>
					</Card>
				</Container>
			</div>
		);
	}

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="User Details" pageTitle="Admin" showBackButton backPath="/admin/users" />

				{/* User Header Card */}
				<Card>
					<CardBody>
						<Row className="align-items-center">
							<Col md={2} className="text-center">
								{user.photo_url ? (
									<img
										src={user.photo_url}
										alt={user.full_name}
										className="rounded-circle"
										style={{ width: "100px", height: "100px", objectFit: "cover" }}
									/>
								) : (
									<div
										className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto"
										style={{ width: "100px", height: "100px", fontSize: "36px" }}
									>
										{user.full_name?.charAt(0)?.toUpperCase() || "U"}
									</div>
								)}
							</Col>
							<Col md={7}>
								<h4 className="mb-2">
									{user.full_name}
									{user.is_banned && <Badge className="bg-danger ms-2">Banned</Badge>}
								</h4>
								<div className="d-flex flex-wrap gap-2 mb-2">
									{getUserTypeBadge(user.user_type)}
									{getStatusBadge(user.profile_status, user.is_banned)}
									{(subscriptionStatus || subscription) && getSubscriptionBadge(subscription?.status || subscriptionStatus || undefined)}
								</div>
								<div className="text-muted">
									<i className="ri-mail-line me-2"></i>
									{user.personal_email}
								</div>
								{user.telephone && (
									<div className="text-muted">
										<i className="ri-phone-line me-2"></i>
										{user.telephone}
									</div>
								)}
								{(user.city || user.country) && (
									<div className="text-muted">
										<i className="ri-map-pin-line me-2"></i>
										{[user.city, user.country].filter(Boolean).join(", ")}
									</div>
								)}
							</Col>
							<Col md={3} className="text-end">
								<div className="d-flex flex-column gap-2">
									{user.is_banned ? (
										<Button color="success" size="sm" onClick={() => setUnbanModal(true)}>
											<i className="ri-user-unfollow-line me-1"></i>
											Unban User
										</Button>
									) : (
										<Button color="danger" size="sm" onClick={() => setBanModal(true)}>
											<i className="ri-user-forbid-line me-1"></i>
											Ban User
										</Button>
									)}
									<Button color="primary" size="sm" outline onClick={() => {
										setNewStatus(user.profile_status);
										setStatusModal(true);
									}}>
										<i className="ri-edit-line me-1"></i>
										Update Status
									</Button>
								</div>
							</Col>
						</Row>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<Nav tabs className="nav-tabs-custom nav-primary">
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "1" })}
									onClick={() => setActiveTab("1")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-user-line me-2"></i>
									Overview
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "2" })}
									onClick={() => setActiveTab("2")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-wallet-line me-2"></i>
									Subscription
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "3" })}
									onClick={() => setActiveTab("3")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-folder-line me-2"></i>
									Projects ({projects.length})
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({ active: activeTab === "4" })}
									onClick={() => setActiveTab("4")}
									style={{ cursor: "pointer" }}
								>
									<i className="ri-file-text-line me-2"></i>
									Admin Notes
								</NavLink>
							</NavItem>
						</Nav>
					</CardHeader>
					<CardBody>
						<TabContent activeTab={activeTab}>
							{/* Tab 1: Overview */}
							<TabPane tabId="1">
								<Row>
									<Col lg={6}>
										<Card className="border shadow-none">
											<CardHeader className="bg-light">
												<h6 className="mb-0">Profile Information</h6>
											</CardHeader>
											<CardBody>
												<Table borderless className="mb-0">
													<tbody>
														<tr>
															<td className="fw-medium" style={{ width: "40%" }}>Full Name:</td>
															<td>{user.full_name || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">Email:</td>
															<td>{user.personal_email || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">Phone:</td>
															<td>{user.telephone || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">User Type:</td>
															<td>{getUserTypeBadge(user.user_type)}</td>
														</tr>
														<tr>
															<td className="fw-medium">Status:</td>
															<td>{getStatusBadge(user.profile_status, user.is_banned)}</td>
														</tr>
														<tr>
															<td className="fw-medium">Location:</td>
															<td>{[user.city, user.country].filter(Boolean).join(", ") || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">Company:</td>
															<td>{user.company_name || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">Position:</td>
															<td>{user.company_position || "N/A"}</td>
														</tr>
													</tbody>
												</Table>
											</CardBody>
										</Card>
									</Col>
									<Col lg={6}>
										<Card className="border shadow-none">
											<CardHeader className="bg-light">
												<h6 className="mb-0">Account Details</h6>
											</CardHeader>
											<CardBody>
												<Table borderless className="mb-0">
													<tbody>
														<tr>
															<td className="fw-medium" style={{ width: "40%" }}>User ID:</td>
															<td>
																<code className="text-muted">{user.id}</code>
															</td>
														</tr>
														<tr>
															<td className="fw-medium">Created:</td>
															<td>{new Date(user.created_at).toLocaleString()}</td>
														</tr>
														<tr>
															<td className="fw-medium">Last Updated:</td>
															<td>{new Date(user.updated_at).toLocaleString()}</td>
														</tr>
														<tr>
															<td className="fw-medium">Total Projects:</td>
															<td>
																<Badge color="primary" className="badge-label">
																	{projects.length}
																</Badge>
															</td>
														</tr>
													</tbody>
												</Table>
											</CardBody>
										</Card>

										{user.bio && (
											<Card className="border shadow-none">
												<CardHeader className="bg-light">
													<h6 className="mb-0">Bio</h6>
												</CardHeader>
												<CardBody>
													<p className="text-muted mb-0">{user.bio}</p>
												</CardBody>
											</Card>
										)}

										{(user.linkedin_url || user.website_url) && (
											<Card className="border shadow-none">
												<CardHeader className="bg-light">
													<h6 className="mb-0">Links</h6>
												</CardHeader>
												<CardBody>
													{user.linkedin_url && (
														<div className="mb-2">
															<i className="ri-linkedin-box-fill text-primary me-2"></i>
															<a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
																LinkedIn Profile
															</a>
														</div>
													)}
													{user.website_url && (
														<div>
															<i className="ri-global-line text-info me-2"></i>
															<a href={user.website_url} target="_blank" rel="noopener noreferrer">
																Website
															</a>
														</div>
													)}
												</CardBody>
											</Card>
										)}
									</Col>
								</Row>
							</TabPane>

							{/* Tab 2: Subscription */}
							<TabPane tabId="2">
								{subscription || subscriptionStatus ? (
									<>
										<Card className="border shadow-none mb-3">
											<CardHeader className="bg-light d-flex justify-content-between align-items-center">
												<div>
													<h6 className="mb-1">Current Subscription</h6>
													<small className="text-muted">Manage subscription and billing details</small>
												</div>
												{getSubscriptionBadge(subscription?.status || subscriptionStatus || undefined)}
											</CardHeader>
											<CardBody>
												<Row className="mb-4">
													<Col lg={4} className="text-center">
														<div className="mb-3">
															<i className="ri-vip-crown-line display-4 text-primary"></i>
														</div>
														<h5 className="mb-2">{subscription?.pricing_plan?.plan_name || "Subscription Plan"}</h5>
														<Badge className="bg-primary-subtle text-primary fs-12 px-3 py-2">
															{subscription?.pricing_plan?.plan_type?.toUpperCase() || "SUBSCRIPTION"}
														</Badge>
													</Col>
													<Col lg={8}>
														<Row className="g-3">
															<Col md={6}>
																<Card className="mb-0 border">
																	<CardBody className="p-3">
																		<div className="d-flex align-items-center">
																			<div className="flex-shrink-0">
																				<div className="avatar-sm">
																					<div className="avatar-title bg-success-subtle text-success rounded">
																						<i className="ri-money-dollar-circle-line fs-20"></i>
																					</div>
																				</div>
																			</div>
																			<div className="flex-grow-1 ms-3">
																				<p className="text-muted mb-1 fs-13">Monthly Price</p>
																				<h5 className="mb-0">
																					{subscription.pricing_plan?.monthly_price
																						? `${subscription.pricing_plan.currency?.toUpperCase() || "$"} ${subscription.pricing_plan.monthly_price}`
																						: "N/A"}
																				</h5>
																			</div>
																		</div>
																	</CardBody>
																</Card>
															</Col>
															<Col md={6}>
																<Card className="mb-0 border">
																	<CardBody className="p-3">
																		<div className="d-flex align-items-center">
																			<div className="flex-shrink-0">
																				<div className="avatar-sm">
																					<div className="avatar-title bg-info-subtle text-info rounded">
																						<i className="ri-calendar-check-line fs-20"></i>
																					</div>
																				</div>
																			</div>
																			<div className="flex-grow-1 ms-3">
																				<p className="text-muted mb-1 fs-13">Renews On</p>
																				<h6 className="mb-0">
																					{(subscription?.current_period_end || subscriptionPeriod?.end)
																						? new Date((subscription?.current_period_end || subscriptionPeriod?.end) as string).toLocaleDateString("en-US", {
																							month: "short",
																							day: "numeric",
																							year: "numeric"
																						})
																						: "N/A"}
																				</h6>
																			</div>
																		</div>
																	</CardBody>
																</Card>
															</Col>
															<Col md={12}>
																<Card className="mb-0 border">
																	<CardBody className="p-3">
																		<div className="d-flex align-items-center">
																			<div className="flex-shrink-0">
																				<div className="avatar-sm">
																					<div className="avatar-title bg-warning-subtle text-warning rounded">
																						<i className="ri-calendar-event-line fs-20"></i>
																					</div>
																				</div>
																			</div>
																			<div className="flex-grow-1 ms-3">
																				<p className="text-muted mb-1 fs-13">Current Billing Period</p>
																				<h6 className="mb-0">
																					{(subscription?.current_period_start || subscriptionPeriod?.start) && (subscription?.current_period_end || subscriptionPeriod?.end)
																						? `${new Date((subscription?.current_period_start || subscriptionPeriod?.start) as string).toLocaleDateString("en-US", {
																							month: "short",
																							day: "numeric",
																							year: "numeric"
																						})} - ${new Date((subscription?.current_period_end || subscriptionPeriod?.end) as string).toLocaleDateString("en-US", {
																							month: "short",
																							day: "numeric",
																							year: "numeric"
																						})}`
																						: "N/A"}
																				</h6>
																			</div>
																		</div>
																	</CardBody>
																</Card>
															</Col>
														</Row>
													</Col>
												</Row>
											</CardBody>
										</Card>

										<Card className="border shadow-none">
											<CardHeader className="bg-light">
												<h6 className="mb-0">Subscription Information</h6>
											</CardHeader>
											<CardBody>
												<Table borderless className="mb-0">
													<tbody>
														<tr>
															<td className="fw-medium" style={{ width: "30%" }}>Subscription ID:</td>
															<td><code className="text-muted">{subscription.id}</code></td>
														</tr>
														<tr>
															<td className="fw-medium">Plan Name:</td>
															<td>{subscription.pricing_plan?.plan_name || "N/A"}</td>
														</tr>
														<tr>
															<td className="fw-medium">Plan Type:</td>
															<td>
																<Badge className="bg-primary-subtle text-primary">
																	{subscription.pricing_plan?.plan_type || "N/A"}
																</Badge>
															</td>
														</tr>
														<tr>
															<td className="fw-medium">Status:</td>
															<td>{getSubscriptionBadge(subscription.status)}</td>
														</tr>
														<tr>
															<td className="fw-medium">Price:</td>
															<td>
																{subscription.pricing_plan?.monthly_price && subscription.pricing_plan?.currency
																	? `${subscription.pricing_plan.currency.toUpperCase()} ${subscription.pricing_plan.monthly_price} / month`
																	: "N/A"}
															</td>
														</tr>
														<tr>
															<td className="fw-medium">Started On:</td>
															<td>
																{(subscription?.current_period_start || subscriptionPeriod?.start)
																	? new Date((subscription?.current_period_start || subscriptionPeriod?.start) as string).toLocaleDateString("en-US", {
																		month: "long",
																		day: "numeric",
																		year: "numeric"
																	})
																	: "N/A"}
															</td>
														</tr>
														<tr>
															<td className="fw-medium">Next Billing Date:</td>
															<td>
																{(subscription?.current_period_end || subscriptionPeriod?.end)
																	? new Date((subscription?.current_period_end || subscriptionPeriod?.end) as string).toLocaleDateString("en-US", {
																		month: "long",
																		day: "numeric",
																		year: "numeric"
																	})
																	: "N/A"}
															</td>
														</tr>
														<tr>
															<td className="fw-medium">Created At:</td>
															<td>
																{subscription.created_at
																	? new Date(subscription.created_at).toLocaleDateString("en-US", {
																		month: "long",
																		day: "numeric",
																		year: "numeric",
																		hour: "2-digit",
																		minute: "2-digit"
																	})
																	: "N/A"}
															</td>
														</tr>
													</tbody>
												</Table>
												<div className="mt-4 text-end">
													{subscription?.status === "active" && (
														<Button
															color="danger"
															outline
															onClick={() => setCancelSubscriptionModal(true)}
														>
															<i className="ri-close-circle-line me-1"></i>
															Cancel Subscription
														</Button>
													)}
												</div>
											</CardBody>
										</Card>
									</>
								) : (
									<Card className="border shadow-none">
										<CardBody className="text-center py-5">
											<div className="avatar-lg mx-auto mb-3">
												<div className="avatar-title bg-primary-subtle text-primary rounded-circle">
													<i className="ri-shopping-bag-line fs-36"></i>
												</div>
											</div>
											<h5 className="mb-2">No Active Subscription</h5>
											<p className="text-muted mb-3">
												This user doesn't have an active subscription yet. Create one to grant access.
											</p>
											<Button color="primary" onClick={openCreateSubscriptionModal}>
												<i className="ri-add-circle-line me-1"></i>
												Create Subscription
											</Button>
										</CardBody>
									</Card>
								)}
							</TabPane>

							{/* Tab 3: Projects */}
							<TabPane tabId="3">
								{projects.length > 0 ? (
									<div className="table-responsive">
										<Table className="table-nowrap align-middle mb-0">
											<thead className="table-light">
												<tr>
													<th>Image</th>
													<th>Title</th>
													<th>Status</th>
													<th>Created</th>
													<th>Actions</th>
												</tr>
											</thead>
											<tbody>
												{projects.map((project) => (
													<tr key={project.id}>
														<td>
															{project.cover_image_url ? (
																<img
																	src={project.cover_image_url}
																	alt={project.title}
																	style={{
																		width: "50px",
																		height: "50px",
																		objectFit: "cover",
																		borderRadius: "4px",
																	}}
																/>
															) : (
																<div
																	className="bg-light d-flex align-items-center justify-content-center"
																	style={{
																		width: "50px",
																		height: "50px",
																		borderRadius: "4px",
																	}}
																>
																	<i className="ri-image-line text-muted"></i>
																</div>
															)}
														</td>
														<td>
															<h6 className="mb-0">{project.title}</h6>
														</td>
														<td>{getProjectStatusBadge(project.status)}</td>
														<td>{new Date(project.created_at).toLocaleDateString()}</td>
														<td>
															<Button
																color="primary"
																size="sm"
																outline
																onClick={() => navigate(`/admin/projects/details?id=${project.id}`)}
															>
																<i className="ri-eye-line me-1"></i>
																View
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</Table>
									</div>
								) : (
									<div className="text-center py-5">
										<i className="ri-folder-line display-1 text-muted"></i>
										<h5 className="mt-3 text-muted">No Projects Yet</h5>
										<p className="text-muted">This user hasn't created any projects.</p>
									</div>
								)}
							</TabPane>

							{/* Tab 4: Admin Notes */}
							<TabPane tabId="4">
								<Card className="border shadow-none">
									<CardHeader className="bg-light">
										<h6 className="mb-0">Internal Admin Notes</h6>
										<small className="text-muted">These notes are only visible to administrators</small>
									</CardHeader>
									<CardBody>
										<Input
											type="textarea"
											rows={8}
											value={adminNotes}
											onChange={(e) => setAdminNotes(e.target.value)}
											placeholder="Add internal notes about this user..."
										/>
										<div className="mt-3 text-end">
											<Button
												color="primary"
												onClick={handleSaveNotes}
												disabled={savingNotes}
											>
												{savingNotes ? (
													<>
														<Spinner size="sm" className="me-2" />
														Saving...
													</>
												) : (
													<>
														<i className="ri-save-line me-1"></i>
														Save Notes
													</>
												)}
											</Button>
										</div>
									</CardBody>
								</Card>
							</TabPane>
						</TabContent>
					</CardBody>
				</Card>

				{/* Ban Modal */}
				<Modal isOpen={banModal} toggle={() => setBanModal(false)} centered>
					<ModalHeader toggle={() => setBanModal(false)}>
						<i className="ri-user-forbid-line text-danger me-2"></i>
						Ban User
					</ModalHeader>
					<ModalBody>
						<p>Are you sure you want to ban <strong>{user.full_name}</strong>?</p>
						<p className="text-muted mb-0">
							This will prevent them from accessing the platform. You can unban them later if needed.
						</p>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={() => setBanModal(false)}>
							Cancel
						</Button>
						<Button color="danger" onClick={handleBanUser}>
							<i className="ri-user-forbid-line me-1"></i>
							Ban User
						</Button>
					</ModalFooter>
				</Modal>

				{/* Unban Modal */}
				<Modal isOpen={unbanModal} toggle={() => setUnbanModal(false)} centered>
					<ModalHeader toggle={() => setUnbanModal(false)}>
						<i className="ri-user-unfollow-line text-success me-2"></i>
						Unban User
					</ModalHeader>
					<ModalBody>
						<p>Are you sure you want to unban <strong>{user.full_name}</strong>?</p>
						<p className="text-muted mb-0">
							This will restore their access to the platform.
						</p>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={() => setUnbanModal(false)}>
							Cancel
						</Button>
						<Button color="success" onClick={handleUnbanUser}>
							<i className="ri-user-unfollow-line me-1"></i>
							Unban User
						</Button>
					</ModalFooter>
				</Modal>

				{/* Status Update Modal */}
				<Modal isOpen={statusModal} toggle={() => setStatusModal(false)} centered>
					<ModalHeader toggle={() => setStatusModal(false)}>
						<i className="ri-edit-line me-2"></i>
						Update User Status
					</ModalHeader>
					<ModalBody>
						<Label>Profile Status</Label>
						<Input
							type="select"
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
						>
							<option value="">Select status...</option>
							<option value="approved">Approved</option>
							<option value="pending">Pending</option>
							<option value="rejected">Rejected</option>
							<option value="incomplete">Incomplete</option>
						</Input>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={() => setStatusModal(false)}>
							Cancel
						</Button>
						<Button color="primary" onClick={handleUpdateStatus} disabled={!newStatus}>
							<i className="ri-save-line me-1"></i>
							Update Status
						</Button>
					</ModalFooter>
				</Modal>

				{/* Create Subscription Modal */}
				<Modal isOpen={subscriptionModal} toggle={() => setSubscriptionModal(false)} centered size="lg">
					<ModalHeader toggle={() => setSubscriptionModal(false)}>
						<i className="ri-shopping-bag-line me-2"></i>
						Create Subscription for {user?.full_name}
					</ModalHeader>
					<ModalBody>
						<Label>Select Pricing Plan *</Label>
						<Input
							type="select"
							value={selectedPlanId}
							onChange={(e) => setSelectedPlanId(e.target.value)}
							className="mb-3"
						>
							<option value="">Choose a plan...</option>
							{availablePlans.map(plan => (
								<option key={plan.id} value={plan.id}>
									{plan.plan_name} - {plan.currency} {plan.monthly_price}/month
								</option>
							))}
						</Input>
						{selectedPlanId && (
							<div className="p-3 bg-light rounded">
								{(() => {
									const plan = availablePlans.find(p => p.id === selectedPlanId);
									return plan ? (
										<>
											<h6>{plan.plan_name}</h6>
											<p className="mb-2 text-muted">{plan.description || "No description"}</p>
											<div className="d-flex justify-content-between align-items-center">
												<span><strong>Price:</strong> {plan.currency} {plan.monthly_price}/month</span>
												<Badge color="primary">{plan.plan_type}</Badge>
											</div>
										</>
									) : null;
								})()}
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={() => setSubscriptionModal(false)}>
							Cancel
						</Button>
						<Button
							color="primary"
							onClick={handleCreateSubscription}
							disabled={!selectedPlanId || processingSubscription}
						>
							{processingSubscription ? (
								<>
									<Spinner size="sm" className="me-2" />
									Creating...
								</>
							) : (
								<>
									<i className="ri-add-circle-line me-1"></i>
									Create Subscription
								</>
							)}
						</Button>
					</ModalFooter>
				</Modal>

				{/* Cancel Subscription Modal */}
				<Modal isOpen={cancelSubscriptionModal} toggle={() => setCancelSubscriptionModal(false)} centered>
					<ModalHeader toggle={() => setCancelSubscriptionModal(false)} className="bg-danger text-white">
						<i className="ri-close-circle-line me-2"></i>
						Cancel Subscription
					</ModalHeader>
					<ModalBody>
						<div className="text-center py-3">
							<i className="ri-error-warning-line text-danger" style={{ fontSize: "64px" }}></i>
							<h5 className="mt-3">Are you sure?</h5>
							<p className="text-muted mb-0">
								This will cancel <strong>{user?.full_name}'s</strong> subscription.
								<br />
								The user will lose access to premium features.
							</p>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={() => setCancelSubscriptionModal(false)}>
							No, Keep It
						</Button>
						<Button
							color="danger"
							onClick={handleCancelSubscription}
							disabled={processingSubscription}
						>
							{processingSubscription ? (
								<>
									<Spinner size="sm" className="me-2" />
									Canceling...
								</>
							) : (
								<>
									<i className="ri-close-circle-line me-1"></i>
									Yes, Cancel Subscription
								</>
							)}
						</Button>
					</ModalFooter>
				</Modal>
			</Container>
		</div>
	);
};

export default UserDetails;

