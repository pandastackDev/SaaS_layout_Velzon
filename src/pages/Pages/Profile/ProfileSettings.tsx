import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Form,
	FormFeedback,
	Input,
	Label,
	Row,
	Spinner,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
} from "reactstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import { uploadFile, base64ToFile } from "../../../lib/storage";
import { getErrorMessage } from "../../../lib/errorHandler";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const ProfileSettings = () => {
	const navigate = useNavigate();
	const { user, profile, loading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState("1");
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [coverPreview, setCoverPreview] = useState<string | null>(null);

	// Profile Form
	const profileValidation = useFormik({
		enableReinitialize: true,
		initialValues: {
			full_name: profile?.full_name || user?.user_metadata?.full_name || "",
			personal_email: profile?.personal_email || user?.email || "",
			telephone: profile?.telephone || "",
			country: profile?.country || "",
			city: profile?.city || "",
			description: profile?.description || "",
		},
		validationSchema: Yup.object({
			full_name: Yup.string().required("Full name is required"),
			personal_email: Yup.string().email("Invalid email").required("Email is required"),
			telephone: Yup.string(),
			country: Yup.string(),
			city: Yup.string(),
		}),
		onSubmit: async (values) => {
			await updateProfile(values);
		},
	});

	// Password Form
	const passwordValidation = useFormik({
		enableReinitialize: true,
		initialValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validationSchema: Yup.object({
			currentPassword: Yup.string().required("Current password is required"),
			newPassword: Yup.string()
				.min(6, "Password must be at least 6 characters")
				.required("New password is required"),
			confirmPassword: Yup.string()
				.oneOf([Yup.ref("newPassword")], "Passwords must match")
				.required("Please confirm your password"),
		}),
		onSubmit: async (values) => {
			await changePassword(values);
		},
	});

	useEffect(() => {
		if (profile?.photo_url) {
			setPhotoPreview(profile.photo_url);
		}
		if (profile?.cover_image_url) {
			setCoverPreview(profile.cover_image_url);
		}
	}, [profile]);

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setPhotoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setCoverPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const updateProfile = async (values: any) => {
		if (!user?.id) {
			toast.error("User not authenticated");
			return;
		}

		setLoading(true);
		try {
			let photoUrl = profile?.photo_url || null;
			let coverUrl = profile?.cover_image_url || null;

			// Upload photo if changed
			if (photoPreview && photoPreview !== profile?.photo_url && photoPreview.startsWith("data:")) {
				setUploading(true);
				const file = await base64ToFile(photoPreview, "photo.jpg");
				const result = await uploadFile("user-files", file, user.id, "photos");
				if (result.url) photoUrl = result.url;
				setUploading(false);
			}

			// Upload cover if changed
			if (coverPreview && coverPreview !== profile?.cover_image_url && coverPreview.startsWith("data:")) {
				setUploading(true);
				const file = await base64ToFile(coverPreview, "cover.jpg");
				const result = await uploadFile("user-files", file, user.id, "cover");
				if (result.url) coverUrl = result.url;
				setUploading(false);
			}

			// Update user metadata
			await supabase.auth.updateUser({
				data: {
					full_name: values.full_name,
				},
			});

			// Update profile in database
			const { error } = await supabase
				.from("users")
				.update({
					full_name: values.full_name,
					personal_email: values.personal_email,
					telephone: values.telephone || null,
					country: values.country || null,
					city: values.city || null,
					description: values.description || null,
					photo_url: photoUrl,
					cover_image_url: coverUrl,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (error) throw error;

			toast.success("Profile updated successfully!");
			// Refresh page to show updated data
			window.location.reload();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
			setUploading(false);
		}
	};

	const changePassword = async (values: any) => {
		setLoading(true);
		try {
			// Verify current password by attempting to sign in
			if (user?.email) {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: user.email,
					password: values.currentPassword,
				});

				if (signInError) {
					throw new Error("Current password is incorrect");
				}
			}

			// Update password
			const { error } = await supabase.auth.updateUser({
				password: values.newPassword,
			});

			if (error) throw error;

			toast.success("Password changed successfully!");
			passwordValidation.resetForm();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const resendVerificationEmail = async () => {
		if (!user?.email) {
			toast.error("No email address found");
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.resend({
				type: "signup",
				email: user.email,
			});

			if (error) throw error;

			toast.success("Verification email sent! Please check your inbox.");
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	if (authLoading) {
		return (
			<div className="page-content">
				<Container fluid>
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
						<Spinner color="primary" />
					</div>
				</Container>
			</div>
		);
	}

	if (!user) {
		navigate("/login");
		return null;
	}

	document.title = "Profile Settings | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Profile Settings" pageTitle="Settings" />

				<Row>
					<Col lg={12}>
						<Card>
							<CardHeader>
								<h5 className="card-title mb-0">Account Settings</h5>
							</CardHeader>
							<CardBody>
								<Nav tabs className="nav-tabs-custom nav-justified">
									<NavItem>
										<NavLink
											className={activeTab === "1" ? "active" : ""}
											onClick={() => setActiveTab("1")}
											style={{ cursor: "pointer" }}
										>
											<i className="ri-user-settings-line me-1"></i> Profile
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											className={activeTab === "2" ? "active" : ""}
											onClick={() => setActiveTab("2")}
											style={{ cursor: "pointer" }}
										>
											<i className="ri-lock-password-line me-1"></i> Change Password
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											className={activeTab === "3" ? "active" : ""}
											onClick={() => setActiveTab("3")}
											style={{ cursor: "pointer" }}
										>
											<i className="ri-mail-check-line me-1"></i> Email Verification
										</NavLink>
									</NavItem>
								</Nav>

								<TabContent activeTab={activeTab} className="p-4">
									{/* Profile Tab */}
									<TabPane tabId="1">
										<Form
											onSubmit={(e) => {
												e.preventDefault();
												profileValidation.handleSubmit();
											}}
										>
											<Row>
												<Col md={12}>
													<div className="mb-3">
														<Label>Cover Image</Label>
														<div className="mb-2">
															{coverPreview && (
																<img
																	src={coverPreview}
																	alt="Cover"
																	className="img-thumbnail"
																	style={{ maxWidth: "300px", maxHeight: "150px" }}
																/>
															)}
														</div>
														<Input
															type="file"
															accept="image/*"
															onChange={handleCoverChange}
															disabled={uploading}
														/>
													</div>
												</Col>
												<Col md={12}>
													<div className="mb-3">
														<Label>Profile Photo</Label>
														<div className="mb-2">
															{photoPreview && (
																<img
																	src={photoPreview}
																	alt="Profile"
																	className="rounded-circle"
																	style={{ width: "100px", height: "100px", objectFit: "cover" }}
																/>
															)}
														</div>
														<Input
															type="file"
															accept="image/*"
															onChange={handlePhotoChange}
															disabled={uploading}
														/>
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>Full Name *</Label>
														<Input
															name="full_name"
															type="text"
															value={profileValidation.values.full_name}
															onChange={profileValidation.handleChange}
															onBlur={profileValidation.handleBlur}
															invalid={
																!!(
																	profileValidation.touched.full_name &&
																	profileValidation.errors.full_name
																)
															}
														/>
														{profileValidation.touched.full_name &&
														profileValidation.errors.full_name ? (
															<FormFeedback type="invalid">
																{profileValidation.errors.full_name}
															</FormFeedback>
														) : null}
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>Email *</Label>
														<Input
															name="personal_email"
															type="email"
															value={profileValidation.values.personal_email}
															onChange={profileValidation.handleChange}
															onBlur={profileValidation.handleBlur}
															invalid={
																!!(
																	profileValidation.touched.personal_email &&
																	profileValidation.errors.personal_email
																)
															}
															disabled
														/>
														<small className="text-muted">Email cannot be changed</small>
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>Telephone</Label>
														<Input
															name="telephone"
															type="text"
															value={profileValidation.values.telephone}
															onChange={profileValidation.handleChange}
														/>
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>Country</Label>
														<Input
															name="country"
															type="text"
															value={profileValidation.values.country}
															onChange={profileValidation.handleChange}
														/>
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>City</Label>
														<Input
															name="city"
															type="text"
															value={profileValidation.values.city}
															onChange={profileValidation.handleChange}
														/>
													</div>
												</Col>
												<Col md={12}>
													<div className="mb-3">
														<Label>Description</Label>
														<Input
															name="description"
															type="textarea"
															rows={4}
															value={profileValidation.values.description}
															onChange={profileValidation.handleChange}
														/>
													</div>
												</Col>
											</Row>
											<div className="text-end">
												<Button
													type="submit"
													color="primary"
													disabled={loading || uploading}
												>
													{loading || uploading ? (
														<>
															<Spinner size="sm" className="me-2" />
															{uploading ? "Uploading..." : "Saving..."}
														</>
													) : (
														"Update Profile"
													)}
												</Button>
											</div>
										</Form>
									</TabPane>

									{/* Change Password Tab */}
									<TabPane tabId="2">
										<Form
											onSubmit={(e) => {
												e.preventDefault();
												passwordValidation.handleSubmit();
											}}
										>
											<Row>
												<Col md={12}>
													<div className="mb-3">
														<Label>Current Password *</Label>
														<Input
															name="currentPassword"
															type="password"
															value={passwordValidation.values.currentPassword}
															onChange={passwordValidation.handleChange}
															onBlur={passwordValidation.handleBlur}
															invalid={
																!!(
																	passwordValidation.touched.currentPassword &&
																	passwordValidation.errors.currentPassword
																)
															}
														/>
														{passwordValidation.touched.currentPassword &&
														passwordValidation.errors.currentPassword ? (
															<FormFeedback type="invalid">
																{passwordValidation.errors.currentPassword}
															</FormFeedback>
														) : null}
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>New Password *</Label>
														<Input
															name="newPassword"
															type="password"
															value={passwordValidation.values.newPassword}
															onChange={passwordValidation.handleChange}
															onBlur={passwordValidation.handleBlur}
															invalid={
																!!(
																	passwordValidation.touched.newPassword &&
																	passwordValidation.errors.newPassword
																)
															}
														/>
														{passwordValidation.touched.newPassword &&
														passwordValidation.errors.newPassword ? (
															<FormFeedback type="invalid">
																{passwordValidation.errors.newPassword}
															</FormFeedback>
														) : null}
													</div>
												</Col>
												<Col md={6}>
													<div className="mb-3">
														<Label>Confirm Password *</Label>
														<Input
															name="confirmPassword"
															type="password"
															value={passwordValidation.values.confirmPassword}
															onChange={passwordValidation.handleChange}
															onBlur={passwordValidation.handleBlur}
															invalid={
																!!(
																	passwordValidation.touched.confirmPassword &&
																	passwordValidation.errors.confirmPassword
																)
															}
														/>
														{passwordValidation.touched.confirmPassword &&
														passwordValidation.errors.confirmPassword ? (
															<FormFeedback type="invalid">
																{passwordValidation.errors.confirmPassword}
															</FormFeedback>
														) : null}
													</div>
												</Col>
											</Row>
											<div className="text-end">
												<Button
													type="submit"
													color="primary"
													disabled={loading}
												>
													{loading ? (
														<>
															<Spinner size="sm" className="me-2" />
															Updating...
														</>
													) : (
														"Change Password"
													)}
												</Button>
											</div>
										</Form>
									</TabPane>

									{/* Email Verification Tab */}
									<TabPane tabId="3">
										<Row>
											<Col md={12}>
												<Alert color={user.email_confirmed_at ? "success" : "warning"}>
													<h5 className="alert-heading">
														{user.email_confirmed_at
															? "✓ Email Verified"
															: "⚠ Email Not Verified"}
													</h5>
													<p>
														{user.email_confirmed_at
															? "Your email address has been verified."
															: "Please verify your email address to access all features."}
													</p>
													{!user.email_confirmed_at && (
														<Button
															color="primary"
															onClick={resendVerificationEmail}
															disabled={loading}
														>
															{loading ? (
																<>
																	<Spinner size="sm" className="me-2" />
																	Sending...
																</>
															) : (
																"Resend Verification Email"
															)}
														</Button>
													)}
												</Alert>
											</Col>
										</Row>
									</TabPane>
								</TabContent>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ProfileSettings;
