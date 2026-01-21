import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
	Alert,
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Form,
	FormFeedback,
	Input,
	Label,
	Row,
	Spinner,
	Modal,
	ModalHeader,
	ModalBody,
	Progress,
} from "reactstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { supabase } from "../../lib/supabase";
import { uploadFile, base64ToFile } from "../../lib/storage";
import { getErrorMessage } from "../../lib/errorHandler";

type Step = "usertype" | "company" | "personal" | "pitch";

const Register = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isOAuthUser, setIsOAuthUser] = useState(searchParams.get("oauth") === "true");
	const [currentStep, setCurrentStep] = useState<Step>("usertype");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [otpCode, setOtpCode] = useState("");
	const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
	const [showOtpModal, setShowOtpModal] = useState(false);

	const [formData, setFormData] = useState({
		userType: "",
		companyName: "",
		projectName: "",
		projectCategory: "",
		companyNIF: "",
		companyTelephone: "",
		capitalPercentage: "",
		capitalTotalValue: "",
		licenseFee: "",
		licensingRoyaltiesPercentage: "",
		franchiseeInvestment: "",
		monthlyRoyalties: "",
		inventorName: "",
		licenseNumber: "",
		releaseDate: "",
		initialLicenseValue: "",
		exploitationLicenseRoyalty: "",
		patentSale: "",
		investorsCount: "",
		smartMoney: "",
		totalSaleOfProject: "",
		investmentPreferences: "",
		fullName: "",
		personalEmail: "",
			password: "",
		telephone: "",
		country: "",
		city: "",
		description: "",
		coverImage: "",
		coverImagePreview: "",
		photo: "",
		photoPreview: "",
		pitchVideo: "",
		factSheet: "",
		technicalSheet: "",
	});

	const [fileObjects, setFileObjects] = useState<{
		coverImage?: File;
		photo?: File;
		pitchVideo?: File;
	}>({});

	const userTypes = ["Inventor", "StartUp", "Company", "Investor"];

	const steps: { id: Step; title: string; description: string }[] = useMemo(() => {
		const all = [
			{ id: "usertype" as Step, title: "User Role", description: "Select your role" },
			{
				id: "company" as Step,
				title:
					formData.userType === "Inventor"
						? "Inventor Information"
						: formData.userType === "StartUp"
							? "Startup Information"
							: formData.userType === "Company"
								? "Company Information"
								: formData.userType === "Investor"
									? "Investor Information"
									: "Business Info",
				description:
					formData.userType === "Inventor"
						? "Tell us about your invention"
						: formData.userType === "StartUp"
							? "Tell us about your startup"
							: formData.userType === "Company"
								? "Tell us about your company"
								: formData.userType === "Investor"
									? "Tell us about your investment interests"
									: "Tell us about your business",
			},
			{ id: "personal" as Step, title: "Personal Info", description: "Tell us about yourself" },
			{
				id: "pitch" as Step,
				title: "Pitch Info",
				description: formData.userType === "Investor" ? "Complete your profile" : "Upload your pitch materials",
			},
		];

		return isOAuthUser ? all.filter((step) => step.id !== "personal") : all;
	}, [formData.userType, isOAuthUser]);

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	// Check OAuth status
	useEffect(() => {
		if (searchParams.get("oauth") === "true") {
			setIsOAuthUser(true);
			supabase.auth.getSession().then(({ data: { session } }) => {
				if (session?.user) {
					setFormData((prev) => ({
						...prev,
						fullName:
							prev.fullName ||
							session.user.user_metadata?.full_name ||
							session.user.user_metadata?.name ||
							session.user.email?.split("@")[0] ||
							"",
						personalEmail: prev.personalEmail || session.user.email || "",
					}));
				}
			});
		}
	}, [searchParams]);

	// OTP countdown
	useEffect(() => {
		if (!otpSent || otpSecondsLeft <= 0) return;
		const timer = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
		return () => clearInterval(timer);
	}, [otpSent, otpSecondsLeft]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (field === "coverImage") {
			setFileObjects((prev) => ({ ...prev, coverImage: file }));
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({ ...prev, coverImagePreview: reader.result as string }));
			};
			reader.readAsDataURL(file);
		} else if (field === "photo") {
			setFileObjects((prev) => ({ ...prev, photo: file }));
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({ ...prev, photoPreview: reader.result as string }));
			};
			reader.readAsDataURL(file);
		} else if (field === "pitchVideo") {
			setFileObjects((prev) => ({ ...prev, pitchVideo: file }));
		}
	};

	const validateStep = (): boolean => {
		setError("");

		switch (currentStep) {
			case "usertype":
				if (!formData.userType) {
					setError("Please select your role");
					return false;
				}
				return true;

			case "company":
				if (formData.userType === "Inventor" || formData.userType === "StartUp" || formData.userType === "Company") {
					if (!formData.projectName.trim()) {
						setError("Please enter your project name");
						return false;
					}
					if (!formData.projectCategory.trim()) {
						setError("Please enter project category");
						return false;
					}
				}
				if ((formData.userType === "StartUp" || formData.userType === "Company") && !formData.companyName.trim()) {
					setError("Please enter your company name");
					return false;
				}
				if (formData.userType === "Investor" && !formData.fullName.trim()) {
					setError("Please enter your full name");
					return false;
				}
				return true;

			case "personal":
				if (isOAuthUser) return true;
				if (!formData.fullName.trim()) {
					setError("Please enter your full name");
					return false;
				}
				if (!formData.personalEmail.trim()) {
					setError("Please enter your email");
					return false;
				}
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(formData.personalEmail)) {
					setError("Please enter a valid email address");
					return false;
				}
				if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
					setError("Password must be at least 6 characters long");
					return false;
				}
				return true;

			case "pitch":
				return true;

			default:
				return true;
		}
	};

	const handleNext = async () => {
		if (!validateStep()) return;

		if (currentStep === "usertype") {
			setCurrentStep("company");
		} else if (currentStep === "company") {
			setCurrentStep(isOAuthUser ? "pitch" : "personal");
		} else if (currentStep === "personal") {
			setCurrentStep("pitch");
		} else if (currentStep === "pitch") {
			if (isOAuthUser) {
				await handleOAuthRegistration();
			} else {
				setShowOtpModal(true);
				await sendOtpCode();
			}
		}
	};

	const handleBack = () => {
		setError("");
		if (currentStep === "company") {
			setCurrentStep("usertype");
		} else if (currentStep === "personal") {
			setCurrentStep("company");
		} else if (currentStep === "pitch") {
			setCurrentStep(isOAuthUser ? "company" : "personal");
		}
	};

	const sendOtpCode = async () => {
		setError("");
		setLoading(true);
		try {
			const { error: otpError } = await supabase.auth.signInWithOtp({
				email: formData.personalEmail.trim(),
				options: {
					shouldCreateUser: true,
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (otpError) throw new Error(`Failed to send verification code: ${otpError.message}`);

			setOtpSent(true);
			setOtpSecondsLeft(180);
		} catch (e: any) {
			setError(e.message || "Failed to send verification code");
			toast.error(e.message || "Failed to send verification code");
		} finally {
			setLoading(false);
		}
	};

	const verifyOtpAndRegister = async () => {
		if (otpSecondsLeft <= 0) {
			setError("Verification code expired. Please resend a new code.");
			return;
		}

		const code = otpCode.trim();
		if (!/^\d{6}$/.test(code)) {
			setError("Please enter the 6-digit verification code.");
			return;
		}

		setShowOtpModal(false);
		await handleRegistration(code);
	};

	const handleRegistration = async (verifiedCode: string) => {
		setLoading(true);
		setError("");

		try {
			// Verify OTP
			const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
				email: formData.personalEmail.trim(),
				token: verifiedCode,
				type: "email",
			});

			if (verifyError) throw new Error(`Invalid verification code: ${verifyError.message}`);
			if (!verifyData.user) throw new Error("Verification succeeded but no user data returned.");

			const userId = verifyData.user.id;

			// Update user metadata
			if (formData.password && formData.password.length >= 6) {
				await supabase.auth.updateUser({
					password: formData.password,
					data: {
						full_name: formData.fullName,
						user_type: formData.userType,
					},
				});
			} else {
				await supabase.auth.updateUser({
					data: {
						full_name: formData.fullName,
						user_type: formData.userType,
					},
				});
			}

			// Upload files
			const fileUrls: {
				coverImage?: string;
				photo?: string;
				pitchVideo?: string;
			} = {};

			if (fileObjects.coverImage) {
				const res = await uploadFile("user-files", fileObjects.coverImage, userId, "cover");
				if (res.url) fileUrls.coverImage = res.url;
			} else if (formData.coverImagePreview) {
				const file = await base64ToFile(formData.coverImagePreview, "cover.jpg");
				const res = await uploadFile("user-files", file, userId, "cover");
				if (res.url) fileUrls.coverImage = res.url;
			}

			if (fileObjects.photo) {
				const res = await uploadFile("user-files", fileObjects.photo, userId, "photos");
				if (res.url) fileUrls.photo = res.url;
			} else if (formData.photoPreview) {
				const file = await base64ToFile(formData.photoPreview, "photo.jpg");
				const res = await uploadFile("user-files", file, userId, "photos");
				if (res.url) fileUrls.photo = res.url;
			}

			if (fileObjects.pitchVideo) {
				const res = await uploadFile("user-files", fileObjects.pitchVideo, userId, "videos");
				if (res.url) fileUrls.pitchVideo = res.url;
			}

			// Create user profile
			const userData = {
				id: userId,
				user_type: formData.userType,
				full_name: formData.fullName.trim(),
				personal_email: formData.personalEmail.trim(),
				telephone: formData.telephone?.trim() || null,
				country: formData.country?.trim() || null,
				city: formData.city?.trim() || null,
				cover_image_url: fileUrls.coverImage || null,
				photo_url: fileUrls.photo || null,
				profile_status: "pending",
				company_name: formData.companyName || null,
				project_name: formData.projectName || null,
				project_category: formData.projectCategory || null,
				company_nif: formData.companyNIF || null,
				company_telephone: formData.companyTelephone || null,
				capital_percentage: formData.capitalPercentage || null,
				capital_total_value: formData.capitalTotalValue || null,
				license_fee: formData.licenseFee || null,
				licensing_royalties_percentage: formData.licensingRoyaltiesPercentage || null,
				franchisee_investment: formData.franchiseeInvestment || null,
				monthly_royalties: formData.monthlyRoyalties || null,
				inventor_name: formData.inventorName || null,
				license_number: formData.licenseNumber || null,
				release_date: formData.releaseDate || null,
				initial_license_value: formData.initialLicenseValue || null,
				exploitation_license_royalty: formData.exploitationLicenseRoyalty || null,
				patent_sale: formData.patentSale || null,
				investors_count: formData.investorsCount || null,
				smart_money: formData.smartMoney || null,
				total_sale_of_project: formData.totalSaleOfProject || null,
				investment_preferences: formData.investmentPreferences || null,
				description: formData.description || null,
				pitch_video_url: fileUrls.pitchVideo || null,
			};

			const { error: userError } = await supabase.from("users").upsert(userData, {
				onConflict: "id",
			});

			if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

			// Create project if applicable
			if (formData.userType !== "Investor" && formData.projectName?.trim()) {
				const projectData = {
					user_id: userId,
					title: formData.projectName.trim(),
					description: formData.description || null,
					status: "pending",
					category: formData.projectCategory || null,
				};

				await supabase.from("projects").insert(projectData);
			}

			toast.success("Registration successful!");
			navigate("/admin/dashboard");
		} catch (e: any) {
			const errorMsg = getErrorMessage(e);
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthRegistration = async () => {
		setLoading(true);
		setError("");

		try {
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			if (sessionError || !session?.user) {
				throw new Error("No active session. Please sign in again.");
			}

			const userId = session.user.id;
			const fallbackName =
				formData.fullName || session.user.email?.split("@")[0] || "User";

			await supabase.auth.updateUser({
				data: {
					full_name: fallbackName,
					user_type: formData.userType,
				},
			});

			// Upload files and create profile (same as regular registration)
			const fileUrls: { coverImage?: string; photo?: string; pitchVideo?: string } = {};

			if (fileObjects.coverImage) {
				const res = await uploadFile("user-files", fileObjects.coverImage, userId, "cover");
				if (res.url) fileUrls.coverImage = res.url;
			}

			if (fileObjects.photo) {
				const res = await uploadFile("user-files", fileObjects.photo, userId, "photos");
				if (res.url) fileUrls.photo = res.url;
			}

			if (fileObjects.pitchVideo) {
				const res = await uploadFile("user-files", fileObjects.pitchVideo, userId, "videos");
				if (res.url) fileUrls.pitchVideo = res.url;
			}

			const userData = {
				id: userId,
				user_type: formData.userType,
				full_name: fallbackName,
				personal_email: session.user.email || "",
				telephone: null,
				country: formData.country || null,
				city: formData.city || null,
				cover_image_url: fileUrls.coverImage || session.user.user_metadata?.avatar_url || null,
				photo_url: fileUrls.photo || session.user.user_metadata?.picture || null,
				profile_status: "pending",
				company_name: formData.companyName || null,
				project_name: formData.projectName || null,
				project_category: formData.projectCategory || null,
				company_nif: formData.companyNIF || null,
				company_telephone: formData.companyTelephone || null,
				capital_percentage: formData.capitalPercentage || null,
				capital_total_value: formData.capitalTotalValue || null,
				license_fee: formData.licenseFee || null,
				licensing_royalties_percentage: formData.licensingRoyaltiesPercentage || null,
				franchisee_investment: formData.franchiseeInvestment || null,
				monthly_royalties: formData.monthlyRoyalties || null,
				inventor_name: formData.inventorName || null,
				license_number: formData.licenseNumber || null,
				release_date: formData.releaseDate || null,
				initial_license_value: formData.initialLicenseValue || null,
				exploitation_license_royalty: formData.exploitationLicenseRoyalty || null,
				patent_sale: formData.patentSale || null,
				investors_count: formData.investorsCount || null,
				smart_money: formData.smartMoney || null,
				total_sale_of_project: formData.totalSaleOfProject || null,
				investment_preferences: formData.investmentPreferences || null,
				description: formData.description || null,
				pitch_video_url: fileUrls.pitchVideo || null,
			};

			const { error: userError } = await supabase.from("users").upsert(userData, {
				onConflict: "id",
			});

			if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

			if (formData.userType !== "Investor" && formData.projectName?.trim()) {
				const projectData = {
					user_id: userId,
					title: formData.projectName.trim(),
					description: formData.description || null,
					status: "pending",
					category: formData.projectCategory || null,
				};

				await supabase.from("projects").insert(projectData);
			}

			toast.success("Registration complete!");
			navigate("/admin/dashboard");
		} catch (e: any) {
			const errorMsg = getErrorMessage(e);
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	document.title = "Sign Up | Velzon - React Admin & Dashboard Template";

	return (
		<ParticlesAuth>
			<div className="auth-page-content mt-lg-5">
				<Container>
					<Row>
						<Col lg={12}>
							<div className="text-center mt-sm-5 mb-4 text-white-50">
								<div>
									<Link to="/" className="d-inline-block auth-logo">
										<img src={logoLight} alt="" height="20" />
									</Link>
								</div>
								<p className="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Template</p>
							</div>
						</Col>
					</Row>

					<Row className="justify-content-center">
						<Col md={10} lg={8} xl={7}>
							<Card className="mt-4">
								<CardBody className="p-4">
									{/* Progress Bar */}
									<div className="mb-4">
										<div className="d-flex justify-content-between mb-3">
											{steps.map((step, index) => (
												<div key={step.id} className="flex-fill text-center">
													<div
														className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-2 ${
															index <= currentStepIndex ? "bg-primary text-white" : "bg-light text-muted"
														}`}
														style={{ width: "40px", height: "40px" }}
													>
														{index + 1}
													</div>
													<div className="fs-12 text-muted">{step.title}</div>
												</div>
											))}
										</div>
										<Progress value={progress} color="primary" className="mb-0" />
									</div>

									<div className="text-center mb-4">
										<h5 className="text-primary">{steps[currentStepIndex].title}</h5>
										<p className="text-muted">{steps[currentStepIndex].description}</p>
									</div>

									{error && <Alert color="danger">{error}</Alert>}

									{/* Step 1: User Type */}
									{currentStep === "usertype" && (
										<div className="row g-3">
											{userTypes.map((type) => (
												<Col md={6} key={type}>
													<Card
														className={`cursor-pointer h-100 ${formData.userType === type ? "border-primary" : ""}`}
														onClick={() => {
															setFormData((prev) => ({ ...prev, userType: type }));
															setError("");
														}}
														style={{ cursor: "pointer" }}
													>
														<CardBody className="text-center">
															<h6 className="mb-0">{type}</h6>
															{formData.userType === type && (
																<i className="ri-checkbox-circle-fill text-primary fs-20 mt-2"></i>
															)}
														</CardBody>
													</Card>
												</Col>
											))}
										</div>
									)}

									{/* Step 2: Company/Business Info */}
									{currentStep === "company" && (
										<div className="row g-3">
											{(formData.userType === "StartUp" || formData.userType === "Company") && (
												<>
													<Col md={6}>
														<Label>Company Name *</Label>
														<Input
															name="companyName"
															value={formData.companyName}
															onChange={handleChange}
															placeholder="Enter company name"
														/>
													</Col>
													<Col md={6}>
														<Label>Company NIF</Label>
														<Input
															name="companyNIF"
															value={formData.companyNIF}
															onChange={handleChange}
															placeholder="Enter NIF"
														/>
													</Col>
												</>
											)}

											{(formData.userType === "Inventor" || formData.userType === "StartUp" || formData.userType === "Company") && (
												<>
													<Col md={6}>
														<Label>Project Name *</Label>
														<Input
															name="projectName"
															value={formData.projectName}
															onChange={handleChange}
															placeholder="Enter project name"
														/>
													</Col>
													<Col md={6}>
														<Label>Project Category *</Label>
														<Input
															name="projectCategory"
															value={formData.projectCategory}
															onChange={handleChange}
															placeholder="e.g., Technology, Healthcare"
														/>
													</Col>
												</>
											)}

											{formData.userType === "Inventor" && (
												<>
													<Col md={6}>
														<Label>Inventor Name</Label>
														<Input
															name="inventorName"
															value={formData.inventorName}
															onChange={handleChange}
															placeholder="Enter inventor name"
														/>
													</Col>
													<Col md={6}>
														<Label>License Number</Label>
														<Input
															name="licenseNumber"
															value={formData.licenseNumber}
															onChange={handleChange}
															placeholder="Enter license number"
														/>
													</Col>
													<Col md={6}>
														<Label>Patent Exploitation Fee</Label>
														<Input
															name="initialLicenseValue"
															value={formData.initialLicenseValue}
															onChange={handleChange}
															placeholder="e.g., $10,000"
														/>
													</Col>
													<Col md={6}>
														<Label>Full Patent Assignment (100%)</Label>
														<Input
															name="patentSale"
															value={formData.patentSale}
															onChange={handleChange}
															placeholder="e.g., $350,000"
														/>
													</Col>
												</>
											)}

											{formData.userType === "Investor" && (
												<>
													<Col md={12}>
														<Label>Full Name *</Label>
														<Input
															name="fullName"
															value={formData.fullName}
															onChange={handleChange}
															placeholder="Enter your full name"
														/>
													</Col>
													<Col md={12}>
														<Label>Investment Preferences</Label>
														<Input
															name="investmentPreferences"
															value={formData.investmentPreferences}
															onChange={handleChange}
															placeholder="Describe your investment interests"
														/>
													</Col>
												</>
											)}

											{(formData.userType === "StartUp" || formData.userType === "Company") && (
												<>
													<Col md={6}>
														<Label>Capital Percentage</Label>
														<Input
															name="capitalPercentage"
															value={formData.capitalPercentage}
															onChange={handleChange}
															placeholder="e.g., 20%"
														/>
													</Col>
													<Col md={6}>
														<Label>Capital Total Value</Label>
														<Input
															name="capitalTotalValue"
															value={formData.capitalTotalValue}
															onChange={handleChange}
															placeholder="e.g., $100,000"
														/>
													</Col>
													<Col md={6}>
														<Label>License Fee</Label>
														<Input
															name="licenseFee"
															value={formData.licenseFee}
															onChange={handleChange}
															placeholder="Enter license fee"
														/>
													</Col>
													<Col md={6}>
														<Label>Total Sale of Project</Label>
														<Input
															name="totalSaleOfProject"
															value={formData.totalSaleOfProject}
															onChange={handleChange}
															placeholder="Enter total sale amount"
														/>
													</Col>
												</>
											)}
													</div>
									)}

									{/* Step 3: Personal Info */}
									{currentStep === "personal" && !isOAuthUser && (
										<div className="row g-3">
											<Col md={12}>
												<Label>Full Name *</Label>
												<Input
													name="fullName"
													value={formData.fullName}
													onChange={handleChange}
													placeholder="Enter your full name"
												/>
											</Col>
											<Col md={6}>
												<Label>Email *</Label>
												<Input
													name="personalEmail"
													type="email"
													value={formData.personalEmail}
													onChange={handleChange}
													placeholder="Enter your email"
												/>
											</Col>
											<Col md={6}>
												<Label>Password (Optional)</Label>
												<Input
													name="password"
													type="password"
													value={formData.password}
													onChange={handleChange}
													placeholder="Enter password (optional)"
												/>
											</Col>
											<Col md={6}>
												<Label>Telephone</Label>
												<Input
													name="telephone"
													value={formData.telephone}
													onChange={handleChange}
													placeholder="Enter telephone"
												/>
											</Col>
											<Col md={6}>
												<Label>Country</Label>
												<Input
													name="country"
													value={formData.country}
													onChange={handleChange}
													placeholder="Enter country"
												/>
											</Col>
											<Col md={6}>
												<Label>City</Label>
												<Input
													name="city"
													value={formData.city}
													onChange={handleChange}
													placeholder="Enter city"
												/>
											</Col>
											</div>
									)}

									{/* Step 4: Pitch Materials */}
									{currentStep === "pitch" && (
										<div className="row g-3">
											<Col md={12}>
												<Label>Description</Label>
												<Input
													name="description"
													type="textarea"
													rows={4}
													value={formData.description}
													onChange={handleChange}
													placeholder="Describe your project or investment interests"
												/>
											</Col>
											<Col md={6}>
												<Label>Cover Image</Label>
												<Input
													type="file"
													accept="image/*"
													onChange={(e) => handleFileChange(e, "coverImage")}
												/>
												{formData.coverImagePreview && (
													<img
														src={formData.coverImagePreview}
														alt="Cover preview"
														className="mt-2"
														style={{ maxWidth: "200px", maxHeight: "200px" }}
													/>
												)}
											</Col>
											<Col md={6}>
												<Label>Profile Photo</Label>
												<Input
													type="file"
													accept="image/*"
													onChange={(e) => handleFileChange(e, "photo")}
												/>
												{formData.photoPreview && (
													<img
														src={formData.photoPreview}
														alt="Photo preview"
														className="mt-2"
														style={{ maxWidth: "200px", maxHeight: "200px" }}
													/>
												)}
											</Col>
											<Col md={12}>
												<Label>Pitch Video</Label>
												<Input
													type="file"
													accept="video/*"
													onChange={(e) => handleFileChange(e, "pitchVideo")}
												/>
											</Col>
											</div>
									)}

									{/* Navigation Buttons */}
									<div className="d-flex justify-content-between mt-4">
										<Button
											color="secondary"
											onClick={handleBack}
											disabled={currentStep === "usertype" || loading}
										>
											<i className="ri-arrow-left-line me-1"></i> Back
										</Button>
												<Button
											color="primary"
											onClick={handleNext}
											disabled={loading}
										>
											{loading ? (
												<>
													<Spinner size="sm" className="me-2" />
													Processing...
												</>
											) : currentStep === "pitch" ? (
												"Complete Registration"
											) : (
												<>
													Next <i className="ri-arrow-right-line ms-1"></i>
												</>
											)}
												</Button>
									</div>
								</CardBody>
							</Card>

							<div className="mt-4 text-center">
								<p className="mb-0">
									Already have an account ?{" "}
									<Link to="/login" className="fw-semibold text-primary text-decoration-underline">
										Sign in
									</Link>
								</p>
							</div>
						</Col>
					</Row>
				</Container>
			</div>

			{/* OTP Verification Modal */}
			<Modal isOpen={showOtpModal} toggle={() => setShowOtpModal(false)} centered>
				<ModalHeader toggle={() => setShowOtpModal(false)}>Verify Email</ModalHeader>
				<ModalBody>
					<div className="mb-3">
						<Label>Enter 6-digit code sent to {formData.personalEmail}</Label>
						<Input
							type="text"
							className="form-control text-center fs-20 fw-bold"
							placeholder="000000"
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
							maxLength={6}
							style={{ letterSpacing: "0.5rem" }}
						/>
						{otpSent && otpSecondsLeft > 0 && (
							<small className="text-muted d-block mt-2 text-center">
								Code expires in {Math.floor(otpSecondsLeft / 60)}:{(otpSecondsLeft % 60).toString().padStart(2, "0")}
							</small>
						)}
						{otpSent && otpSecondsLeft <= 0 && (
							<button
								type="button"
								className="btn btn-link p-0 mt-2 w-100"
								onClick={sendOtpCode}
							>
								Resend code
							</button>
						)}
					</div>
					<div className="d-flex gap-2">
						<Button
							color="primary"
							className="flex-fill"
							onClick={verifyOtpAndRegister}
							disabled={otpCode.length !== 6 || loading}
						>
							{loading ? (
								<>
									<Spinner size="sm" className="me-2" />
									Verifying...
								</>
							) : (
								"Verify"
							)}
						</Button>
						<Button
							color="secondary"
							onClick={() => {
								setShowOtpModal(false);
								setOtpCode("");
								setOtpSent(false);
							}}
						>
							Cancel
						</Button>
					</div>
				</ModalBody>
			</Modal>
		</ParticlesAuth>
	);
};

export default Register;
