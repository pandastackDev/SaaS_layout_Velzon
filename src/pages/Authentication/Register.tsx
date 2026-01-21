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
	const [resendingOtp, setResendingOtp] = useState(false);

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
		if (!file) {
			console.log(`No file selected for ${field}`);
			return;
		}

		console.log(`File selected for ${field}:`, file.name, file.type, file.size);

		if (field === "coverImage") {
			setFileObjects((prev) => ({ ...prev, coverImage: file }));
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({ ...prev, coverImagePreview: reader.result as string }));
				console.log("Cover image preview created");
			};
			reader.readAsDataURL(file);
		} else if (field === "photo") {
			setFileObjects((prev) => ({ ...prev, photo: file }));
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({ ...prev, photoPreview: reader.result as string }));
				console.log("Photo preview created");
			};
			reader.readAsDataURL(file);
		} else if (field === "pitchVideo") {
			setFileObjects((prev) => ({ ...prev, pitchVideo: file }));
			console.log("Pitch video file stored");
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

	const sendOtpCode = async (isResend = false) => {
		setError("");
		if (isResend) {
			setResendingOtp(true);
		} else {
			setLoading(true);
		}
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
			setOtpCode("");
			if (isResend) {
				toast.success("Verification code resent successfully!");
			}
		} catch (e: any) {
			const errorMsg = e.message || "Failed to send verification code";
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			if (isResend) {
				setResendingOtp(false);
			} else {
				setLoading(false);
			}
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

		console.log("=== Starting Registration ===");
		console.log("File objects:", {
			hasCoverImage: !!fileObjects.coverImage,
			hasPhoto: !!fileObjects.photo,
			hasPitchVideo: !!fileObjects.pitchVideo,
			coverImageName: fileObjects.coverImage?.name,
			photoName: fileObjects.photo?.name,
			pitchVideoName: fileObjects.pitchVideo?.name,
		});

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

			// Set password if provided
			if (formData.password && formData.password.length >= 6) {
				await supabase.auth.updateUser({
					password: formData.password,
				});
			}

			// Upload files
			const fileUrls: {
				coverImage?: string;
				photo?: string;
				pitchVideo?: string;
			} = {};

			// Upload cover image
			if (fileObjects.coverImage) {
				console.log("Uploading cover image...", fileObjects.coverImage.name);
				const res = await uploadFile("user-files", fileObjects.coverImage, userId, "covers");
				if (res.error) {
					console.error("Cover image upload error:", res.error);
					toast.error("Failed to upload cover image");
				} else if (res.url) {
					console.log("Cover image uploaded successfully:", res.url);
					fileUrls.coverImage = res.url;
				}
			} else if (formData.coverImagePreview) {
				console.log("Converting and uploading cover image from preview...");
				const file = await base64ToFile(formData.coverImagePreview, "cover.jpg");
				const res = await uploadFile("user-files", file, userId, "covers");
				if (res.error) {
					console.error("Cover image upload error:", res.error);
				} else if (res.url) {
					console.log("Cover image uploaded successfully:", res.url);
					fileUrls.coverImage = res.url;
				}
			}

			// Upload profile photo
			if (fileObjects.photo) {
				console.log("Uploading profile photo...", fileObjects.photo.name);
				const res = await uploadFile("user-files", fileObjects.photo, userId, "photos");
				if (res.error) {
					console.error("Photo upload error:", res.error);
					toast.error("Failed to upload profile photo");
				} else if (res.url) {
					console.log("Photo uploaded successfully:", res.url);
					fileUrls.photo = res.url;
				}
			} else if (formData.photoPreview) {
				console.log("Converting and uploading photo from preview...");
				const file = await base64ToFile(formData.photoPreview, "photo.jpg");
				const res = await uploadFile("user-files", file, userId, "photos");
				if (res.error) {
					console.error("Photo upload error:", res.error);
				} else if (res.url) {
					console.log("Photo uploaded successfully:", res.url);
					fileUrls.photo = res.url;
				}
			}

			// Upload pitch video
			if (fileObjects.pitchVideo) {
				console.log("Uploading pitch video...", fileObjects.pitchVideo.name);
				const res = await uploadFile("user-files", fileObjects.pitchVideo, userId, "videos");
				if (res.error) {
					console.error("Video upload error:", res.error);
					toast.error("Failed to upload pitch video");
				} else if (res.url) {
					console.log("Video uploaded successfully:", res.url);
					fileUrls.pitchVideo = res.url;
				}
			}

			console.log("All file uploads completed. URLs:", fileUrls);

			// Store additional business data in user metadata
			const additionalMetadata = {
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
			};

			// Update user metadata with all business information
			await supabase.auth.updateUser({
				data: {
					full_name: formData.fullName,
					user_type: formData.userType,
					...additionalMetadata,
				},
			});

			// Create user profile with only existing database columns
			const userData = {
				id: userId,
				user_type: formData.userType,
				full_name: formData.fullName.trim(),
				personal_email: formData.personalEmail.trim(),
				country: formData.country?.trim() || null,
				city: formData.city?.trim() || null,
				cover_image_url: fileUrls.coverImage || null,
				photo_url: fileUrls.photo || null,
			};

			console.log("Inserting user data to database:", userData);

			const { error: userError } = await supabase.from("users").upsert(userData, {
				onConflict: "id",
			});

			if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

			// Create project if applicable
			if (formData.userType !== "Investor" && formData.projectName?.trim()) {
				// Build location string from country and city
				const locationParts = [formData.city, formData.country].filter(Boolean);
				const location = locationParts.length > 0 ? locationParts.join(", ") : null;

				// Determine investment amount based on user type
				let investmentAmount = null;
				if (formData.capitalTotalValue) {
					investmentAmount = formData.capitalTotalValue;
				} else if (formData.totalSaleOfProject) {
					investmentAmount = formData.totalSaleOfProject;
				} else if (formData.patentSale) {
					investmentAmount = formData.patentSale;
				}

				const projectData = {
					user_id: userId,
					title: formData.projectName.trim(),
					subtitle: formData.companyName || null,
					description: formData.description || null,
					status: "pending",
					category: formData.projectCategory || null,
					cover_image_url: fileUrls.coverImage || null,
					video_url: fileUrls.pitchVideo || null,
					location: location,
					investment_amount: investmentAmount,
					available_status: true,
					featured: false,
					verified: false,
				};

				console.log("Inserting project data to database:", projectData);

				const { error: projectError } = await supabase.from("projects").insert(projectData);
				if (projectError) {
					console.error("Failed to create project:", projectError);
					// Don't throw - allow registration to complete even if project creation fails
				} else {
					console.log("Project created successfully");
				}
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

			// Upload files and create profile (same as regular registration)
			const fileUrls: { coverImage?: string; photo?: string; pitchVideo?: string } = {};

			// Upload cover image
			if (fileObjects.coverImage) {
				console.log("OAuth: Uploading cover image...", fileObjects.coverImage.name);
				const res = await uploadFile("user-files", fileObjects.coverImage, userId, "covers");
				if (res.error) {
					console.error("OAuth: Cover image upload error:", res.error);
					toast.error("Failed to upload cover image");
				} else if (res.url) {
					console.log("OAuth: Cover image uploaded successfully:", res.url);
					fileUrls.coverImage = res.url;
				}
			}

			// Upload profile photo
			if (fileObjects.photo) {
				console.log("OAuth: Uploading profile photo...", fileObjects.photo.name);
				const res = await uploadFile("user-files", fileObjects.photo, userId, "photos");
				if (res.error) {
					console.error("OAuth: Photo upload error:", res.error);
					toast.error("Failed to upload profile photo");
				} else if (res.url) {
					console.log("OAuth: Photo uploaded successfully:", res.url);
					fileUrls.photo = res.url;
				}
			}

			// Upload pitch video
			if (fileObjects.pitchVideo) {
				console.log("OAuth: Uploading pitch video...", fileObjects.pitchVideo.name);
				const res = await uploadFile("user-files", fileObjects.pitchVideo, userId, "videos");
				if (res.error) {
					console.error("OAuth: Video upload error:", res.error);
					toast.error("Failed to upload pitch video");
				} else if (res.url) {
					console.log("OAuth: Video uploaded successfully:", res.url);
					fileUrls.pitchVideo = res.url;
				}
			}

			console.log("OAuth: All file uploads completed. URLs:", fileUrls);

			// Store additional business data in user metadata
			const additionalMetadata = {
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
			};

			// Update user metadata with all business information
			await supabase.auth.updateUser({
				data: {
					full_name: fallbackName,
					user_type: formData.userType,
					...additionalMetadata,
				},
			});

			const userData = {
				id: userId,
				user_type: formData.userType,
				full_name: fallbackName,
				personal_email: session.user.email || "",
				country: formData.country || null,
				city: formData.city || null,
				cover_image_url: fileUrls.coverImage || session.user.user_metadata?.avatar_url || null,
				photo_url: fileUrls.photo || session.user.user_metadata?.picture || null,
			};

			const { error: userError } = await supabase.from("users").upsert(userData, {
				onConflict: "id",
			});

			if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

			if (formData.userType !== "Investor" && formData.projectName?.trim()) {
				// Build location string from country and city
				const locationParts = [formData.city, formData.country].filter(Boolean);
				const location = locationParts.length > 0 ? locationParts.join(", ") : null;

				// Determine investment amount based on user type
				let investmentAmount = null;
				if (formData.capitalTotalValue) {
					investmentAmount = formData.capitalTotalValue;
				} else if (formData.totalSaleOfProject) {
					investmentAmount = formData.totalSaleOfProject;
				} else if (formData.patentSale) {
					investmentAmount = formData.patentSale;
				}

				const projectData = {
					user_id: userId,
					title: formData.projectName.trim(),
					subtitle: formData.companyName || null,
					description: formData.description || null,
					status: "pending",
					category: formData.projectCategory || null,
					cover_image_url: fileUrls.coverImage || null,
					video_url: fileUrls.pitchVideo || null,
					location: location,
					investment_amount: investmentAmount,
					available_status: true,
					featured: false,
					verified: false,
				};

				const { error: projectError } = await supabase.from("projects").insert(projectData);
				if (projectError) {
					console.error("Failed to create project:", projectError);
					// Don't throw - allow registration to complete even if project creation fails
				}
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
			<Modal isOpen={showOtpModal} toggle={() => setShowOtpModal(false)} centered size="md">
				<ModalHeader toggle={() => setShowOtpModal(false)} className="bg-light">
					<div className="d-flex align-items-center">
						<i className="ri-mail-check-line text-primary fs-24 me-2"></i>
						<span>Verify Your Email</span>
					</div>
				</ModalHeader>
				<ModalBody className="p-4">
					<div className="text-center mb-4">
						<p className="text-muted mb-2">
							We've sent a 6-digit verification code to
						</p>
						<p className="fw-semibold text-primary">{formData.personalEmail}</p>
					</div>

					{error && (
						<Alert color="danger" className="mb-3">
							{error}
						</Alert>
					)}

					<div className="mb-4">
						<Label className="form-label text-center w-100 mb-3">Enter Verification Code</Label>
						<Input
							type="text"
							className="form-control text-center fs-20 fw-bold"
							placeholder="000000"
							value={otpCode}
							onChange={(e) => {
								setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
								setError("");
							}}
							onKeyPress={(e) => {
								if (e.key === "Enter" && otpCode.length === 6) {
									verifyOtpAndRegister();
								}
							}}
							maxLength={6}
							style={{ letterSpacing: "1rem", fontSize: "1.75rem", padding: "1rem" }}
							autoFocus
						/>
						
						<div className="mt-3 text-center">
							{otpSent && otpSecondsLeft > 0 && (
								<div className="d-flex align-items-center justify-content-center gap-2">
									<i className="ri-time-line text-muted"></i>
									<small className="text-muted">
										Code expires in <span className="fw-semibold text-danger">
											{Math.floor(otpSecondsLeft / 60)}:{(otpSecondsLeft % 60).toString().padStart(2, "0")}
										</span>
									</small>
								</div>
							)}
						</div>
					</div>

					<div className="d-flex flex-column gap-2">
						<Button
							color="primary"
							size="lg"
							block
							onClick={verifyOtpAndRegister}
							disabled={otpCode.length !== 6 || loading || otpSecondsLeft <= 0}
						>
							{loading ? (
								<>
									<Spinner size="sm" className="me-2" />
									Verifying...
								</>
							) : (
								<>
									<i className="ri-check-line me-2"></i>
									Verify & Complete Registration
								</>
							)}
						</Button>

						<div className="text-center mt-2">
							<small className="text-muted">Didn't receive the code?</small>
							<Button
								color="link"
								size="sm"
								className="text-decoration-none p-0 ms-1"
								onClick={() => sendOtpCode(true)}
								disabled={resendingOtp || otpSecondsLeft > 120}
							>
								{resendingOtp ? (
									<>
										<Spinner size="sm" className="me-1" />
										Sending...
									</>
								) : otpSecondsLeft > 120 ? (
									`Resend in ${otpSecondsLeft - 120}s`
								) : (
									<>
										<i className="ri-refresh-line me-1"></i>
										Resend Code
									</>
								)}
							</Button>
						</div>

						<Button
							color="light"
							outline
							block
							onClick={() => {
								setShowOtpModal(false);
								setOtpCode("");
								setError("");
							}}
							disabled={loading || resendingOtp}
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
