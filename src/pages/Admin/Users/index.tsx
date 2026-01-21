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
	Button,
	Badge,
	Input,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Spinner,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Label,
} from "reactstrap";
import { showToast } from "../../../lib/toast";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";
import { activityHelpers } from "../../../lib/activityTracker";

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
}

const ManageUsers = () => {
	document.title = "Manage Users | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editModal, setEditModal] = useState(false);
	const [banModal, setBanModal] = useState(false);
	const [userToBan, setUserToBan] = useState<User | null>(null);
	const [editForm, setEditForm] = useState({
		full_name: "",
		user_type: "",
		profile_status: "",
		country: "",
		city: "",
		telephone: "",
	});
	const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
			loadUsers();
		}
	}, [isAdmin, adminLoading, navigate]);

	useEffect(() => {
		filterUsers();
		setCurrentPage(1); // Reset to first page when filters change
	}, [users, searchTerm, typeFilter, statusFilter]);

	const loadUsers = async () => {
		try {
			setLoading(true);
			console.log("Loading users from Supabase...");
			
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			console.log("Users loaded:", data?.length || 0);
			setUsers(data || []);
			setFilteredUsers(data || []);
		} catch (error: any) {
			console.error("Error loading users:", error);
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to load users: ${errorMsg}`);
			// Set empty arrays on error to show "No users found" instead of infinite loading
			setUsers([]);
			setFilteredUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const filterUsers = () => {
		let filtered = [...users];
		if (searchTerm) {
			filtered = filtered.filter(
				(u) =>
					u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					u.personal_email?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (typeFilter !== "all") {
			filtered = filtered.filter((u) => u.user_type === typeFilter);
		}
		if (statusFilter !== "all") {
			if (statusFilter === "banned") {
				filtered = filtered.filter((u) => u.is_banned === true);
			} else {
				filtered = filtered.filter((u) => u.profile_status === statusFilter);
			}
		}
		setFilteredUsers(filtered);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setEditForm({
			full_name: user.full_name,
			user_type: user.user_type,
			profile_status: user.profile_status,
			country: user.country || "",
			city: user.city || "",
			telephone: user.telephone || "",
		});
		setEditModal(true);
	};

	const updateUser = async () => {
		if (!selectedUser) return;

		try {
			const { error } = await supabase
				.from("users")
				.update({
					full_name: editForm.full_name,
					user_type: editForm.user_type,
					profile_status: editForm.profile_status,
					country: editForm.country || null,
					city: editForm.city || null,
					telephone: editForm.telephone || null,
				})
				.eq("id", selectedUser.id);

			if (error) throw error;

			// Log activity
			if (selectedUser) {
				activityHelpers.userUpdated(editForm.full_name, selectedUser.id);
			}

			showToast.success("User updated successfully!");
			setEditModal(false);
			setSelectedUser(null);
			await loadUsers();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		}
	};

	const handleBanUser = (user: User) => {
		setUserToBan(user);
		setBanModal(true);
	};

	const banUser = async () => {
		if (!userToBan) return;

		try {
			// Try to update is_banned field first, if it doesn't exist, use profile_status
			const updateData: any = {
				is_banned: true,
				profile_status: "rejected",
			};

			const { error } = await supabase
				.from("users")
				.update(updateData)
				.eq("id", userToBan.id);

			if (error) {
				// If is_banned column doesn't exist, try without it
				delete updateData.is_banned;
				const { error: error2 } = await supabase
					.from("users")
					.update(updateData)
					.eq("id", userToBan.id);
				
				if (error2) throw error2;
			}

			// Log activity
			activityHelpers.userBanned(userToBan.full_name, userToBan.id);

			showToast.success(`User ${userToBan.full_name} has been banned successfully!`);
			setBanModal(false);
			setUserToBan(null);
			await loadUsers();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to ban user: ${errorMsg}`);
		}
	};

	const handleUnbanUser = async (user: User) => {
		try {
			const updateData: any = {
				is_banned: false,
				profile_status: "approved",
			};

			const { error } = await supabase
				.from("users")
				.update(updateData)
				.eq("id", user.id);

			if (error) {
				// If is_banned column doesn't exist, try without it
				delete updateData.is_banned;
				const { error: error2 } = await supabase
					.from("users")
					.update(updateData)
					.eq("id", user.id);
				
				if (error2) throw error2;
			}

			// Log activity
			activityHelpers.userUnbanned(user.full_name, user.id);

			showToast.success(`User ${user.full_name} has been unbanned successfully!`);
			await loadUsers();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to unban user: ${errorMsg}`);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return <Badge className="bg-success">Approved</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			case "rejected":
				return <Badge className="bg-danger">Rejected</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	const getUserTypeBadge = (type: string) => {
		const colors: { [key: string]: string } = {
			Inventor: "primary",
			StartUp: "info",
			Company: "success",
			Investor: "warning",
		};
		return <Badge className={`bg-${colors[type] || "secondary"}-subtle text-${colors[type] || "secondary"}`}>{type}</Badge>;
	};

	// Show loading skeleton only if we're still checking admin status OR actively loading data
	if (adminLoading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Manage Users" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={7} rows={8} />
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	// If not admin, don't render anything (will redirect)
	if (!isAdmin) {
		return null;
	}

	// Show loading skeleton while fetching data
	if (loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Manage Users" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<Card>
								<CardBody>
									<div className="text-center py-5">
										<Spinner color="primary" className="me-2" />
										<span>Loading users...</span>
									</div>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	// Calculate pagination
	const indexOfLastData = currentPage * perPageData;
	const indexOfFirstData = indexOfLastData - perPageData;
	const currentUsers = filteredUsers.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Manage Users" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">Users Management</h4>
								<div className="d-flex gap-2">
									<Input
										type="text"
										placeholder="Search users..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										style={{ maxWidth: "250px" }}
									/>
									<Input
										type="select"
										value={typeFilter}
										onChange={(e) => setTypeFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Types</option>
										<option value="Inventor">Inventor</option>
										<option value="StartUp">StartUp</option>
										<option value="Company">Company</option>
										<option value="Investor">Investor</option>
									</Input>
									<Input
										type="select"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Status</option>
										<option value="pending">Pending</option>
										<option value="approved">Approved</option>
										<option value="rejected">Rejected</option>
										<option value="banned">Banned</option>
									</Input>
								</div>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>User</th>
												<th>Email</th>
												<th>Type</th>
												<th>Status</th>
												<th>Location</th>
												<th>Created</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredUsers.length === 0 ? (
												<tr>
													<td colSpan={7} className="text-center py-4">
														<p className="text-muted mb-0">No users found</p>
													</td>
												</tr>
											) : (
												currentUsers.map((user) => (
													<tr key={user.id}>
														<td>
															<div className="d-flex align-items-center">
																{user.photo_url && !imageErrors.has(user.id) ? (
																	<img
																		src={user.photo_url}
																		alt={user.full_name}
																		className="rounded-circle avatar-sm me-2"
																		onError={() => {
																			setImageErrors((prev) => new Set(prev).add(user.id));
																		}}
																		style={{ width: "40px", height: "40px", objectFit: "cover" }}
																	/>
																) : (
																	<div className="avatar-sm me-2">
																		<span className="avatar-title bg-primary-subtle text-primary rounded-circle" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
																			{user.full_name?.charAt(0)?.toUpperCase() || "U"}
																		</span>
																	</div>
																)}
																<div>
																	<h6 className="mb-0">{user.full_name}</h6>
																	{user.telephone && <small className="text-muted">{user.telephone}</small>}
																</div>
															</div>
														</td>
														<td>
															<p className="mb-0">{user.personal_email}</p>
														</td>
														<td>{getUserTypeBadge(user.user_type)}</td>
														<td>{getStatusBadge(user.profile_status, user.is_banned)}</td>
														<td>
															{user.city && user.country
																? `${user.city}, ${user.country}`
																: user.country || user.city || "N/A"}
														</td>
														<td>{new Date(user.created_at).toLocaleDateString()}</td>
														<td>
															<UncontrolledDropdown>
																<DropdownToggle tag="button" className="btn btn-soft-secondary btn-sm">
																	<i className="ri-more-fill"></i>
																</DropdownToggle>
																<DropdownMenu>
																	<DropdownItem onClick={() => navigate(`/pages-profile?id=${user.id}`)}>
																		<i className="ri-eye-line me-2"></i>View Profile
																	</DropdownItem>
																	<DropdownItem onClick={() => handleEdit(user)}>
																		<i className="ri-edit-line me-2"></i>Edit User
																	</DropdownItem>
																	<DropdownItem divider />
																	{user.is_banned ? (
																		<DropdownItem onClick={() => handleUnbanUser(user)}>
																			<i className="ri-user-unfollow-line me-2 text-success"></i>Unban User
																		</DropdownItem>
																	) : (
																		<DropdownItem onClick={() => handleBanUser(user)}>
																			<i className="ri-user-forbid-line me-2 text-danger"></i>Ban User
																		</DropdownItem>
																	)}
																</DropdownMenu>
															</UncontrolledDropdown>
														</td>
													</tr>
												))
											)}
										</tbody>
									</Table>
								</div>
								{filteredUsers.length > 0 && (
									<Pagination
										data={filteredUsers}
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

			{/* Edit Modal */}
			<Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg" centered>
				<ModalHeader toggle={() => setEditModal(false)}>Edit User</ModalHeader>
				<ModalBody>
					<Row>
						<Col md={6}>
							<Label>Full Name *</Label>
							<Input
								type="text"
								value={editForm.full_name}
								onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
							/>
						</Col>
						<Col md={6}>
							<Label>User Type *</Label>
							<Input
								type="select"
								value={editForm.user_type}
								onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
							>
								<option value="Inventor">Inventor</option>
								<option value="StartUp">StartUp</option>
								<option value="Company">Company</option>
								<option value="Investor">Investor</option>
							</Input>
						</Col>
						<Col md={6}>
							<Label>Profile Status *</Label>
							<Input
								type="select"
								value={editForm.profile_status}
								onChange={(e) => setEditForm({ ...editForm, profile_status: e.target.value })}
							>
								<option value="pending">Pending</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
							</Input>
						</Col>
						<Col md={6}>
							<Label>Country</Label>
							<Input
								type="text"
								value={editForm.country}
								onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
							/>
						</Col>
						<Col md={6}>
							<Label>City</Label>
							<Input
								type="text"
								value={editForm.city}
								onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
							/>
						</Col>
						<Col md={6}>
							<Label>Telephone</Label>
							<Input
								type="text"
								value={editForm.telephone}
								onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
							/>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditModal(false)}>
						Cancel
					</Button>
					<Button color="primary" onClick={updateUser}>
						<i className="ri-save-line me-1"></i>Update User
					</Button>
				</ModalFooter>
			</Modal>

			{/* Ban User Confirmation Modal */}
			<Modal isOpen={banModal} toggle={() => setBanModal(false)} centered>
				<ModalHeader toggle={() => setBanModal(false)}>Ban User</ModalHeader>
				<ModalBody>
					<p>Are you sure you want to ban <strong>{userToBan?.full_name}</strong>?</p>
					<p className="text-muted mb-0">This action will prevent the user from accessing the platform. You can unban them later if needed.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setBanModal(false)}>
						Cancel
					</Button>
					<Button color="danger" onClick={banUser}>
						<i className="ri-user-forbid-line me-1"></i>Ban User
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ManageUsers;
