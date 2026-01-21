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
	Label,
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
import { toast } from "react-toastify";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";

interface Project {
	id: string;
	user_id: string;
	title: string;
	subtitle?: string;
	description?: string;
	category?: string;
	status: string;
	created_at: string;
	updated_at: string;
	user?: {
		full_name: string;
		personal_email: string;
		user_type: string;
	};
}

const ManageProjects = () => {
	document.title = "Manage Projects | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState<Project[]>([]);
	const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
	const [approveModal, setApproveModal] = useState(false);
	const [rejectModal, setRejectModal] = useState(false);
	const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

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
			loadProjects();
		}
	}, [isAdmin, adminLoading, navigate]);

	useEffect(() => {
		filterProjects();
	}, [projects, searchTerm, statusFilter]);

	const loadProjects = async () => {
		try {
			setLoading(true);
			const { data: projectsData, error } = await supabase
				.from("projects")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;

			if (!projectsData || projectsData.length === 0) {
				setProjects([]);
				setFilteredProjects([]);
				return;
			}

			const userIds = [...new Set(projectsData.map((p) => p.user_id))];
			const { data: usersData } = await supabase
				.from("users")
				.select("id, full_name, personal_email, user_type")
				.in("id", userIds);

			const userMap = new Map((usersData || []).map((u) => [u.id, u]));

			const projectsWithUsers: Project[] = projectsData.map((project) => ({
				...project,
				user: userMap.get(project.user_id),
			}));

			setProjects(projectsWithUsers);
			setFilteredProjects(projectsWithUsers);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const filterProjects = () => {
		let filtered = [...projects];
		if (searchTerm) {
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (statusFilter !== "all") {
			filtered = filtered.filter((p) => p.status === statusFilter);
		}
		setFilteredProjects(filtered);
	};

	const handleApprove = (project: Project) => {
		setSelectedProject(project);
		setPendingAction("approve");
		setApproveModal(true);
	};

	const handleReject = (project: Project) => {
		setSelectedProject(project);
		setPendingAction("reject");
		setRejectModal(true);
	};

	const updateProjectStatus = async (projectId: string, newStatus: string) => {
		if (updatingProjectId === projectId) return;

		try {
			setUpdatingProjectId(projectId);
			const { error } = await supabase
				.from("projects")
				.update({
					status: newStatus,
					updated_at: new Date().toISOString(),
				})
				.eq("id", projectId);

			if (error) throw error;

			toast.success(`Project ${newStatus === "approved" ? "approved" : "rejected"} successfully!`);
			setApproveModal(false);
			setRejectModal(false);
			setSelectedProject(null);
			setPendingAction(null);
			await loadProjects();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setUpdatingProjectId(null);
		}
	};

	const handleConfirmAction = () => {
		if (!selectedProject || !pendingAction) return;
		const newStatus = pendingAction === "approve" ? "approved" : "rejected";
		updateProjectStatus(selectedProject.id, newStatus);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return <Badge className="bg-success">Approved</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			case "rejected":
				return <Badge className="bg-danger">Rejected</Badge>;
			case "active":
				return <Badge className="bg-info">Active</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Manage Projects" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={6} rows={8} />
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
				<BreadCrumb title="Manage Projects" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">Projects Management</h4>
								<div className="d-flex gap-2">
									<Input
										type="text"
										placeholder="Search projects..."
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
										<option value="active">Active</option>
									</Input>
								</div>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>Project Title</th>
												<th>User</th>
												<th>Category</th>
												<th>Status</th>
												<th>Created</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredProjects.length === 0 ? (
												<tr>
													<td colSpan={6} className="text-center py-4">
														<p className="text-muted mb-0">No projects found</p>
													</td>
												</tr>
											) : (
												filteredProjects.map((project) => (
													<tr key={project.id}>
														<td>
															<div>
																<h6 className="mb-1">{project.title}</h6>
																{project.subtitle && (
																	<p className="text-muted mb-0 fs-12">{project.subtitle}</p>
																)}
															</div>
														</td>
														<td>
															<div>
																<p className="mb-0 fw-medium">{project.user?.full_name || "N/A"}</p>
																<small className="text-muted">{project.user?.personal_email || ""}</small>
															</div>
														</td>
														<td>
															<Badge className="bg-primary-subtle text-primary">{project.category || "N/A"}</Badge>
														</td>
														<td>{getStatusBadge(project.status)}</td>
														<td>
															{new Date(project.created_at).toLocaleDateString()}
														</td>
														<td>
															<UncontrolledDropdown>
																<DropdownToggle tag="button" className="btn btn-soft-secondary btn-sm">
																	<i className="ri-more-fill"></i>
																</DropdownToggle>
																<DropdownMenu>
																	<DropdownItem onClick={() => navigate(`/apps-projects-overview?id=${project.id}`)}>
																		<i className="ri-eye-line me-2"></i>View Details
																	</DropdownItem>
																	{project.status === "pending" && (
																		<>
																			<DropdownItem onClick={() => handleApprove(project)}>
																				<i className="ri-checkbox-circle-line me-2 text-success"></i>Approve
																			</DropdownItem>
																			<DropdownItem onClick={() => handleReject(project)}>
																				<i className="ri-close-circle-line me-2 text-danger"></i>Reject
																			</DropdownItem>
																		</>
																	)}
																	{project.status === "approved" && (
																		<DropdownItem onClick={() => updateProjectStatus(project.id, "active")}>
																			<i className="ri-play-circle-line me-2"></i>Activate
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
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Approve Modal */}
			<Modal isOpen={approveModal} toggle={() => setApproveModal(false)} centered>
				<ModalHeader toggle={() => setApproveModal(false)}>Approve Project</ModalHeader>
				<ModalBody>
					<p>Are you sure you want to approve the project <strong>"{selectedProject?.title}"</strong>?</p>
					<p className="text-muted">Once approved, the project will be visible in the gallery.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setApproveModal(false)}>
						Cancel
					</Button>
					<Button
						color="success"
						onClick={handleConfirmAction}
						disabled={updatingProjectId === selectedProject?.id}
					>
						{updatingProjectId === selectedProject?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Approving...
							</>
						) : (
							<>
								<i className="ri-checkbox-circle-line me-1"></i>Approve Project
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Reject Modal */}
			<Modal isOpen={rejectModal} toggle={() => setRejectModal(false)} centered>
				<ModalHeader toggle={() => setRejectModal(false)} className="text-danger">Reject Project</ModalHeader>
				<ModalBody>
					<p>Are you sure you want to reject the project <strong>"{selectedProject?.title}"</strong>?</p>
					<p className="text-muted">This action cannot be undone.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setRejectModal(false)}>
						Cancel
					</Button>
					<Button
						color="danger"
						onClick={handleConfirmAction}
						disabled={updatingProjectId === selectedProject?.id}
					>
						{updatingProjectId === selectedProject?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Rejecting...
							</>
						) : (
							<>
								<i className="ri-close-circle-line me-1"></i>Reject Project
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ManageProjects;
