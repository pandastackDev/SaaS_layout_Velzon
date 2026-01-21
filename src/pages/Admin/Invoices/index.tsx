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
import CountUp from "react-countup";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton, KPICardsSkeleton } from "../../../Components/Common/LoadingSkeleton";

interface Invoice {
	id: string;
	user_id: string;
	subscription_id?: string;
	invoice_type: string;
	subtotal: number;
	tax_amount: number;
	total_amount: number;
	currency: string;
	payment_status: string;
	billing_period_start?: string;
	billing_period_end?: string;
	due_date?: string;
	paid_at?: string;
	created_at: string;
	user?: {
		full_name: string;
		personal_email: string;
	};
}

const ViewInvoices = () => {
	document.title = "View Invoices | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");

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
			loadInvoices();
		}
	}, [isAdmin, adminLoading, navigate]);

	useEffect(() => {
		filterInvoices();
		setCurrentPage(1); // Reset to first page when filters change
	}, [invoices, searchTerm, statusFilter, typeFilter]);

	const loadInvoices = async () => {
		try {
			setLoading(true);
			const { data: invoicesData, error } = await supabase
				.from("invoices")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;

			if (!invoicesData || invoicesData.length === 0) {
				setInvoices([]);
				setFilteredInvoices([]);
				return;
			}

			const userIds = [...new Set(invoicesData.map((i) => i.user_id))];
			const { data: usersData } = await supabase
				.from("users")
				.select("id, full_name, personal_email")
				.in("id", userIds);

			const userMap = new Map((usersData || []).map((u) => [u.id, u]));

			const invoicesWithUsers: Invoice[] = invoicesData.map((invoice) => ({
				...invoice,
				user: userMap.get(invoice.user_id),
			}));

			setInvoices(invoicesWithUsers);
			setFilteredInvoices(invoicesWithUsers);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const filterInvoices = () => {
		let filtered = [...invoices];
		if (searchTerm) {
			filtered = filtered.filter(
				(i) =>
					i.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.user?.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (statusFilter !== "all") {
			filtered = filtered.filter((i) => i.payment_status === statusFilter);
		}
		if (typeFilter !== "all") {
			filtered = filtered.filter((i) => i.invoice_type === typeFilter);
		}
		setFilteredInvoices(filtered);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return <Badge className="bg-success">Paid</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			case "overdue":
				return <Badge className="bg-danger">Overdue</Badge>;
			case "cancelled":
				return <Badge className="bg-secondary">Cancelled</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	const calculateTotalRevenue = () => {
		return filteredInvoices
			.filter((i) => i.payment_status === "paid")
			.reduce((sum, inv) => sum + (parseFloat(inv.total_amount.toString()) || 0), 0);
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="View Invoices" pageTitle="Admin" />
					{/* KPI Cards Skeleton */}
					<KPICardsSkeleton />
					{/* Table Skeleton */}
					<Row className="mt-4">
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
	const currentInvoices = filteredInvoices.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="View Invoices" pageTitle="Admin" />

				{/* Summary Cards */}
				<Row>
					<Col md={6} xl={4}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Total Invoices</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											<span className="counter-value" data-target={filteredInvoices.length}>
												<CountUp start={0} end={filteredInvoices.length} duration={4} />
											</span>
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-primary-subtle rounded-circle fs-2">
												<i className="ri-file-list-line text-primary"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
					<Col md={6} xl={4}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Total Revenue</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											<span className="counter-value" data-target={calculateTotalRevenue()}>
												$<CountUp start={0} end={calculateTotalRevenue()} decimals={2} duration={4} />
											</span>
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-success-subtle rounded-circle fs-2">
												<i className="ri-money-dollar-circle-line text-success"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
					<Col md={6} xl={4}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex justify-content-between">
									<div>
										<p className="fw-medium text-muted mb-0">Paid Invoices</p>
										<h2 className="mt-4 fs-22 ff-secondary fw-semibold">
											<span className="counter-value">
												<CountUp
													start={0}
													end={filteredInvoices.filter((i) => i.payment_status === "paid").length}
													duration={4}
												/>
											</span>
										</h2>
									</div>
									<div>
										<div className="avatar-sm flex-shrink-0">
											<span className="avatar-title bg-info-subtle rounded-circle fs-2">
												<i className="ri-checkbox-circle-line text-info"></i>
											</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>

				<Row className="mt-4">
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">All Invoices</h4>
								<div className="d-flex gap-2">
									<Input
										type="text"
										placeholder="Search invoices..."
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
										<option value="paid">Paid</option>
										<option value="pending">Pending</option>
										<option value="overdue">Overdue</option>
									</Input>
									<Input
										type="select"
										value={typeFilter}
										onChange={(e) => setTypeFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Types</option>
										<option value="subscription">Subscription</option>
										<option value="advertising">Advertising</option>
									</Input>
								</div>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>Invoice ID</th>
												<th>User</th>
												<th>Type</th>
												<th>Amount</th>
												<th>Status</th>
												<th>Due Date</th>
												<th>Created</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredInvoices.length === 0 ? (
												<tr>
													<td colSpan={8} className="text-center py-4">
														<p className="text-muted mb-0">No invoices found</p>
													</td>
												</tr>
											) : (
												currentInvoices.map((invoice) => (
													<tr key={invoice.id}>
														<td>
															<code className="text-primary">#{invoice.id.slice(0, 8)}</code>
														</td>
														<td>
															<div>
																<p className="mb-0 fw-medium">{invoice.user?.full_name || "N/A"}</p>
																<small className="text-muted">{invoice.user?.personal_email || ""}</small>
															</div>
														</td>
														<td>
															<Badge className="bg-primary-subtle text-primary">
																{invoice.invoice_type || "N/A"}
															</Badge>
														</td>
														<td>
															<strong>
																{invoice.currency || "USD"} {parseFloat(invoice.total_amount.toString()).toFixed(2)}
															</strong>
														</td>
														<td>{getStatusBadge(invoice.payment_status)}</td>
														<td>
															{invoice.due_date
																? new Date(invoice.due_date).toLocaleDateString()
																: "N/A"}
														</td>
														<td>{new Date(invoice.created_at).toLocaleDateString()}</td>
														<td>
															<UncontrolledDropdown>
																<DropdownToggle tag="button" className="btn btn-soft-secondary btn-sm">
																	<i className="ri-more-fill"></i>
																</DropdownToggle>
																<DropdownMenu>
																	<DropdownItem onClick={() => navigate(`/apps-invoice-details?id=${invoice.id}`)}>
																		<i className="ri-eye-line me-2"></i>View Details
																	</DropdownItem>
																	<DropdownItem>
																		<i className="ri-download-line me-2"></i>Download PDF
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
								{filteredInvoices.length > 0 && (
									<Pagination
										data={filteredInvoices}
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

export default ViewInvoices;
