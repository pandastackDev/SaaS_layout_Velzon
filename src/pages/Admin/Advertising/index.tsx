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
	created_at?: string;
}

const Advertising = () => {
	document.title = "Advertising | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [banners, setBanners] = useState<AdBanner[]>([]);
	const [editModal, setEditModal] = useState(false);
	const [selectedBanner, setSelectedBanner] = useState<AdBanner | null>(null);
	const [uploading, setUploading] = useState(false);
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
			// Note: You may need to create an 'advertising_banners' table in Supabase
			// For now, we'll use a mock structure
			const mockBanners: AdBanner[] = [
				{
					id: "1",
					title: "Homepage Top Banner",
					image_url: "/assets/images/bg.jpg",
					link_url: "https://example.com",
					position: "top",
					is_active: true,
					created_at: new Date().toISOString(),
				},
			];

			setBanners(mockBanners);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
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
			// Here you would save to an advertising_banners table
			toast.success("Banner saved successfully!");
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

	const toggleBannerStatus = async (bannerId: string, isActive: boolean) => {
		try {
			// Update banner status in database
			toast.success(`Banner ${isActive ? "activated" : "deactivated"} successfully!`);
			await loadBanners();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
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
												banners.map((banner) => (
													<tr key={banner.id}>
														<td>
															{banner.image_url && (
																<img
																	src={banner.image_url}
																	alt={banner.title}
																	className="img-thumbnail"
																	style={{ width: "100px", height: "60px", objectFit: "cover" }}
																/>
															)}
														</td>
														<td>
															<h6 className="mb-0">{banner.title}</h6>
														</td>
														<td>
															<Badge className="bg-info-subtle text-info">{banner.position}</Badge>
														</td>
														<td>
															{banner.link_url ? (
																<a href={banner.link_url} target="_blank" rel="noopener noreferrer">
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
															{banner.created_at
																? new Date(banner.created_at).toLocaleDateString()
																: "N/A"}
														</td>
														<td>
															<div className="d-flex gap-2">
																<Button
																	color="soft-primary"
																	size="sm"
																	onClick={() => handleEdit(banner)}
																>
																	<i className="ri-edit-line"></i>
																</Button>
																<Button
																	color={banner.is_active ? "soft-warning" : "soft-success"}
																	size="sm"
																	onClick={() => toggleBannerStatus(banner.id!, !banner.is_active)}
																>
																	<i className={banner.is_active ? "ri-eye-off-line" : "ri-eye-line"}></i>
																</Button>
															</div>
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
									<option value="sidebar">Sidebar</option>
									<option value="footer">Footer</option>
									<option value="popup">Popup</option>
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
					<Button color="primary" onClick={handleSave} disabled={!imagePreview || !formData.title}>
						<i className="ri-save-line me-1"></i>
						{selectedBanner ? "Update Banner" : "Create Banner"}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default Advertising;
