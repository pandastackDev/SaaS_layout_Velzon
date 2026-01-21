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
	FormGroup,
	Alert,
} from "reactstrap";
import { showToast } from "../../../lib/toast";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";
import { activityHelpers } from "../../../lib/activityTracker";

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
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
	const [approveModal, setApproveModal] = useState(false);
	const [rejectModal, setRejectModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [viewMediaModal, setViewMediaModal] = useState(false);
	const [editMediaModal, setEditMediaModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [pendingAction, setPendingAction] = useState<"approve" | "reject" | "delete" | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [adminNotes, setAdminNotes] = useState("");
	const [editedStatus, setEditedStatus] = useState("");
	const [uploadingMedia, setUploadingMedia] = useState(false);
	const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
	const [newImages, setNewImages] = useState<File[]>([]);
	const [newVideos, setNewVideos] = useState<File[]>([]);
	const [coverImagePreview, setCoverImagePreview] = useState<string>("");
	const [mediaToDelete, setMediaToDelete] = useState<{images: string[], videos: string[]}>({images: [], videos: []});

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
		setCurrentPage(1); // Reset to first page when filters change
	}, [projects, searchTerm, statusFilter]);

	const loadProjects = async () => {
		try {
			setLoading(true);
			const { data: projectsData, error} = await supabase
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
			showToast.error(errorMsg);
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
		setRejectionReason(project.rejection_reason || "");
		setPendingAction("reject");
		setRejectModal(true);
	};

	const handleEdit = (project: Project) => {
		setSelectedProject(project);
		setAdminNotes(project.admin_notes || "");
		setEditedStatus(project.status);
		setEditModal(true);
	};

	const handleViewMedia = (project: Project) => {
		setSelectedProject(project);
		setViewMediaModal(true);
	};

	const handleEditMedia = (project: Project) => {
		setSelectedProject(project);
		setNewCoverImage(null);
		setNewImages([]);
		setNewVideos([]);
		setCoverImagePreview("");
		setMediaToDelete({images: [], videos: []});
		setEditMediaModal(true);
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setNewCoverImage(file);
			const reader = new FileReader();
			reader.onloadend = () => setCoverImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setNewImages(prev => [...prev, ...files]);
	};

	const handleVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setNewVideos(prev => [...prev, ...files]);
	};

	const toggleMediaDelete = (url: string, type: 'image' | 'video') => {
		setMediaToDelete(prev => ({
			...prev,
			[type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].includes(url)
				? prev[type === 'image' ? 'images' : 'videos'].filter(u => u !== url)
				: [...prev[type === 'image' ? 'images' : 'videos'], url]
		}));
	};

	const handleSaveMedia = async () => {
		if (!selectedProject) return;

		try {
			setUploadingMedia(true);
			const updates: any = {};

			// Upload new cover image
			if (newCoverImage) {
				const fileExt = newCoverImage.name.split('.').pop();
				const fileName = `${selectedProject.id}-cover-${Date.now()}.${fileExt}`;
				const { data, error } = await supabase.storage
					.from('projects')
					.upload(fileName, newCoverImage);

				if (error) throw error;
				const { data: { publicUrl } } = supabase.storage
					.from('projects')
					.getPublicUrl(fileName);
				updates.cover_image_url = publicUrl;
			}

			// Upload new images
			if (newImages.length > 0) {
				const currentImages = selectedProject.image_urls || [];
				const uploadedUrls: string[] = [];
				
				for (const file of newImages) {
					const fileExt = file.name.split('.').pop();
					const fileName = `${selectedProject.id}-image-${Date.now()}-${Math.random()}.${fileExt}`;
					const { data, error } = await supabase.storage
						.from('projects')
						.upload(fileName, file);

					if (error) throw error;
					const { data: { publicUrl } } = supabase.storage
						.from('projects')
						.getPublicUrl(fileName);
					uploadedUrls.push(publicUrl);
				}
				
				const filteredImages = currentImages.filter(url => !mediaToDelete.images.includes(url));
				updates.image_urls = [...filteredImages, ...uploadedUrls];
			} else if (mediaToDelete.images.length > 0) {
				const currentImages = selectedProject.image_urls || [];
				updates.image_urls = currentImages.filter(url => !mediaToDelete.images.includes(url));
			}

			// Upload new videos
			if (newVideos.length > 0) {
				const currentVideos = selectedProject.video_urls || [];
				const uploadedUrls: string[] = [];
				
				for (const file of newVideos) {
					const fileExt = file.name.split('.').pop();
					const fileName = `${selectedProject.id}-video-${Date.now()}-${Math.random()}.${fileExt}`;
					const { data, error } = await supabase.storage
						.from('projects')
						.upload(fileName, file);

					if (error) throw error;
					const { data: { publicUrl } } = supabase.storage
						.from('projects')
						.getPublicUrl(fileName);
					uploadedUrls.push(publicUrl);
				}
				
				const filteredVideos = currentVideos.filter(url => !mediaToDelete.videos.includes(url));
				updates.video_urls = [...filteredVideos, ...uploadedUrls];
			} else if (mediaToDelete.videos.length > 0) {
				const currentVideos = selectedProject.video_urls || [];
				updates.video_urls = currentVideos.filter(url => !mediaToDelete.videos.includes(url));
			}

			// Update project in database
			if (Object.keys(updates).length > 0) {
				const { error } = await supabase
					.from('projects')
					.update(updates)
					.eq('id', selectedProject.id);

				if (error) throw error;

				activityHelpers.log("project_media_updated", selectedProject.id, {
					title: selectedProject.title,
					changes: Object.keys(updates)
				});

				showToast.success("Project media updated successfully!");
				setEditMediaModal(false);
				await loadProjects();
			} else {
				showToast.info("No changes to save");
			}
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to update media: ${errorMsg}`);
		} finally {
			setUploadingMedia(false);
		}
	};

	const handleDelete = (project: Project) => {
		setSelectedProject(project);
		setPendingAction("delete");
		setDeleteModal(true);
	};

	const updateProjectStatus = async (projectId: string, newStatus: string, additionalData?: any) => {
		if (updatingProjectId === projectId) return;

		try {
			setUpdatingProjectId(projectId);
			
			const updateData: any = {
				status: newStatus,
				updated_at: new Date().toISOString(),
			};

			// Add additional data if provided
			if (additionalData) {
				Object.assign(updateData, additionalData);
			}

			// Add approval metadata
			if (newStatus === "approved") {
				const { data: { user } } = await supabase.auth.getUser();
				updateData.approved_at = new Date().toISOString();
				updateData.approved_by = user?.id;
			}

			const { error } = await supabase
				.from("projects")
				.update(updateData)
				.eq("id", projectId);

			if (error) throw error;

			// Log activity
			if (selectedProject) {
				if (newStatus === "approved") {
					activityHelpers.projectApproved(selectedProject.title, projectId);
				} else if (newStatus === "rejected") {
					activityHelpers.projectRejected(selectedProject.title, projectId);
				}
			}

			showToast.success(`Project ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "updated"} successfully!`);
			setApproveModal(false);
			setRejectModal(false);
			setEditModal(false);
			setDeleteModal(false);
			setSelectedProject(null);
			setPendingAction(null);
			setRejectionReason("");
			setAdminNotes("");
			await loadProjects();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setUpdatingProjectId(null);
		}
	};

	const handleConfirmAction = () => {
		if (!selectedProject || !pendingAction) return;
		
		if (pendingAction === "approve") {
			updateProjectStatus(selectedProject.id, "approved");
		} else if (pendingAction === "reject") {
			if (!rejectionReason.trim()) {
				showToast.error("Please provide a rejection reason");
				return;
			}
			updateProjectStatus(selectedProject.id, "rejected", { 
				rejection_reason: rejectionReason 
			});
		} else if (pendingAction === "delete") {
			handleDeleteProject();
		}
	};

	const handleSaveEdit = () => {
		if (!selectedProject) return;
		updateProjectStatus(selectedProject.id, editedStatus, {
			admin_notes: adminNotes
		});
	};

	const handleDeleteProject = async () => {
		if (!selectedProject) return;
		
		try {
			setUpdatingProjectId(selectedProject.id);
			const { error } = await supabase
				.from("projects")
				.delete()
				.eq("id", selectedProject.id);

			if (error) throw error;

			activityHelpers.log("project_deleted", selectedProject.id, {
				title: selectedProject.title
			});

			showToast.success("Project deleted successfully!");
			setDeleteModal(false);
			setSelectedProject(null);
			setPendingAction(null);
			await loadProjects();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setUpdatingProjectId(null);
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

	// Calculate pagination
	const indexOfLastData = currentPage * perPageData;
	const indexOfFirstData = indexOfLastData - perPageData;
	const currentProjects = filteredProjects.slice(indexOfFirstData, indexOfLastData);

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
												<th>Image</th>
												<th>Video</th>
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
													<td colSpan={8} className="text-center py-4">
														<p className="text-muted mb-0">No projects found</p>
													</td>
												</tr>
											) : (
												currentProjects.map((project) => {
													// Separate images and videos
													const allImages = [
														...(project.cover_image_url ? [project.cover_image_url] : []),
														...(project.image_urls || []),
													];
													const allVideos = [
														...(project.video_url ? [project.video_url] : []),
														...(project.video_urls || []),
													];
													
													const hasImages = allImages.length > 0;
													const hasVideos = allVideos.length > 0;
													
													return (
													<tr key={project.id}>
														{/* Image Column */}
														<td>
															<div 
																style={{ width: "60px", height: "60px", position: "relative", cursor: hasImages ? "pointer" : "default" }}
																onClick={() => hasImages && handleViewMedia(project)}
															>
																{hasImages ? (
																	<>
																		<img
																			src={allImages[0]}
																			alt={project.title}
																			style={{
																				width: "100%",
																				height: "100%",
																				objectFit: "cover",
																				borderRadius: "4px",
																			}}
																		/>
																		{allImages.length > 1 && (
																			<div
																				style={{
																					position: "absolute",
																					bottom: "2px",
																					right: "2px",
																					backgroundColor: "rgba(0,0,0,0.7)",
																					borderRadius: "3px",
																					padding: "1px 4px",
																					fontSize: "10px",
																					color: "white",
																				}}
																			>
																				+{allImages.length - 1}
																			</div>
																		)}
																	</>
																) : (
																	<div
																		className="bg-light d-flex align-items-center justify-content-center"
																		style={{
																			width: "100%",
																			height: "100%",
																			borderRadius: "4px",
																		}}
																	>
																		<i className="ri-image-line text-muted fs-20"></i>
																	</div>
																)}
															</div>
														</td>
														{/* Video Column */}
														<td>
															<div 
																style={{ width: "60px", height: "60px", position: "relative", cursor: hasVideos ? "pointer" : "default" }}
																onClick={() => hasVideos && handleViewMedia(project)}
															>
																{hasVideos ? (
																	<>
																		<video
																			src={allVideos[0]}
																			style={{
																				width: "100%",
																				height: "100%",
																				objectFit: "cover",
																				borderRadius: "4px",
																			}}
																			controls={false}
																			muted
																			playsInline
																		/>
																		<div
																			style={{
																				position: "absolute",
																				top: "50%",
																				left: "50%",
																				transform: "translate(-50%, -50%)",
																				backgroundColor: "rgba(0,0,0,0.6)",
																				borderRadius: "50%",
																				width: "28px",
																				height: "28px",
																				display: "flex",
																				alignItems: "center",
																				justifyContent: "center",
																			}}
																		>
																			<i className="ri-play-fill text-white fs-16"></i>
																		</div>
																		{allVideos.length > 1 && (
																			<div
																				style={{
																					position: "absolute",
																					bottom: "2px",
																					right: "2px",
																					backgroundColor: "rgba(0,0,0,0.7)",
																					borderRadius: "3px",
																					padding: "1px 4px",
																					fontSize: "10px",
																					color: "white",
																				}}
																			>
																				+{allVideos.length - 1}
																			</div>
																		)}
																	</>
																) : (
																	<div
																		className="bg-light d-flex align-items-center justify-content-center"
																		style={{
																			width: "100%",
																			height: "100%",
																			borderRadius: "4px",
																		}}
																	>
																		<i className="ri-video-line text-muted fs-20"></i>
																	</div>
																)}
															</div>
														</td>
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
																	<DropdownItem onClick={() => navigate(`/admin/projects/details?id=${project.id}`)}>
																		<i className="ri-eye-line me-2"></i>View Details
																	</DropdownItem>
															{(hasImages || hasVideos) ? (
																<>
																	<DropdownItem onClick={() => handleViewMedia(project)}>
																		<i className={`${hasVideos && !hasImages ? 'ri-video-line' : 'ri-image-line'} me-2`}></i>
																		View Media ({allImages.length} Images, {allVideos.length} Videos)
																	</DropdownItem>
																	<DropdownItem onClick={() => handleEditMedia(project)}>
																		<i className="ri-edit-2-line me-2"></i>
																		Edit Media
																	</DropdownItem>
																</>
															) : (
																<DropdownItem onClick={() => handleEditMedia(project)}>
																	<i className="ri-image-add-line me-2"></i>
																	Add Media
																</DropdownItem>
															)}
																	<DropdownItem divider />
																	<DropdownItem onClick={() => handleEdit(project)}>
																		<i className="ri-edit-line me-2"></i>Edit / Add Notes
																	</DropdownItem>
																	<DropdownItem divider />
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
																		<>
																			<DropdownItem onClick={() => updateProjectStatus(project.id, "active")}>
																				<i className="ri-play-circle-line me-2 text-info"></i>Set Active
																			</DropdownItem>
																			<DropdownItem onClick={() => updateProjectStatus(project.id, "pending")}>
																				<i className="ri-time-line me-2 text-warning"></i>Set Pending
																			</DropdownItem>
																		</>
																	)}
																	{project.status === "rejected" && (
																		<DropdownItem onClick={() => updateProjectStatus(project.id, "pending")}>
																			<i className="ri-restart-line me-2 text-warning"></i>Reset to Pending
																		</DropdownItem>
																	)}
																	{project.status === "active" && (
																		<DropdownItem onClick={() => updateProjectStatus(project.id, "approved")}>
																			<i className="ri-pause-circle-line me-2"></i>Deactivate
																		</DropdownItem>
																	)}
																	<DropdownItem divider />
																	<DropdownItem onClick={() => handleDelete(project)} className="text-danger">
																		<i className="ri-delete-bin-line me-2"></i>Delete Project
																	</DropdownItem>
																</DropdownMenu>
															</UncontrolledDropdown>
														</td>
													</tr>
													);
												})
											)}
										</tbody>
									</Table>
								</div>
								{filteredProjects.length > 0 && (
									<Pagination
										data={filteredProjects}
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
				<ModalHeader toggle={() => setRejectModal(false)} className="bg-danger text-white">
					Reject Project
				</ModalHeader>
				<ModalBody>
					<Alert color="danger" className="mb-3">
						<i className="ri-error-warning-line me-2"></i>
						This project will be rejected and the user will be notified.
					</Alert>
					<p className="mb-3">
						Project: <strong>"{selectedProject?.title}"</strong>
					</p>
					<FormGroup>
						<Label for="rejectionReason">
							Rejection Reason <span className="text-danger">*</span>
						</Label>
						<Input
							type="textarea"
							id="rejectionReason"
							rows={4}
							placeholder="Explain why this project is being rejected..."
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
						/>
						<small className="text-muted">This reason will be visible to the project owner.</small>
					</FormGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setRejectModal(false)}>
						Cancel
					</Button>
					<Button
						color="danger"
						onClick={handleConfirmAction}
						disabled={updatingProjectId === selectedProject?.id || !rejectionReason.trim()}
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

			{/* Edit Project Modal */}
			<Modal isOpen={editModal} toggle={() => setEditModal(false)} centered size="lg">
				<ModalHeader toggle={() => setEditModal(false)}>
					Edit Project
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col md={6}>
							<FormGroup>
								<Label>Project Title</Label>
								<Input type="text" value={selectedProject?.title} disabled />
							</FormGroup>
						</Col>
						<Col md={6}>
							<FormGroup>
								<Label>Owner</Label>
								<Input type="text" value={selectedProject?.user?.full_name} disabled />
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col md={6}>
							<FormGroup>
								<Label>Category</Label>
								<Input type="text" value={selectedProject?.category || "N/A"} disabled />
							</FormGroup>
						</Col>
						<Col md={6}>
							<FormGroup>
								<Label for="editStatus">Status</Label>
								<Input
									type="select"
									id="editStatus"
									value={editedStatus}
									onChange={(e) => setEditedStatus(e.target.value)}
								>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="active">Active</option>
									<option value="rejected">Rejected</option>
								</Input>
							</FormGroup>
						</Col>
					</Row>
					{selectedProject?.rejection_reason && (
						<FormGroup>
							<Label className="text-danger">Previous Rejection Reason</Label>
							<div className="p-2 bg-danger-subtle rounded">
								<small>{selectedProject.rejection_reason}</small>
							</div>
						</FormGroup>
					)}
					<FormGroup>
						<Label for="adminNotes">Admin Notes (Internal)</Label>
						<Input
							type="textarea"
							id="adminNotes"
							rows={4}
							placeholder="Add internal notes about this project..."
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
						/>
						<small className="text-muted">These notes are only visible to administrators.</small>
					</FormGroup>
					{selectedProject?.admin_notes && selectedProject.admin_notes !== adminNotes && (
						<FormGroup>
							<Label className="text-muted">Previous Notes</Label>
							<div className="p-2 bg-light rounded">
								<small>{selectedProject.admin_notes}</small>
							</div>
						</FormGroup>
					)}
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditModal(false)}>
						Cancel
					</Button>
					<Button
						color="primary"
						onClick={handleSaveEdit}
						disabled={updatingProjectId === selectedProject?.id}
					>
						{updatingProjectId === selectedProject?.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								Saving...
							</>
						) : (
							<>
								<i className="ri-save-line me-1"></i>Save Changes
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* View Media Modal */}
			<Modal isOpen={viewMediaModal} toggle={() => setViewMediaModal(false)} centered size="xl">
				<ModalHeader toggle={() => setViewMediaModal(false)}>
					{selectedProject?.title} - Media Gallery
				</ModalHeader>
				<ModalBody>
					{(() => {
						const allImages = [
							...(selectedProject?.cover_image_url ? [selectedProject.cover_image_url] : []),
							...(selectedProject?.image_urls || []),
						];
						const allVideos = [
							...(selectedProject?.video_url ? [selectedProject.video_url] : []),
							...(selectedProject?.video_urls || []),
						];
						
						const hasImages = allImages.length > 0;
						const hasVideos = allVideos.length > 0;

						if (!hasImages && !hasVideos) {
							return (
								<div className="text-center py-5">
									<i className="ri-image-line text-muted" style={{ fontSize: "64px" }}></i>
									<p className="text-muted mt-3">No media available</p>
								</div>
							);
						}

						return (
							<>
								{hasImages && (
									<div className="mb-4">
										<h5 className="mb-3">
											<i className="ri-image-2-line me-2"></i>
											Images ({allImages.length})
										</h5>
										<Row className="g-3">
											{allImages.map((image, idx) => (
												<Col lg={4} md={6} key={`image-${idx}`}>
													<div className="position-relative">
														<img
															src={image}
															alt={`${selectedProject?.title} ${idx + 1}`}
															style={{
																width: "100%",
																height: "200px",
																objectFit: "cover",
																borderRadius: "8px",
																cursor: "pointer",
															}}
															onClick={() => window.open(image, '_blank')}
														/>
														<Badge
															className="position-absolute top-0 end-0 m-2"
															color="dark"
															style={{ opacity: 0.8 }}
														>
															{idx + 1} / {allImages.length}
														</Badge>
													</div>
												</Col>
											))}
										</Row>
									</div>
								)}

								{hasVideos && (
									<div>
										<h5 className="mb-3">
											<i className="ri-video-line me-2"></i>
											Videos ({allVideos.length})
										</h5>
										<Row className="g-3">
											{allVideos.map((video, idx) => (
												<Col lg={6} key={`video-${idx}`}>
													<div className="position-relative">
														<video
															src={video}
															controls
															style={{
																width: "100%",
																maxHeight: "300px",
																borderRadius: "8px",
																backgroundColor: "#000",
															}}
														/>
														<Badge
															className="position-absolute top-0 end-0 m-2"
															color="dark"
															style={{ opacity: 0.8 }}
														>
															{idx + 1} / {allVideos.length}
														</Badge>
													</div>
												</Col>
											))}
										</Row>
									</div>
								)}
							</>
						);
					})()}
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setViewMediaModal(false)}>
						Close
					</Button>
				</ModalFooter>
			</Modal>

			{/* Edit Media Modal */}
			<Modal isOpen={editMediaModal} toggle={() => setEditMediaModal(false)} centered size="xl">
				<ModalHeader toggle={() => setEditMediaModal(false)}>
					<i className="ri-image-edit-line me-2"></i>Edit Project Media - {selectedProject?.title}
				</ModalHeader>
				<ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
					{/* Current Cover Image */}
					<div className="mb-4">
						<h6 className="mb-3">Cover Image</h6>
						<Row>
							{selectedProject?.cover_image_url && (
								<Col md={6}>
									<div className="position-relative">
										<img
											src={selectedProject.cover_image_url}
											alt="Current cover"
											style={{
												width: "100%",
												height: "200px",
												objectFit: "cover",
												borderRadius: "8px",
											}}
										/>
										<Badge className="position-absolute top-0 start-0 m-2" color="info">
											Current
										</Badge>
									</div>
								</Col>
							)}
							<Col md={6}>
								<FormGroup>
									<Label>Upload New Cover Image</Label>
									<Input
										type="file"
										accept="image/*"
										onChange={handleCoverImageChange}
									/>
									{coverImagePreview && (
										<div className="mt-2">
											<img
												src={coverImagePreview}
												alt="Preview"
												style={{
													width: "100%",
													height: "150px",
													objectFit: "cover",
													borderRadius: "8px",
												}}
											/>
											<Badge color="success" className="mt-1">New Cover</Badge>
										</div>
									)}
								</FormGroup>
							</Col>
						</Row>
					</div>

					{/* Current Images */}
					{selectedProject?.image_urls && selectedProject.image_urls.length > 0 && (
						<div className="mb-4">
							<h6 className="mb-3">Current Images (Click to mark for deletion)</h6>
							<Row className="g-3">
								{selectedProject.image_urls.map((image, idx) => (
									<Col lg={3} md={4} sm={6} key={`current-image-${idx}`}>
										<div
											className="position-relative"
											style={{ cursor: 'pointer' }}
											onClick={() => toggleMediaDelete(image, 'image')}
										>
											<img
												src={image}
												alt={`Image ${idx + 1}`}
												style={{
													width: "100%",
													height: "150px",
													objectFit: "cover",
													borderRadius: "8px",
													opacity: mediaToDelete.images.includes(image) ? 0.5 : 1,
													border: mediaToDelete.images.includes(image) ? '3px solid #dc3545' : 'none'
												}}
											/>
											{mediaToDelete.images.includes(image) && (
												<Badge
													className="position-absolute top-50 start-50 translate-middle"
													color="danger"
													style={{ fontSize: '14px' }}
												>
													<i className="ri-delete-bin-line"></i> Delete
												</Badge>
											)}
										</div>
									</Col>
								))}
							</Row>
						</div>
					)}

					{/* Upload New Images */}
					<div className="mb-4">
						<FormGroup>
							<Label>
								<i className="ri-image-add-line me-2"></i>Upload New Images
							</Label>
							<Input
								type="file"
								accept="image/*"
								multiple
								onChange={handleImagesChange}
							/>
							{newImages.length > 0 && (
								<div className="mt-2">
									<Badge color="success">{newImages.length} new image(s) selected</Badge>
									<div className="d-flex gap-2 mt-2 flex-wrap">
										{newImages.map((file, idx) => (
											<Badge key={idx} color="info">{file.name}</Badge>
										))}
									</div>
								</div>
							)}
						</FormGroup>
					</div>

					{/* Current Videos */}
					{selectedProject?.video_urls && selectedProject.video_urls.length > 0 && (
						<div className="mb-4">
							<h6 className="mb-3">Current Videos (Click to mark for deletion)</h6>
							<Row className="g-3">
								{selectedProject.video_urls.map((video, idx) => (
									<Col lg={6} key={`current-video-${idx}`}>
										<div
											className="position-relative"
											style={{ cursor: 'pointer' }}
											onClick={() => toggleMediaDelete(video, 'video')}
										>
											<video
												src={video}
												style={{
													width: "100%",
													height: "200px",
													objectFit: "cover",
													borderRadius: "8px",
													opacity: mediaToDelete.videos.includes(video) ? 0.5 : 1,
													border: mediaToDelete.videos.includes(video) ? '3px solid #dc3545' : 'none'
												}}
											/>
											{mediaToDelete.videos.includes(video) && (
												<Badge
													className="position-absolute top-50 start-50 translate-middle"
													color="danger"
													style={{ fontSize: '14px' }}
												>
													<i className="ri-delete-bin-line"></i> Delete
												</Badge>
											)}
										</div>
									</Col>
								))}
							</Row>
						</div>
					)}

					{/* Upload New Videos */}
					<div className="mb-4">
						<FormGroup>
							<Label>
								<i className="ri-video-add-line me-2"></i>Upload New Videos
							</Label>
							<Input
								type="file"
								accept="video/*"
								multiple
								onChange={handleVideosChange}
							/>
							{newVideos.length > 0 && (
								<div className="mt-2">
									<Badge color="success">{newVideos.length} new video(s) selected</Badge>
									<div className="d-flex gap-2 mt-2 flex-wrap">
										{newVideos.map((file, idx) => (
											<Badge key={idx} color="info">{file.name}</Badge>
										))}
									</div>
								</div>
							)}
						</FormGroup>
					</div>

					<Alert color="info" className="mb-0">
						<i className="ri-information-line me-2"></i>
						<strong>Note:</strong> Click on existing images/videos to mark them for deletion. Upload new files to add them to the project.
					</Alert>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditMediaModal(false)}>
						Cancel
					</Button>
					<Button
						color="primary"
						onClick={handleSaveMedia}
						disabled={uploadingMedia}
					>
						{uploadingMedia ? (
							<>
								<Spinner size="sm" className="me-2" />
								Uploading...
							</>
						) : (
							<>
								<i className="ri-save-line me-1"></i>Save Changes
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} centered>
				<ModalHeader toggle={() => setDeleteModal(false)} className="bg-danger text-white">
					<i className="ri-delete-bin-line me-2"></i>Delete Project
				</ModalHeader>
				<ModalBody>
					<Alert color="danger">
						<strong>Warning:</strong> This action cannot be undone!
					</Alert>
					<p className="mb-3">
						Are you sure you want to permanently delete the project:
					</p>
					<div className="p-3 bg-light rounded">
						<h6 className="mb-1">{selectedProject?.title}</h6>
						<small className="text-muted">by {selectedProject?.user?.full_name}</small>
					</div>
					<p className="text-muted mt-3 mb-0">
						All associated data will be removed from the database.
					</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setDeleteModal(false)}>
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
								Deleting...
							</>
						) : (
							<>
								<i className="ri-delete-bin-line me-1"></i>Delete Permanently
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ManageProjects;
