import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Button,
	Badge,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	Spinner,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
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
import { getErrorMessage } from "../../../lib/errorHandler";

interface Project {
	id: string;
	user_id: string;
	title: string;
	subtitle?: string;
	description?: string;
	category?: string;
	status: string;
	cover_image_url?: string;
	image_urls?: string[];
	video_url?: string;
	video_urls?: string[];
	available_status?: boolean;
	available_label?: string;
	location?: string;
	investment_amount?: string;
	featured?: boolean;
	verified?: boolean;
	views?: number;
	likes?: number;
	admin_notes?: string;
	rejection_reason?: string;
	approved_at?: string;
	approved_by?: string;
	created_at: string;
	updated_at: string;
	user?: {
		id: string;
		full_name: string;
		personal_email: string;
		user_type: string;
		company_name?: string;
		phone?: string;
	};
}

const ProjectDetails = () => {
	document.title = "Project Details | PITCH INVEST";
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const projectId = searchParams.get("id");
	const { isAdmin, loading: adminLoading } = useAdmin();
	
	const [loading, setLoading] = useState(true);
	const [project, setProject] = useState<Project | null>(null);
	const [activeTab, setActiveTab] = useState("1");
	const [approveModal, setApproveModal] = useState(false);
	const [rejectModal, setRejectModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [adminNotes, setAdminNotes] = useState("");
	const [updating, setUpdating] = useState(false);
	const [fullImageModal, setFullImageModal] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState<string>("");
	const [mediaType, setMediaType] = useState<"image" | "video">("image");

	useEffect(() => {
		if (adminLoading) return;

		if (!isAdmin && !adminLoading) {
			navigate("/admin/dashboard", { replace: true });
			return;
		}

		if (isAdmin && projectId) {
			loadProject();
		} else if (!projectId) {
			navigate("/admin/projects");
		}
	}, [isAdmin, adminLoading, projectId, navigate]);

	const loadProject = async () => {
		try {
			setLoading(true);
			
			const { data: projectData, error } = await supabase
				.from("projects")
				.select("*")
				.eq("id", projectId)
				.single();

			if (error) throw error;

			if (projectData) {
				const { data: userData } = await supabase
					.from("users")
					.select("id, full_name, personal_email, user_type, company_name, phone")
					.eq("id", projectData.user_id)
					.single();

				setProject({
					...projectData,
					user: userData,
				});
				setAdminNotes(projectData.admin_notes || "");
			}
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
			navigate("/admin/projects");
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async () => {
		if (!project) return;

		try {
			setUpdating(true);
			const { data: { user } } = await supabase.auth.getUser();
			
			const { error } = await supabase
				.from("projects")
				.update({
					status: "approved",
					approved_at: new Date().toISOString(),
					approved_by: user?.id,
					admin_notes: adminNotes,
					rejection_reason: null,
				})
				.eq("id", project.id);

			if (error) throw error;

			showToast.success("Project approved successfully!");
			setApproveModal(false);
			await loadProject();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setUpdating(false);
		}
	};

	const handleReject = async () => {
		if (!project || !rejectionReason.trim()) {
			showToast.warning("Please provide a rejection reason");
			return;
		}

		try {
			setUpdating(true);
			
			const { error } = await supabase
				.from("projects")
				.update({
					status: "rejected",
					rejection_reason: rejectionReason,
					admin_notes: adminNotes,
					approved_at: null,
					approved_by: null,
				})
				.eq("id", project.id);

			if (error) throw error;

			showToast.success("Project rejected successfully!");
			setRejectModal(false);
			setRejectionReason("");
			await loadProject();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setUpdating(false);
		}
	};

	const updateStatus = async (newStatus: string) => {
		if (!project) return;

		try {
			setUpdating(true);
			
			const { error } = await supabase
				.from("projects")
				.update({ status: newStatus })
				.eq("id", project.id);

			if (error) throw error;

			showToast.success(`Project status updated to ${newStatus}`);
			await loadProject();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setUpdating(false);
		}
	};

	const toggleFeatured = async () => {
		if (!project) return;

		try {
			const { error } = await supabase
				.from("projects")
				.update({ featured: !project.featured })
				.eq("id", project.id);

			if (error) throw error;

			showToast.success(project.featured ? "Removed from featured" : "Added to featured");
			await loadProject();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		}
	};

	const viewMedia = (url: string, type: "image" | "video") => {
		setSelectedMedia(url);
		setMediaType(type);
		setFullImageModal(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return <Badge className="bg-success-subtle text-success fs-11">Approved</Badge>;
			case "pending":
				return <Badge className="bg-warning-subtle text-warning fs-11">Pending</Badge>;
			case "rejected":
				return <Badge className="bg-danger-subtle text-danger fs-11">Rejected</Badge>;
			case "active":
				return <Badge className="bg-info-subtle text-info fs-11">Active</Badge>;
			default:
				return <Badge className="bg-secondary-subtle text-secondary fs-11">{status}</Badge>;
		}
	};

	if (adminLoading || loading) {
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

	if (!project) {
		return null;
	}

	const allImages = [
		...(project.cover_image_url ? [project.cover_image_url] : []),
		...(project.image_urls || []),
	];

	const allVideos = [
		...(project.video_url ? [project.video_url] : []),
		...(project.video_urls || []),
	];

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb 
					title="Project Details" 
					pageTitle="Projects Management"
					showBackButton
					backPath="/admin/projects"
				/>

				{/* Header Card with Actions */}
				<Row>
					<Col lg={12}>
						<Card className="mb-3">
							<CardBody>
								<div className="d-flex align-items-start">
									<div className="flex-shrink-0">
										{project.cover_image_url ? (
											<img
												src={project.cover_image_url}
												alt={project.title}
												className="avatar-xl rounded"
												style={{ objectFit: "cover", width: "96px", height: "96px" }}
											/>
										) : (
											<div 
												className="avatar-xl rounded bg-light d-flex align-items-center justify-content-center"
												style={{ width: "96px", height: "96px" }}
											>
												<i className="ri-image-line fs-24 text-muted"></i>
											</div>
										)}
									</div>
									<div className="flex-grow-1 ms-3">
										<div className="d-flex justify-content-between align-items-start">
											<div>
												<h4 className="mb-1">{project.title}</h4>
												{project.subtitle && (
													<p className="text-muted mb-2">{project.subtitle}</p>
												)}
												<div className="d-flex gap-2 flex-wrap">
													{getStatusBadge(project.status)}
													{project.featured && (
														<Badge className="bg-primary-subtle text-primary fs-11">
															<i className="ri-star-fill me-1"></i>Featured
														</Badge>
													)}
													{project.verified && (
														<Badge className="bg-success-subtle text-success fs-11">
															<i className="ri-verified-badge-fill me-1"></i>Verified
														</Badge>
													)}
													{project.category && (
														<Badge className="bg-secondary-subtle text-secondary fs-11">
															{project.category}
														</Badge>
													)}
												</div>
											</div>
											<UncontrolledDropdown>
												<DropdownToggle tag="button" className="btn btn-soft-secondary btn-sm">
													<i className="ri-more-fill"></i>
												</DropdownToggle>
												<DropdownMenu end>
													{project.status === "pending" && (
														<>
															<DropdownItem onClick={() => setApproveModal(true)}>
																<i className="ri-checkbox-circle-line text-success me-2"></i>
																Approve Project
															</DropdownItem>
															<DropdownItem onClick={() => setRejectModal(true)}>
																<i className="ri-close-circle-line text-danger me-2"></i>
																Reject Project
															</DropdownItem>
															<DropdownItem divider />
														</>
													)}
													{project.status === "approved" && (
														<DropdownItem onClick={() => updateStatus("active")}>
															<i className="ri-play-circle-line text-info me-2"></i>
															Set Active
														</DropdownItem>
													)}
													{project.status === "active" && (
														<DropdownItem onClick={() => updateStatus("approved")}>
															<i className="ri-pause-circle-line me-2"></i>
															Deactivate
														</DropdownItem>
													)}
													{project.status === "rejected" && (
														<DropdownItem onClick={() => updateStatus("pending")}>
															<i className="ri-restart-line text-warning me-2"></i>
															Reset to Pending
														</DropdownItem>
													)}
													<DropdownItem divider />
													<DropdownItem onClick={toggleFeatured}>
														<i className={`ri-star-${project.featured ? 'fill' : 'line'} text-primary me-2`}></i>
														{project.featured ? 'Remove from' : 'Add to'} Featured
													</DropdownItem>
													<DropdownItem onClick={() => navigate(`/admin/projects?edit=${project.id}`)}>
														<i className="ri-edit-line me-2"></i>
														Edit Project
													</DropdownItem>
												</DropdownMenu>
											</UncontrolledDropdown>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Tabs */}
				<Row>
					<Col lg={12}>
						<Card>
							<CardHeader>
								<Nav className="nav-tabs-custom card-header-tabs border-bottom-0" role="tablist">
									<NavItem>
										<NavLink
											className={classnames({ active: activeTab === "1" })}
											onClick={() => setActiveTab("1")}
											type="button"
										>
											<i className="ri-information-line me-1"></i>
											Overview
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											className={classnames({ active: activeTab === "2" })}
											onClick={() => setActiveTab("2")}
											type="button"
										>
											<i className="ri-image-2-line me-1"></i>
											Media ({allImages.length} Images, {allVideos.length} Videos)
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											className={classnames({ active: activeTab === "3" })}
											onClick={() => setActiveTab("3")}
											type="button"
										>
											<i className="ri-user-line me-1"></i>
											Creator Info
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											className={classnames({ active: activeTab === "4" })}
											onClick={() => setActiveTab("4")}
											type="button"
										>
											<i className="ri-file-text-line me-1"></i>
											Admin Notes
										</NavLink>
									</NavItem>
								</Nav>
							</CardHeader>
							<CardBody>
								<TabContent activeTab={activeTab}>
									{/* Overview Tab */}
									<TabPane tabId="1">
										<Row>
											<Col lg={8}>
												<div className="mb-4">
													<h5 className="mb-3">Description</h5>
													<p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
														{project.description || "No description provided"}
													</p>
												</div>

												<div className="mb-4">
													<h5 className="mb-3">Project Details</h5>
													<div className="table-responsive">
														<table className="table table-borderless mb-0">
															<tbody>
																<tr>
																	<td className="fw-medium" style={{ width: "200px" }}>
																		Category:
																	</td>
																	<td>{project.category || "N/A"}</td>
																</tr>
																<tr>
																	<td className="fw-medium">Location:</td>
																	<td>{project.location || "N/A"}</td>
																</tr>
																<tr>
																	<td className="fw-medium">Investment Amount:</td>
																	<td className="text-success fw-semibold">
																		{project.investment_amount || "N/A"}
																	</td>
																</tr>
																<tr>
																	<td className="fw-medium">Available Status:</td>
																	<td>
																		{project.available_status ? (
																			<Badge className="bg-success-subtle text-success">
																				{project.available_label || "Available"}
																			</Badge>
																		) : (
																			<Badge className="bg-danger-subtle text-danger">
																				Not Available
																			</Badge>
																		)}
																	</td>
																</tr>
																<tr>
																	<td className="fw-medium">Created:</td>
																	<td>{new Date(project.created_at).toLocaleString()}</td>
																</tr>
																<tr>
																	<td className="fw-medium">Last Updated:</td>
																	<td>{new Date(project.updated_at).toLocaleString()}</td>
																</tr>
																{project.approved_at && (
																	<tr>
																		<td className="fw-medium">Approved:</td>
																		<td>{new Date(project.approved_at).toLocaleString()}</td>
																	</tr>
																)}
															</tbody>
														</table>
													</div>
												</div>
											</Col>

											<Col lg={4}>
												<Card className="border">
													<CardHeader className="bg-light">
														<h6 className="mb-0">Statistics</h6>
													</CardHeader>
													<CardBody>
														<div className="d-flex align-items-center mb-3">
															<div className="flex-shrink-0">
																<div className="avatar-xs">
																	<div className="avatar-title bg-primary-subtle text-primary rounded-circle">
																		<i className="ri-eye-line"></i>
																	</div>
																</div>
															</div>
															<div className="flex-grow-1 ms-3">
																<p className="text-muted mb-1">Total Views</p>
																<h5 className="mb-0">{project.views || 0}</h5>
															</div>
														</div>

														<div className="d-flex align-items-center mb-3">
															<div className="flex-shrink-0">
																<div className="avatar-xs">
																	<div className="avatar-title bg-danger-subtle text-danger rounded-circle">
																		<i className="ri-heart-line"></i>
																	</div>
																</div>
															</div>
															<div className="flex-grow-1 ms-3">
																<p className="text-muted mb-1">Total Likes</p>
																<h5 className="mb-0">{project.likes || 0}</h5>
															</div>
														</div>

														<div className="d-flex align-items-center">
															<div className="flex-shrink-0">
																<div className="avatar-xs">
																	<div className="avatar-title bg-success-subtle text-success rounded-circle">
																		<i className="ri-image-2-line"></i>
																	</div>
																</div>
															</div>
															<div className="flex-grow-1 ms-3">
																<p className="text-muted mb-1">Media Files</p>
																<h5 className="mb-0">{allImages.length + allVideos.length}</h5>
															</div>
														</div>
													</CardBody>
												</Card>

												{project.rejection_reason && (
													<Card className="border border-danger">
														<CardHeader className="bg-danger-subtle">
															<h6 className="mb-0 text-danger">
																<i className="ri-error-warning-line me-1"></i>
																Rejection Reason
															</h6>
														</CardHeader>
														<CardBody>
															<p className="mb-0">{project.rejection_reason}</p>
														</CardBody>
													</Card>
												)}
											</Col>
										</Row>
									</TabPane>

									{/* Media Tab */}
									<TabPane tabId="2">
										{allImages.length > 0 && (
											<div className="mb-4">
												<h5 className="mb-3">Images ({allImages.length})</h5>
												<Row className="g-3">
													{allImages.map((image, idx) => (
														<Col lg={3} md={4} sm={6} key={`image-${idx}`}>
															<div 
																className="position-relative"
																style={{ cursor: "pointer" }}
																onClick={() => viewMedia(image, "image")}
															>
																<img
																	src={image}
																	alt={`Project ${idx + 1}`}
																	className="img-fluid rounded"
																	style={{ 
																		width: "100%", 
																		height: "200px", 
																		objectFit: "cover" 
																	}}
																/>
																<div 
																	className="position-absolute top-0 end-0 m-2"
																	style={{
																		background: "rgba(0,0,0,0.6)",
																		borderRadius: "4px",
																		padding: "4px 8px",
																	}}
																>
																	<i className="ri-image-line text-white"></i>
																</div>
															</div>
														</Col>
													))}
												</Row>
											</div>
										)}

										{allVideos.length > 0 && (
											<div>
												<h5 className="mb-3">Videos ({allVideos.length})</h5>
												<Row className="g-3">
													{allVideos.map((video, idx) => (
														<Col lg={4} md={6} key={`video-${idx}`}>
															<div 
																className="position-relative"
																style={{ cursor: "pointer" }}
																onClick={() => viewMedia(video, "video")}
															>
																<video
																	src={video}
																	className="img-fluid rounded"
																	style={{ 
																		width: "100%", 
																		height: "250px", 
																		objectFit: "cover",
																		background: "#000"
																	}}
																	controls={false}
																/>
																<div 
																	className="position-absolute"
																	style={{
																		top: "50%",
																		left: "50%",
																		transform: "translate(-50%, -50%)",
																		background: "rgba(0,0,0,0.7)",
																		borderRadius: "50%",
																		width: "48px",
																		height: "48px",
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																	}}
																>
																	<i className="ri-play-fill text-white fs-24"></i>
																</div>
															</div>
														</Col>
													))}
												</Row>
											</div>
										)}

										{allImages.length === 0 && allVideos.length === 0 && (
											<div className="text-center py-5">
												<i className="ri-image-line fs-48 text-muted mb-3 d-block"></i>
												<p className="text-muted">No media files available</p>
											</div>
										)}
									</TabPane>

									{/* Creator Info Tab */}
									<TabPane tabId="3">
										<Row>
											<Col lg={8}>
												<div className="table-responsive">
													<table className="table table-borderless mb-0">
														<tbody>
															<tr>
																<td className="fw-medium" style={{ width: "200px" }}>
																	Full Name:
																</td>
																<td>{project.user?.full_name || "N/A"}</td>
															</tr>
															<tr>
																<td className="fw-medium">Email:</td>
																<td>
																	<a href={`mailto:${project.user?.personal_email}`}>
																		{project.user?.personal_email || "N/A"}
																	</a>
																</td>
															</tr>
															<tr>
																<td className="fw-medium">Phone:</td>
																<td>{project.user?.phone || "N/A"}</td>
															</tr>
															<tr>
																<td className="fw-medium">Company:</td>
																<td>{project.user?.company_name || "N/A"}</td>
															</tr>
															<tr>
																<td className="fw-medium">User Type:</td>
																<td>
																	<Badge className="bg-info-subtle text-info">
																		{project.user?.user_type || "N/A"}
																	</Badge>
																</td>
															</tr>
															<tr>
																<td className="fw-medium">User ID:</td>
																<td className="font-monospace">{project.user?.id || "N/A"}</td>
															</tr>
														</tbody>
													</table>
												</div>
												<div className="mt-4">
													<Button
														color="primary"
														outline
														onClick={() => navigate(`/admin/users?id=${project.user_id}`)}
													>
														<i className="ri-user-line me-1"></i>
														View User Profile
													</Button>
												</div>
											</Col>
										</Row>
									</TabPane>

									{/* Admin Notes Tab */}
									<TabPane tabId="4">
										<Row>
											<Col lg={8}>
												<div className="mb-3">
													<Label htmlFor="adminNotes">Admin Notes (Internal Only)</Label>
													<Input
														type="textarea"
														id="adminNotes"
														rows={8}
														value={adminNotes}
														onChange={(e) => setAdminNotes(e.target.value)}
														placeholder="Add internal notes about this project..."
													/>
												</div>
												<Button
													color="primary"
													onClick={async () => {
														try {
															const { error } = await supabase
																.from("projects")
																.update({ admin_notes: adminNotes })
																.eq("id", project.id);

															if (error) throw error;
															showToast.success("Admin notes saved");
															await loadProject();
														} catch (error: any) {
															showToast.error(getErrorMessage(error));
														}
													}}
												>
													<i className="ri-save-line me-1"></i>
													Save Notes
												</Button>
											</Col>
										</Row>
									</TabPane>
								</TabContent>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Approve Modal */}
			<Modal isOpen={approveModal} toggle={() => setApproveModal(false)} centered>
				<ModalHeader toggle={() => setApproveModal(false)}>
					Approve Project
				</ModalHeader>
				<ModalBody>
					<p>Are you sure you want to approve this project?</p>
					<p className="text-muted mb-3">
						<strong>{project.title}</strong>
					</p>
					<div className="mb-3">
						<Label>Admin Notes (Optional)</Label>
						<Input
							type="textarea"
							rows={3}
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder="Add any notes..."
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setApproveModal(false)}>
						Cancel
					</Button>
					<Button color="success" onClick={handleApprove} disabled={updating}>
						{updating ? <Spinner size="sm" className="me-2" /> : null}
						<i className="ri-checkbox-circle-line me-1"></i>
						Approve Project
					</Button>
				</ModalFooter>
			</Modal>

			{/* Reject Modal */}
			<Modal isOpen={rejectModal} toggle={() => setRejectModal(false)} centered>
				<ModalHeader toggle={() => setRejectModal(false)}>
					Reject Project
				</ModalHeader>
				<ModalBody>
					<p>Please provide a reason for rejection:</p>
					<p className="text-muted mb-3">
						<strong>{project.title}</strong>
					</p>
					<div className="mb-3">
						<Label>Rejection Reason *</Label>
						<Input
							type="textarea"
							rows={4}
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Explain why this project is being rejected..."
							required
						/>
					</div>
					<div className="mb-3">
						<Label>Admin Notes (Optional)</Label>
						<Input
							type="textarea"
							rows={2}
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder="Add any internal notes..."
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setRejectModal(false)}>
						Cancel
					</Button>
					<Button 
						color="danger" 
						onClick={handleReject} 
						disabled={updating || !rejectionReason.trim()}
					>
						{updating ? <Spinner size="sm" className="me-2" /> : null}
						<i className="ri-close-circle-line me-1"></i>
						Reject Project
					</Button>
				</ModalFooter>
			</Modal>

			{/* Full Media Modal */}
			<Modal 
				isOpen={fullImageModal} 
				toggle={() => setFullImageModal(false)} 
				size="xl"
				centered
			>
				<ModalHeader toggle={() => setFullImageModal(false)}>
					{mediaType === "image" ? "Image Preview" : "Video Preview"}
				</ModalHeader>
				<ModalBody className="p-0" style={{ backgroundColor: "#000" }}>
					{mediaType === "image" ? (
						<img
							src={selectedMedia}
							alt="Preview"
							style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
						/>
					) : (
						<video
							src={selectedMedia}
							controls
							autoPlay
							style={{ width: "100%", maxHeight: "80vh" }}
						/>
					)}
				</ModalBody>
			</Modal>
		</div>
	);
};

export default ProjectDetails;
