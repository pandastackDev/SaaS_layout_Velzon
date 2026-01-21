import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Table,
	Badge,
	Input,
	Button,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";
import { toast } from "react-toastify";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";

interface Subscription {
	id: string;
	user_id: string;
	pricing_plan_id?: string;
	status: string;
	stripe_subscription_id?: string;
	stripe_customer_id?: string;
	stripe_price_id?: string;
	payment_provider?: string;
	current_period_start?: string;
	current_period_end?: string;
	cancel_at_period_end: boolean;
	canceled_at?: string;
	monthly_price: number;
	currency: string;
	created_at: string;
	updated_at: string;
	user?: {
		full_name: string;
		personal_email: string;
	};
}

const SubscriptionsHistory = () => {
	document.title = "Subscriptions History | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

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
			loadSubscriptions();
		}
	}, [isAdmin, adminLoading, navigate]);

	useEffect(() => {
		filterSubscriptions();
		setCurrentPage(1); // Reset to first page when filters change
	}, [subscriptions, searchTerm, statusFilter]);

	const loadSubscriptions = async () => {
		try {
			setLoading(true);
			console.log("=== Loading Subscriptions Debug ===");
			console.log("1. Checking Supabase connection...");
			
			// First, check if we can access the table at all
			const { data: testData, error: testError } = await supabase
				.from("subscriptions")
				.select("id")
				.limit(1);

			if (testError) {
				console.error("❌ Supabase connection error:", testError);
				console.error("Error code:", testError.code);
				console.error("Error message:", testError.message);
				console.error("Error details:", testError.details);
				console.error("Error hint:", testError.hint);

				// Check if it's an RLS policy error
				if (
					testError.code === "42501" ||
					testError.message?.toLowerCase().includes("policy") ||
					testError.message?.toLowerCase().includes("permission") ||
					testError.message?.toLowerCase().includes("row-level security")
				) {
					const errorMsg = `RLS Policy Error: ${testError.message}\n\nPlease run the SQL in supabase_rls_policies.sql to grant access.`;
					console.error("🔒", errorMsg);
					toast.error("Access denied by RLS policy. Check console for details.");
					setSubscriptions([]);
					setFilteredSubscriptions([]);
					return;
				}

				// Check if table doesn't exist
				if (testError.code === "42P01" || testError.message?.toLowerCase().includes("does not exist")) {
					console.error("❌ Table 'subscriptions' does not exist in database");
					toast.error("Subscriptions table not found. Please create it in Supabase.");
					setSubscriptions([]);
					setFilteredSubscriptions([]);
					return;
				}

				throw testError;
			}

			console.log("✅ Supabase connection OK");
			console.log("2. Fetching all subscriptions...");

			const { data, error, count } = await supabase
				.from("subscriptions")
				.select("*", { count: "exact" })
				.order("created_at", { ascending: false });

			if (error) {
				console.error("❌ Error fetching subscriptions:", error);
				throw error;
			}

			console.log("✅ Query successful");
			console.log("3. Results:", {
				count: count || data?.length || 0,
				dataLength: data?.length || 0,
				firstRecord: data?.[0] || "none",
			});

			if (!data || data.length === 0) {
				console.log("⚠️ No subscriptions found in database");
				console.log("💡 Possible reasons:");
				console.log("   - No subscriptions have been created yet");
				console.log("   - RLS policy is blocking access (check Supabase dashboard)");
				console.log("   - Data exists but in a different table");
				
				setSubscriptions([]);
				setFilteredSubscriptions([]);
				toast.info("No subscriptions found. Check console for debugging info.");
				return;
			}

			console.log(`✅ Found ${data.length} subscription(s)`);

			console.log("4. Fetching user information...");
			// Fetch user information
			const userIds = [...new Set(data.map((s) => s.user_id))];
			console.log("   User IDs to fetch:", userIds.length);

			const { data: usersData, error: usersError } = await supabase
				.from("users")
				.select("id, full_name, personal_email")
				.in("id", userIds);

			if (usersError) {
				console.warn("⚠️ Error fetching users (non-critical):", usersError);
			} else {
				console.log(`✅ Found ${usersData?.length || 0} user(s)`);
			}

			const userMap = new Map((usersData || []).map((u) => [u.id, u]));

			const subscriptionsWithUsers: Subscription[] = data.map((subscription) => ({
				...subscription,
				user: userMap.get(subscription.user_id),
			}));

			console.log("✅ Subscriptions loaded successfully:", subscriptionsWithUsers.length);
			console.log("=== End Debug ===");
			
			setSubscriptions(subscriptionsWithUsers);
			setFilteredSubscriptions(subscriptionsWithUsers);
		} catch (error: any) {
			console.error("❌❌❌ CRITICAL ERROR loading subscriptions ❌❌❌");
			console.error("Error object:", error);
			console.error("Error code:", error?.code);
			console.error("Error message:", error?.message);
			console.error("Error details:", error?.details);
			console.error("Error hint:", error?.hint);
			console.error("Full error:", JSON.stringify(error, null, 2));
			
			const errorMsg = getErrorMessage(error);
			
			// Provide specific guidance based on error type
			if (error?.code === "42501") {
				toast.error(
					"RLS Policy Error: You don't have permission to view subscriptions. Run the SQL in supabase_rls_policies.sql"
				);
			} else if (error?.code === "42P01") {
				toast.error("Table 'subscriptions' does not exist. Please create it in Supabase.");
			} else {
				toast.error(`Failed to load subscriptions: ${errorMsg}. Check console for details.`);
			}
			
			setSubscriptions([]);
			setFilteredSubscriptions([]);
		} finally {
			setLoading(false);
		}
	};

	const filterSubscriptions = () => {
		let filtered = [...subscriptions];
		if (searchTerm) {
			filtered = filtered.filter(
				(s) =>
					s.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					s.user?.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					s.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (statusFilter !== "all") {
			filtered = filtered.filter((s) => s.status === statusFilter);
		}
		setFilteredSubscriptions(filtered);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-success">Active</Badge>;
			case "canceled":
				return <Badge className="bg-danger">Canceled</Badge>;
			case "expired":
				return <Badge className="bg-secondary">Expired</Badge>;
			case "past_due":
				return <Badge className="bg-warning">Past Due</Badge>;
			case "unpaid":
				return <Badge className="bg-danger">Unpaid</Badge>;
			case "trial":
				return <Badge className="bg-info">Trial</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Subscriptions History" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={8} rows={8} />
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	// Calculate pagination
	const indexOfLastData = currentPage * perPageData;
	const indexOfFirstData = indexOfLastData - perPageData;
	const currentSubscriptions = filteredSubscriptions.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Subscriptions History" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">All Subscriptions</h4>
								<div className="d-flex gap-2">
									<Input
										type="text"
										placeholder="Search subscriptions..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										style={{ maxWidth: "250px" }}
									/>
									<Input
										type="select"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Status</option>
										<option value="active">Active</option>
										<option value="canceled">Canceled</option>
										<option value="expired">Expired</option>
										<option value="past_due">Past Due</option>
										<option value="unpaid">Unpaid</option>
										<option value="trial">Trial</option>
									</Input>
								</div>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>User</th>
												<th>Status</th>
												<th>Monthly Price</th>
												<th>Current Period Start</th>
												<th>Current Period End</th>
												<th>Cancel at Period End</th>
												<th>Payment Provider</th>
												<th>Created</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredSubscriptions.length === 0 ? (
												<tr>
													<td colSpan={9} className="text-center py-4">
														<p className="text-muted mb-0">No subscriptions found</p>
														{subscriptions.length === 0 && (
															<small className="text-muted d-block mt-2">
																If you expect to see subscriptions, check:
																<br />
																1. RLS policies on the subscriptions table
																<br />
																2. Browser console for error messages
																<br />
																3. Supabase dashboard to verify data exists
															</small>
														)}
													</td>
												</tr>
											) : (
												currentSubscriptions.map((subscription) => (
													<tr key={subscription.id}>
														<td>
															<div>
																<p className="mb-0 fw-medium">{subscription.user?.full_name || "N/A"}</p>
																<small className="text-muted">{subscription.user?.personal_email || ""}</small>
															</div>
														</td>
														<td>{getStatusBadge(subscription.status)}</td>
														<td>
															<strong>
																{subscription.currency || "USD"} {parseFloat(subscription.monthly_price.toString()).toFixed(2)}
															</strong>
														</td>
														<td>{formatDate(subscription.current_period_start)}</td>
														<td>{formatDate(subscription.current_period_end)}</td>
														<td>
															{subscription.cancel_at_period_end ? (
																<Badge className="bg-warning">Yes</Badge>
															) : (
																<Badge className="bg-secondary">No</Badge>
															)}
														</td>
														<td>
															{subscription.payment_provider ? (
																<Badge className="bg-info-subtle text-info">
																	{subscription.payment_provider}
																</Badge>
															) : (
																<span className="text-muted">N/A</span>
															)}
														</td>
														<td>{formatDate(subscription.created_at)}</td>
														<td>
															<UncontrolledDropdown>
																<DropdownToggle tag="button" className="btn btn-soft-secondary btn-sm">
																	<i className="ri-more-fill"></i>
																</DropdownToggle>
																<DropdownMenu>
																	<DropdownItem onClick={() => navigate(`/pages-profile?id=${subscription.user_id}`)}>
																		<i className="ri-eye-line me-2"></i>View User Profile
																	</DropdownItem>
																</DropdownMenu>
															</UncontrolledDropdown>
														</td>
													</tr>
												))
											)}
										</tbody>
									</Table>
								</div>
								{filteredSubscriptions.length > 0 && (
									<Pagination
										data={filteredSubscriptions}
										currentPage={currentPage}
										setCurrentPage={setCurrentPage}
										perPageData={perPageData}
									/>
								)}
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default SubscriptionsHistory;
