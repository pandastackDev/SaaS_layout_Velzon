import { useFormik } from "formik";
import { useEffect, useState } from "react";
//redux
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
} from "reactstrap";
import { createSelector } from "reselect";
// Formik validation
import * as Yup from "yup";
import { showToast } from "../../lib/toast";
import logoLight from "../../assets/images/main-logo/logo.png";
import withRouter from "../../Components/Common/withRouter";
// actions
import { loginUser, resetLoginFlag, socialLogin } from "../../slices/thunks";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { supabase } from "../../lib/supabase";
import { getErrorMessage } from "../../lib/errorHandler";

//import images

const Login = (props: any) => {
	const dispatch: any = useDispatch();
	const navigate = useNavigate();

	const selectLayoutState = (state: any) => state;
	const loginpageData = createSelector(selectLayoutState, (state) => ({
		user: state.Account.user,
		error: state.Login.error,
		loading: state.Login.loading,
		errorMsg: state.Login.errorMsg,
	}));
	// Inside your component
	const { user, error, loading, errorMsg } = useSelector(loginpageData);

	const [userLogin, setUserLogin] = useState<any>([]);
	const [passwordShow, setPasswordShow] = useState<boolean>(false);
	const [supabaseLoading, setSupabaseLoading] = useState<boolean>(false);
	const [useSupabase, setUseSupabase] = useState<boolean>(false);
	const [otpMode, setOtpMode] = useState<boolean>(false);
	const [otpSent, setOtpSent] = useState<boolean>(false);
	const [otpCode, setOtpCode] = useState<string>("");
	const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
	const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(0);

	// Check if Supabase is configured
	useEffect(() => {
		const hasSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
		setUseSupabase(!!hasSupabase);
	}, []);

	useEffect(() => {
		if (user && user) {
			const updatedUserData =
				import.meta.env.VITE_APP_DEFAULTAUTH === "firebase"
					? user.multiFactor.user.email
					: user.email;
			const updatedUserPassword =
				import.meta.env.VITE_APP_DEFAULTAUTH === "firebase"
					? ""
					: user.confirm_password;
			setUserLogin({
				email: updatedUserData,
				password: updatedUserPassword,
			});
		}
	}, [user]);

	const validation: any = useFormik({
		// enableReinitialize : use this flag when initial values needs to be changed
		enableReinitialize: true,

		initialValues: {
			email: userLogin.email || "admin@themesbrand.com" || "",
			password: userLogin.password || "123456" || "",
		},
		validationSchema: Yup.object({
			email: Yup.string().required("Please Enter Your Email"),
			password: Yup.string().when([], {
				is: () => !otpMode,
				then: (schema) => schema.required("Please Enter Your Password"),
				otherwise: (schema) => schema,
			}),
		}),
		onSubmit: async (values) => {
			if (useSupabase && !otpMode) {
				// Use Supabase authentication
				await handleSupabaseLogin(values);
			} else if (useSupabase && otpMode) {
				// OTP mode - send OTP
				await handleSendOtp(values.email);
			} else {
				// Fallback to Redux thunk (mock auth)
				dispatch(loginUser(values, props.router.navigate));
			}
		},
	});

	// Supabase login handler
	const handleSupabaseLogin = async (values: { email: string; password: string }) => {
		setSupabaseLoading(true);
		try {
			const { data, error: signInError } = await supabase.auth.signInWithPassword({
				email: values.email.trim(),
				password: values.password,
			});

			if (signInError) {
				const errorMsg = getErrorMessage(signInError);
				dispatch({ type: "login/apiError", payload: { message: errorMsg } });
				showToast.error(errorMsg);
				return;
			}

			// Check if email is verified
			if (!data.user.email_confirmed_at) {
				const errorMsg = "Please verify your email address before signing in. Check your inbox for the verification link.";
				dispatch({ type: "login/apiError", payload: { message: errorMsg } });
				showToast.warning(errorMsg);
				return;
			}

			if (!data.session || !data.user) {
				dispatch({ type: "login/apiError", payload: { message: "No session or user data returned" } });
				return;
			}

			// Store user in sessionStorage for Redux compatibility
			const userData = {
				email: data.user.email || "",
				username: data.user.email?.split("@")[0] || "user",
				first_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
				token: data.session.access_token,
			};

			sessionStorage.setItem("authUser", JSON.stringify(userData));
			dispatch({ type: "login/loginSuccess", payload: userData });
			
			showToast.success("Login successful!");
			navigate("/admin/dashboard");
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			dispatch({ type: "login/apiError", payload: { message: errorMsg } });
			showToast.error(errorMsg);
		} finally {
			setSupabaseLoading(false);
		}
	};

	// Send OTP handler
	const handleSendOtp = async (email: string) => {
		setSupabaseLoading(true);
		try {
			const { error: otpError } = await supabase.auth.signInWithOtp({
				email: email.trim(),
				options: { shouldCreateUser: false },
			});

			if (otpError) {
				dispatch({ type: "login/apiError", payload: { message: otpError.message } });
				return;
			}

			setOtpSent(true);
			setOtpSecondsLeft(180);
			setShowOtpModal(true);
			showToast.success("Verification code sent to your email");
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			dispatch({ type: "login/apiError", payload: { message: errorMsg } });
			showToast.error(errorMsg);
		} finally {
			setSupabaseLoading(false);
		}
	};

	// Verify OTP handler
	const handleVerifyOtp = async () => {
		if (otpSecondsLeft <= 0) {
			dispatch({ type: "login/apiError", payload: { message: "Code expired. Please resend." } });
			return;
		}

		const code = otpCode.trim();
		if (!/^\d{6}$/.test(code)) {
			dispatch({ type: "login/apiError", payload: { message: "Please enter a valid 6-digit code" } });
			return;
		}

		setSupabaseLoading(true);
		try {
			const { data, error: verifyError } = await supabase.auth.verifyOtp({
				email: validation.values.email.trim(),
				token: code,
				type: "email",
			});

			if (verifyError) {
				const errorMsg = getErrorMessage(verifyError);
				dispatch({ type: "login/apiError", payload: { message: errorMsg } });
				showToast.error(errorMsg);
				return;
			}

			if (!data.session || !data.user) {
				dispatch({ type: "login/apiError", payload: { message: "No session or user data returned" } });
				return;
			}

			const userData = {
				email: data.user.email || "",
				username: data.user.email?.split("@")[0] || "user",
				first_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
				token: data.session.access_token,
			};

			sessionStorage.setItem("authUser", JSON.stringify(userData));
			dispatch({ type: "login/loginSuccess", payload: userData });
			
			setShowOtpModal(false);
			showToast.success("Login successful!");
			navigate("/admin/dashboard");
		} catch (error: any) {
			dispatch({ type: "login/apiError", payload: { message: error.message || "Verification failed" } });
		} finally {
			setSupabaseLoading(false);
		}
	};

	// OAuth handlers
	const handleOAuthLogin = async (provider: "google" | "linkedin_oidc") => {
		setSupabaseLoading(true);
		try {
			const redirectTo = `${window.location.origin}/auth/callback`;
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: provider as any,
				options: {
					redirectTo,
					queryParams: provider === "google" ? {
						access_type: "offline",
						prompt: "consent",
					} : undefined,
				},
			});

			if (oauthError) {
				// Try linkedin as fallback
				if (provider === "linkedin_oidc") {
					const { error: linkedinError } = await supabase.auth.signInWithOAuth({
						provider: "linkedin" as any,
						options: { redirectTo },
					});
					if (linkedinError) {
						dispatch({ type: "login/apiError", payload: { message: linkedinError.message } });
						setSupabaseLoading(false);
					}
				} else {
					const errorMsg = getErrorMessage(oauthError);
					dispatch({ type: "login/apiError", payload: { message: errorMsg } });
					showToast.error(errorMsg);
					setSupabaseLoading(false);
				}
			}
			// Note: User will be redirected, so we don't reset loading here
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			dispatch({ type: "login/apiError", payload: { message: errorMsg } });
			showToast.error(errorMsg);
			setSupabaseLoading(false);
		}
	};

	const signIn = (type: any) => {
		if (useSupabase && (type === "google" || type === "linkedin")) {
			handleOAuthLogin(type === "google" ? "google" : "linkedin_oidc");
		} else if (type === "google" || type === "linkedin") {
			// If Supabase not configured, show error
			dispatch({ type: "login/apiError", payload: { message: "OAuth requires Supabase configuration. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file." } });
		} else {
			dispatch(socialLogin(type, props.router.navigate));
		}
	};

	//for google and linkedin authentication
	const socialResponse = (type: any) => {
		signIn(type);
	};

	// OTP countdown timer
	useEffect(() => {
		if (!otpSent || otpSecondsLeft <= 0) return;
		const timer = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
		return () => clearInterval(timer);
	}, [otpSent, otpSecondsLeft]);

	useEffect(() => {
		if (errorMsg) {
			setTimeout(() => {
				dispatch(resetLoginFlag());
			}, 3000);
		}
	}, [dispatch, errorMsg]);

	document.title = "Sign In | PITCH INVEST";
	return (
		<ParticlesAuth>
			<div className="auth-page-content mt-lg-5">
				<Container>
					<Row>
						<Col lg={12}>
							<div className="text-center mt-sm-5 mb-4 text-white-50">
								<div>
									<Link to="/" className="d-inline-block auth-logo">
										<img src={logoLight} alt="PITCH INVEST" height="60" style={{ maxWidth: "300px", width: "auto" }} />
									</Link>
								</div>
								<p className="mt-3 fs-15 fw-medium">
									PITCH INVEST - Admin Dashboard
								</p>
							</div>
						</Col>
					</Row>

					<Row className="justify-content-center">
						<Col md={8} lg={6} xl={5}>
							<Card className="mt-4">
								<CardBody className="p-4">
									<div className="text-center mt-2">
										<h5 className="text-primary">Welcome Back !</h5>
										<p className="text-muted">Sign in to continue to PITCH INVEST.</p>
									</div>
									{error && error ? (
										<Alert color="danger"> {error} </Alert>
									) : null}
									<div className="p-2 mt-4">
										<Form
											onSubmit={(e) => {
												e.preventDefault();
												validation.handleSubmit();
												return false;
											}}
											action="#"
										>
											<div className="mb-3">
												<Label htmlFor="email" className="form-label">
													Email
												</Label>
												<Input
													name="email"
													className="form-control"
													placeholder="Enter email"
													type="email"
													onChange={validation.handleChange}
													onBlur={validation.handleBlur}
													value={validation.values.email || ""}
													invalid={
														!!(
															validation.touched.email &&
															validation.errors.email
														)
													}
												/>
												{validation.touched.email && validation.errors.email ? (
													<FormFeedback type="invalid">
														{validation.errors.email}
													</FormFeedback>
												) : null}
											</div>

											<div className="mb-3">
												<div className="float-end">
													{useSupabase && (
														<button
															type="button"
															className="btn btn-link text-muted p-0"
															onClick={() => {
																setOtpMode(!otpMode);
																validation.setFieldValue("password", "");
															}}
														>
															{otpMode ? "Use Password" : "Use OTP Code"}
														</button>
													)}
													{!otpMode && (
														<Link to="/forgot-password" className="text-muted">
															Forgot password?
														</Link>
													)}
												</div>
												<Label className="form-label" htmlFor="password-input">
													{otpMode ? "Email Verification" : "Password"}
												</Label>
												{otpMode ? (
													<div className="mb-3">
														<Input
															type="text"
															className="form-control"
															placeholder="Enter 6-digit code"
															value={otpCode}
															onChange={(e) => setOtpCode(e.target.value)}
															maxLength={6}
														/>
														{otpSent && otpSecondsLeft > 0 && (
															<small className="text-muted d-block mt-1">
																Code expires in {Math.floor(otpSecondsLeft / 60)}:{(otpSecondsLeft % 60).toString().padStart(2, "0")}
															</small>
														)}
														{otpSent && otpSecondsLeft <= 0 && (
															<button
																type="button"
																className="btn btn-link p-0 mt-1"
																onClick={() => handleSendOtp(validation.values.email)}
															>
																Resend code
															</button>
														)}
													</div>
												) : (
													<div className="position-relative auth-pass-inputgroup mb-3">
														<Input
															name="password"
															value={validation.values.password || ""}
															type={passwordShow ? "text" : "password"}
															className="form-control pe-5"
															placeholder="Enter Password"
															onChange={validation.handleChange}
															onBlur={validation.handleBlur}
															invalid={
																!!(
																	validation.touched.password &&
																	validation.errors.password
																)
															}
														/>
														{validation.touched.password &&
														validation.errors.password ? (
															<FormFeedback type="invalid">
																{validation.errors.password}
															</FormFeedback>
														) : null}
														<button
															className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
															type="button"
															id="password-addon"
															onClick={() => setPasswordShow(!passwordShow)}
														>
															<i className="ri-eye-fill align-middle"></i>
														</button>
													</div>
												)}
											</div>

											<div className="form-check">
												<Input
													className="form-check-input"
													type="checkbox"
													value=""
													id="auth-remember-check"
												/>
												<Label
													className="form-check-label"
													htmlFor="auth-remember-check"
												>
													Remember me
												</Label>
											</div>

											<div className="mt-4">
												<Button
													color="success"
													disabled={loading || supabaseLoading}
													className="btn btn-success w-100"
													type="submit"
												>
													{(loading || supabaseLoading) && (
														<Spinner size="sm" className="me-2">
															{" "}
															Loading...{" "}
														</Spinner>
													)}
													{otpMode && !otpSent ? "Send Code" : otpMode && otpSent ? "Verify Code" : "Sign In"}
												</Button>
											</div>

											<div className="mt-4 text-center">
												<div className="signin-other-title">
													<h5 className="fs-13 mb-4 title">Sign In with</h5>
												</div>
												<div className="d-flex justify-content-center gap-2">
													<Button
														type="button"
														color="danger"
														className="btn-icon"
														onClick={(e) => {
															e.preventDefault();
															if (useSupabase) {
																handleOAuthLogin("google");
															} else {
																socialResponse("google");
															}
														}}
														disabled={supabaseLoading}
														title="Sign in with Google"
													>
														<i className="ri-google-fill fs-16" />
													</Button>
													<Button
														type="button"
														color="primary"
														className="btn-icon"
														onClick={(e) => {
															e.preventDefault();
															if (useSupabase) {
																handleOAuthLogin("linkedin_oidc");
															} else {
																socialResponse("linkedin");
															}
														}}
														disabled={supabaseLoading}
														title="Sign in with LinkedIn"
													>
														<i className="ri-linkedin-fill fs-16" />
													</Button>
												</div>
											</div>
										</Form>
									</div>
								</CardBody>
							</Card>

							<div className="mt-4 text-center">
								<p className="mb-0">
									Don't have an account ?{" "}
									<Link
										to="/register"
										className="fw-semibold text-primary text-decoration-underline"
									>
										{" "}
										Signup{" "}
									</Link>{" "}
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
						<Label>Enter 6-digit code sent to {validation.values.email}</Label>
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
								onClick={() => handleSendOtp(validation.values.email)}
							>
								Resend code
							</button>
						)}
					</div>
					<div className="d-flex gap-2">
						<Button
							color="primary"
							className="flex-fill"
							onClick={handleVerifyOtp}
							disabled={otpCode.length !== 6 || supabaseLoading}
						>
							{supabaseLoading ? (
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

export default withRouter(Login);
