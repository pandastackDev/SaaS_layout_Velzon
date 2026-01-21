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
} from "reactstrap";
import { showToast } from "../../../lib/toast";
import { activityHelpers } from "../../../lib/activityTracker";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";
import UserAvatar from "../../../Components/Common/UserAvatar";

interface User {
	id: string;
	full_name: string;
	personal_email: string;
	user_type: string;
	profile_status: string;
	photo_url?: string;
	country?: string;
	city?: string;
	created_at: string;
	updated_at?: string;
}

const ProfileApproval = () => {
	document.title = "Profile Approval | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
	const [approveModal, setApproveModal] = useState(false);
	const [rejectModal, setRejectModal] = useState(false);
	const [resetModal, setResetModal] = useState(false);
	const [pendingAction, setPendingAction] = useState<"approve" | "reject" | "reset" | null>(null);

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
	}, [users, searchTerm, statusFilter]);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;

			setUsers(data || []);
			setFilteredUsers(data || []);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
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
		if (statusFilter !== "all") {
			filtered = filtered.filter((u) => u.profile_status === statusFilter);
		}
		setFilteredUsers(filtered);
	};

	const handleApprove = (user: User) => {
		setSelectedUser(user);
		setPendingAction("approve");
		setApproveModal(true);
	};

	const handleReject = (user: User) => {
		setSelectedUser(user);
		setPendingAction("reject");
		setRejectModal(true);
	};

	const handleReset = (user: User) => {
		setSelectedUser(user);
		setPendingAction("reset");
		setResetModal(true);
	};

	const updateProfileStatus = async (userId: string, newStatus: string) => {
		if (updatingUserId === userId) return;

		try {
			setUpdatingUserId(userId);
			
			// Get user info for activity logging
			const user = users.find(u => u.id === userId);
			const userName = user?.full_name || selectedUser?.full_name || "User";
			
			const { error } = await supabase
				.from("users")
				.update({
					profile_status: newStatus,
				})
				.eq("id", userId);

			if (error) throw error;

			const statusMessage = 
				newStatus === "approved" ? "approved" :
				newStatus === "rejected" ? "rejected" :
				newStatus === "pending" ? "reset to pending" :
				"updated";

			// Log activity
			if (newStatus === "approved") {
				activityHelpers.profileApproved(userName, userId);
			} else if (newStatus === "rejected") {
				activityHelpers.profileRejected(userName, userId);
			} else if (newStatus === "pending") {
				activityHelpers.profileReset(userName, userId);
			}

			showToast.success(
				`Profile ${statusMessage} successfully. ${newStatus === "approved" ? "The user now has full access to the platform." : ""}`
			);

			// Close all modals
			setApproveModal(false);
			setRejectModal(false);
			setResetModal(false);
			setSelectedUser(null);
			setPendingAction(null);
			
			// Reload users to reflect the change
			await loadUsers();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to update profile status: ${errorMsg}`);
		} finally {
			setUpdatingUserId(null);
		}
	};

	const handleConfirmAction = () => {
		if (!selectedUser || !pendingAction) return;
		
		let newStatus: string;
		if (pendingAction === "approve") {
			newStatus = "approved";
		} else if (pendingAction === "reject") {
			newStatus = "rejected";
		} else {
			newStatus = "pending";
		}
		
		updateProfileStatus(selectedUser.id, newStatus);
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

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Profile Approval" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={7} rows={8} />
						</Col>
					</Row>
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
				<BreadCrumb title="Profile Approval" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">User Profile Approval</h4>
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
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Status</option>
										<option value="pending">Pending</option>
										<option value="approved">Approved</option>
										<option value="rejected">Rejected</option>
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
												<th>User Type</th>
												<th>Location</th>
												<th>Status</th>
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
												filteredUsers.map((user) => (
													<tr key={user.id}>
														<td>
															<div className="d-flex align-items-center">
																<UserAvatar
																	photoUrl={user.photo_url}
																	fullName={user.full_name}
																	size="sm"
																	className="me-2"
																/>
																<div>
																	<h6 className="mb-0">{user.full_name}</h6>
																</div>
															</div>
														</td>
														<td>
															<p className="mb-0">{user.personal_email}</p>
														</td>
														<td>{getUserTypeBadge(user.user_type)}</td>
														<td>
															{user.city && user.country
																? `${user.city}, ${user.country}`
																: user.country || user.city || "N/A"}
														</td>
														<td>{getStatusBadge(user.profile_status)}</td>
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
																	{user.profile_status === "pending" && (
																		<>
																			<DropdownItem onClick={() => handleApprove(user)}>
																				<i className="ri-checkbox-circle-line me-2 text-success"></i>Approve
																			</DropdownItem>
																			<DropdownItem onClick={() => handleReject(user)}>
																				<i className="ri-close-circle-line me-2 text-danger"></i>Reject
																			</DropdownItem>
																		</>
																	)}
																	{(user.profile_status === "approved" || user.profile_status === "rejected") && (
																		<>
																			{user.profile_status === "approved" && (
																				<DropdownItem onClick={() => handleReject(user)}>
																					<i className="ri-close-circle-line me-2 text-danger"></i>Reject
																				</DropdownItem>
																			)}
																			{user.profile_status === "rejected" && (
																				<DropdownItem onClick={() => handleApprove(user)}>
																					<i className="ri-checkbox-circle-line me-2 text-success"></i>Approve
																				</DropdownItem>
																			)}
																			<DropdownItem onClick={() => handleReset(user)}>
																				<i className="ri-refresh-line me-2 text-warning"></i>Reset to Pending
																			</DropdownItem>
																		</>
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
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Approve Modal */}
			<Modal isOpen={approveModal} toggle={() => setApproveModal(false)} centered>
				<ModalHeader toggle={() => setApproveModal(false)}>Approve Profile</ModalHeader>
				<ModalBody>
					<p>
						Are you sure you want to approve the profile for <strong>"{selectedUser?.full_name}"</strong>?
					</p>
					<p className="text-muted">Once approved, the user will have full access to the platform.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setApproveModal(false)}>
						Cancel
					</Button>
					<Button
						color="success"
						onClick={handleConfirmAction}
						disabled={updatingUserId === selectedUser?.id}
					>
						{updatingUserId === selectedUser?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Approving...
							</>
						) : (
							<>
								<i className="ri-checkbox-circle-line me-1"></i>Approve Profile
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Reject Modal */}
			<Modal isOpen={rejectModal} toggle={() => setRejectModal(false)} centered>
				<ModalHeader toggle={() => setRejectModal(false)} className="text-danger">Reject Profile</ModalHeader>
				<ModalBody>
					<p>
						Are you sure you want to reject the profile for <strong>"{selectedUser?.full_name}"</strong>?
					</p>
					<p className="text-muted">This action cannot be undone. The user will not be able to access the platform until their profile is reset to pending or approved.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setRejectModal(false)}>
						Cancel
					</Button>
					<Button
						color="danger"
						onClick={handleConfirmAction}
						disabled={updatingUserId === selectedUser?.id}
					>
						{updatingUserId === selectedUser?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Rejecting...
							</>
						) : (
							<>
								<i className="ri-close-circle-line me-1"></i>Reject Profile
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Reset to Pending Modal */}
			<Modal isOpen={resetModal} toggle={() => setResetModal(false)} centered>
				<ModalHeader toggle={() => setResetModal(false)} className="text-warning">Reset to Pending</ModalHeader>
				<ModalBody>
					<p>
						Are you sure you want to reset the profile status for <strong>"{selectedUser?.full_name}"</strong> back to pending?
					</p>
					<p className="text-muted">
						This will change the status from <strong>"{selectedUser?.profile_status}"</strong> to <strong>"pending"</strong>. 
						The user will need to be approved again to access the platform.
					</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setResetModal(false)}>
						Cancel
					</Button>
					<Button
						color="warning"
						onClick={handleConfirmAction}
						disabled={updatingUserId === selectedUser?.id}
					>
						{updatingUserId === selectedUser?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Resetting...
							</>
						) : (
							<>
								<i className="ri-refresh-line me-1"></i>Reset to Pending
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ProfileApproval;
