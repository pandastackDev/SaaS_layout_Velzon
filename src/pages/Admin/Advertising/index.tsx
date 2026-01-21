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
	Input,
	Label,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	Badge,
	Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";
import { uploadFile } from "../../../lib/storage";
import { useAuth } from "../../../hooks/useAuth";

interface AdBanner {
	id?: string;
	title: string;
	image_url: string;
	link_url?: string;
	position: string;
	is_active: boolean;
	start_date?: string;
	end_date?: string;
	impressions?: number;
	clicks?: number;
	created_at?: string;
	updated_at?: string;
	created_by?: string;
}

const Advertising = () => {
	document.title = "Advertising | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [banners, setBanners] = useState<AdBanner[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [editModal, setEditModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [toggleModal, setToggleModal] = useState(false);
	const [selectedBanner, setSelectedBanner] = useState<AdBanner | null>(null);
	const [bannerToDelete, setBannerToDelete] = useState<AdBanner | null>(null);
	const [bannerToToggle, setBannerToToggle] = useState<{ banner: AdBanner; newStatus: boolean } | null>(null);
	const [uploading, setUploading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [toggling, setToggling] = useState<string | null>(null); // Track which banner is being toggled
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		link_url: "",
		position: "top",
		is_active: true,
		start_date: "",
		end_date: "",
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
			loadBanners();
		}
	}, [isAdmin, adminLoading, navigate]);

	const loadBanners = async () => {
		try {
			setLoading(true);
			
			const { data, error } = await supabase
				.from("advertising_banners")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			setBanners(data || []);
			setCurrentPage(1); // Reset to first page when data loads
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			console.error("Error loading banners:", error);
			toast.error(errorMsg);
			// Set empty array if table doesn't exist yet
			setBanners([]);
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		if (!user?.id) {
			toast.error("User not authenticated");
			return;
		}

		setUploading(true);
		try {
			const result = await uploadFile("user-files", file, user.id, "advertising");
			if (result.url) {
				setImagePreview(result.url);
				toast.success("Image uploaded successfully!");
			} else {
				throw new Error("Upload failed");
			}
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setUploading(false);
		}
	};

	const handleSave = async () => {
		try {
			if (!formData.title.trim()) {
				toast.error("Banner title is required");
				return;
			}

			// For new banners, image is required. For editing, use existing image if no new one uploaded
			if (!selectedBanner && !imagePreview) {
				toast.error("Please upload a banner image");
				return;
			}

			// Use existing image if editing and no new image was uploaded
			const finalImageUrl = imagePreview || selectedBanner?.image_url;
			if (!finalImageUrl) {
				toast.error("Banner image is required");
				return;
			}

			const bannerData = {
				title: formData.title,
				image_url: finalImageUrl,
				link_url: formData.link_url || null,
				position: formData.position,
				is_active: formData.is_active,
				start_date: formData.start_date || null,
				end_date: formData.end_date || null,
				...(selectedBanner ? {} : { created_by: user?.id }), // Only set created_by for new banners
			};

			if (selectedBanner?.id) {
				// Update existing banner
				const { error } = await supabase
					.from("advertising_banners")
					.update(bannerData)
					.eq("id", selectedBanner.id);

				if (error) throw error;
				toast.success("Banner updated successfully!");
			} else {
				// Create new banner
				const { error } = await supabase
					.from("advertising_banners")
					.insert([bannerData]);

				if (error) throw error;
				toast.success("Banner created successfully!");
			}

			setEditModal(false);
			setSelectedBanner(null);
			setImagePreview(null);
			setFormData({
				title: "",
				link_url: "",
				position: "top",
				is_active: true,
				start_date: "",
				end_date: "",
			});
			await loadBanners();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			console.error("Error saving banner:", error);
			toast.error(errorMsg);
		}
	};

	const handleEdit = (banner: AdBanner) => {
		setSelectedBanner(banner);
		setFormData({
			title: banner.title,
			link_url: banner.link_url || "",
			position: banner.position,
			is_active: banner.is_active,
			start_date: banner.start_date || "",
			end_date: banner.end_date || "",
		});
		setImagePreview(banner.image_url);
		setEditModal(true);
	};

	const handleAddNew = () => {
		setSelectedBanner(null);
		setFormData({
			title: "",
			link_url: "",
			position: "top",
			is_active: true,
			start_date: "",
			end_date: "",
		});
		setImagePreview(null);
		setEditModal(true);
	};

	const handleToggleClick = (banner: AdBanner) => {
		if (!banner.id) {
			toast.error("Banner ID is missing");
			return;
		}
		setBannerToToggle({ banner, newStatus: !banner.is_active });
		setToggleModal(true);
	};

	const toggleBannerStatus = async () => {
		if (!bannerToToggle?.banner.id) {
			toast.error("Banner ID is missing");
			setToggleModal(false);
			setBannerToToggle(null);
			return;
		}

		const { banner, newStatus } = bannerToToggle;
		const bannerId = banner.id;

		if (!isAdmin) {
			toast.error("You don't have permission to modify banners");
			setToggleModal(false);
			setBannerToToggle(null);
			return;
		}

		// Prevent double-clicks
		if (toggling === bannerId) {
			return;
		}

		try {
			setToggling(bannerId);
			console.log("Toggling banner status:", { bannerId, newStatus, isAdmin });

			const { data, error } = await supabase
				.from("advertising_banners")
				.update({ is_active: newStatus })
				.eq("id", bannerId)
				.select();

			if (error) {
				console.error("Supabase error:", error);
				// Check for common RLS/permission errors
				if (error.code === '42501' || error.message?.includes('permission')) {
					throw new Error("Permission denied. Please ensure your user has is_admin = true in the users table.");
				}
				throw error;
			}

			if (!data || data.length === 0) {
				throw new Error("No banner was updated. Check if you have permission or if the banner exists.");
			}

			console.log("Banner updated successfully:", data[0]);
			toast.success(`Banner ${newStatus ? "activated" : "deactivated"} successfully!`);
			
			// Close modal and reset state
			setToggleModal(false);
			setBannerToToggle(null);
			
			// Reload banners to reflect the change
			await loadBanners();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			console.error("Error toggling banner status:", {
				bannerId,
				newStatus,
				error,
				errorMessage: errorMsg,
				errorCode: error.code,
				errorDetails: error.details,
				errorHint: error.hint
			});
			toast.error(`Failed to ${newStatus ? "activate" : "deactivate"} banner: ${errorMsg}`);
		} finally {
			setToggling(null);
		}
	};

	const handleDeleteClick = (banner: AdBanner) => {
		setBannerToDelete(banner);
		setDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!bannerToDelete?.id) {
			toast.error("No banner selected for deletion");
			return;
		}

		try {
			setDeleting(true);
			const { error } = await supabase
				.from("advertising_banners")
				.delete()
				.eq("id", bannerToDelete.id);

			if (error) throw error;

			toast.success("Banner deleted successfully!");
			setDeleteModal(false);
			setBannerToDelete(null);
			await loadBanners();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			console.error("Error deleting banner:", error);
			toast.error(errorMsg);
		} finally {
			setDeleting(false);
		}
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Advertising" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={7} rows={5} />
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
	const currentBanners = banners.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Advertising" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">Banner Management</h4>
								<Button color="primary" onClick={handleAddNew}>
									<i className="ri-add-line me-1"></i>Add New Banner
								</Button>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>Banner</th>
												<th>Title</th>
												<th>Position</th>
												<th>Link URL</th>
												<th>Status</th>
												<th>Created</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{banners.length === 0 ? (
												<tr>
													<td colSpan={7} className="text-center py-4">
														<p className="text-muted mb-0">No banners found</p>
													</td>
												</tr>
											) : (
												currentBanners.map((banner) => (
													<tr 
														key={banner.id}
														className={!banner.is_active ? "opacity-50 bg-light" : ""}
														style={!banner.is_active ? { 
															opacity: 0.6,
															backgroundColor: '#f8f9fa',
															filter: 'grayscale(0.3)'
														} : {}}
													>
														<td>
															{banner.image_url && (
																<img
																	src={banner.image_url}
																	alt={banner.title}
																	className="img-thumbnail"
																	style={{ 
																		width: "100px", 
																		height: "60px", 
																		objectFit: "cover",
																		opacity: banner.is_active ? 1 : 0.5,
																		filter: banner.is_active ? 'none' : 'grayscale(0.5)'
																	}}
																/>
															)}
														</td>
														<td>
															<h6 
																className={`mb-0 ${!banner.is_active ? 'text-muted' : ''}`}
																style={!banner.is_active ? { 
																	textDecoration: 'line-through',
																	opacity: 0.7
																} : {}}
															>
																{banner.title}
															</h6>
														</td>
														<td>
															<Badge 
																className={banner.is_active ? "bg-info-subtle text-info" : "bg-secondary-subtle text-secondary"}
															>
																{banner.position}
															</Badge>
														</td>
														<td>
															{banner.link_url ? (
																<a 
																	href={banner.link_url} 
																	target="_blank" 
																	rel="noopener noreferrer"
																	className={!banner.is_active ? "text-muted" : ""}
																	style={!banner.is_active ? { opacity: 0.6 } : {}}
																>
																	{banner.link_url}
																</a>
															) : (
																<span className="text-muted">N/A</span>
															)}
														</td>
														<td>
															{banner.is_active ? (
																<Badge className="bg-success">Active</Badge>
															) : (
																<Badge className="bg-secondary">Inactive</Badge>
															)}
														</td>
														<td>
															<span className={!banner.is_active ? "text-muted" : ""}>
																{banner.created_at
																	? new Date(banner.created_at).toLocaleDateString()
																	: "N/A"}
															</span>
														</td>
														<td>
															<div className="d-flex gap-2">
																<Button
																	color="soft-primary"
																	size="sm"
																	onClick={() => handleEdit(banner)}
																	title="Edit Banner"
																>
																	<i className="ri-edit-line"></i>
																</Button>
																<Button
																	color={banner.is_active ? "soft-warning" : "soft-success"}
																	size="sm"
																	onClick={() => handleToggleClick(banner)}
																	disabled={!banner.id || toggling === banner.id}
																	title={banner.is_active ? "Deactivate Banner" : "Activate Banner"}
																>
																	{toggling === banner.id ? (
																		<Spinner size="sm" />
																	) : (
																		<i className={banner.is_active ? "ri-eye-off-line" : "ri-eye-line"}></i>
																	)}
																</Button>
																<Button
																	color="soft-danger"
																	size="sm"
																	onClick={() => handleDeleteClick(banner)}
																	title="Delete Banner"
																>
																	<i className="ri-delete-bin-line"></i>
																</Button>
															</div>
														</td>
													</tr>
												))
											)}
										</tbody>
									</Table>
								</div>
								{banners.length > 0 && (
									<Pagination
										data={banners}
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

			{/* Edit/Add Modal */}
			<Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg" centered>
				<ModalHeader toggle={() => setEditModal(false)}>
					{selectedBanner ? "Edit Banner" : "Add New Banner"}
				</ModalHeader>
				<ModalBody>
					<Form>
						<Row>
							<Col md={12}>
								<Label>Banner Image *</Label>
								{imagePreview && (
									<div className="mb-2">
										<img
											src={imagePreview}
											alt="Preview"
											className="img-thumbnail"
											style={{ maxWidth: "300px", maxHeight: "150px" }}
										/>
									</div>
								)}
								<Input
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									disabled={uploading}
								/>
								{uploading && (
									<div className="mt-2">
										<Spinner size="sm" className="me-2" />
										Uploading...
									</div>
								)}
							</Col>
							<Col md={12}>
								<Label>Title *</Label>
								<Input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Enter banner title"
								/>
							</Col>
							<Col md={6}>
								<Label>Position *</Label>
								<Input
									type="select"
									value={formData.position}
									onChange={(e) => setFormData({ ...formData, position: e.target.value })}
								>
									<option value="top">Top</option>
									<option value="homepage-hero">Homepage Hero</option>
									<option value="sidebar">Sidebar</option>
									<option value="middle">Middle</option>
									<option value="bottom">Bottom</option>
									<option value="footer">Footer</option>
								</Input>
							</Col>
							<Col md={6}>
								<Label>Status</Label>
								<Input
									type="select"
									value={formData.is_active ? "active" : "inactive"}
									onChange={(e) =>
										setFormData({ ...formData, is_active: e.target.value === "active" })
									}
								>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
								</Input>
							</Col>
							<Col md={12}>
								<Label>Link URL</Label>
								<Input
									type="url"
									value={formData.link_url}
									onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
									placeholder="https://example.com"
								/>
							</Col>
							<Col md={6}>
								<Label>Start Date</Label>
								<Input
									type="date"
									value={formData.start_date}
									onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
								/>
							</Col>
							<Col md={6}>
								<Label>End Date</Label>
								<Input
									type="date"
									value={formData.end_date}
									onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
								/>
							</Col>
						</Row>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditModal(false)}>
						Cancel
					</Button>
					<Button 
						color="primary" 
						onClick={handleSave} 
						disabled={(!imagePreview && !selectedBanner) || !formData.title.trim()}
					>
						<i className="ri-save-line me-1"></i>
						{selectedBanner ? "Update Banner" : "Create Banner"}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Toggle Status Confirmation Modal */}
			<Modal isOpen={toggleModal} toggle={() => { setToggleModal(false); setBannerToToggle(null); }} centered>
				<ModalHeader toggle={() => { setToggleModal(false); setBannerToToggle(null); }}>
					{bannerToToggle?.newStatus ? "Activate Banner" : "Deactivate Banner"}
				</ModalHeader>
				<ModalBody>
					<p>
						Are you sure you want to <strong>{bannerToToggle?.newStatus ? "activate" : "deactivate"}</strong> this banner?
					</p>
					{bannerToToggle?.banner && (
						<div className="mt-3 p-3 bg-light rounded">
							<strong>Title:</strong> {bannerToToggle.banner.title}
							<br />
							<strong>Position:</strong> {bannerToToggle.banner.position}
							<br />
							<strong>Current Status:</strong>{" "}
							<Badge className={bannerToToggle.banner.is_active ? "bg-success" : "bg-secondary"}>
								{bannerToToggle.banner.is_active ? "Active" : "Inactive"}
							</Badge>
							{" → "}
							<Badge className={bannerToToggle.newStatus ? "bg-success" : "bg-secondary"}>
								{bannerToToggle.newStatus ? "Active" : "Inactive"}
							</Badge>
						</div>
					)}
					{bannerToToggle && !bannerToToggle.newStatus && (
						<p className="text-warning mt-3 mb-0">
							<small>
								<i className="ri-alert-line me-1"></i>
								This banner will be hidden from public view.
							</small>
						</p>
					)}
				</ModalBody>
				<ModalFooter>
					<Button 
						color="secondary" 
						onClick={() => { setToggleModal(false); setBannerToToggle(null); }} 
						disabled={toggling === bannerToToggle?.banner.id}
					>
						Cancel
					</Button>
					<Button 
						color={bannerToToggle?.newStatus ? "success" : "warning"} 
						onClick={toggleBannerStatus} 
						disabled={toggling === bannerToToggle?.banner.id}
					>
						{toggling === bannerToToggle?.banner.id ? (
							<>
								<Spinner size="sm" className="me-2" />
								{bannerToToggle?.newStatus ? "Activating..." : "Deactivating..."}
							</>
						) : (
							<>
								<i className={bannerToToggle?.newStatus ? "ri-eye-line me-1" : "ri-eye-off-line me-1"}></i>
								{bannerToToggle?.newStatus ? "Activate Banner" : "Deactivate Banner"}
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} centered>
				<ModalHeader toggle={() => setDeleteModal(false)}>
					Confirm Delete
				</ModalHeader>
				<ModalBody>
					<p>Are you sure you want to delete this banner?</p>
					{bannerToDelete && (
						<div className="mt-3 p-3 bg-light rounded">
							<strong>Title:</strong> {bannerToDelete.title}
							<br />
							<strong>Position:</strong> {bannerToDelete.position}
							<br />
							<strong>Status:</strong>{" "}
							<Badge className={bannerToDelete.is_active ? "bg-success" : "bg-secondary"}>
								{bannerToDelete.is_active ? "Active" : "Inactive"}
							</Badge>
						</div>
					)}
					<p className="text-danger mt-3 mb-0">
						<small>
							<i className="ri-alert-line me-1"></i>
							This action cannot be undone.
						</small>
					</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>
						Cancel
					</Button>
					<Button color="danger" onClick={handleDeleteConfirm} disabled={deleting}>
						{deleting ? (
							<>
								<Spinner size="sm" className="me-2" />
								Deleting...
							</>
						) : (
							<>
								<i className="ri-delete-bin-line me-1"></i>
								Delete Banner
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default Advertising;
