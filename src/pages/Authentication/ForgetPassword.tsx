import { useFormik } from "formik";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

//redux
import { useDispatch, useSelector } from "react-redux";

import { Link } from "react-router-dom";
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
import { toast } from "react-toastify";
// Formik Validation
import * as Yup from "yup";
import logoLight from "../../assets/images/logo-light.png";
import withRouter from "../../Components/Common/withRouter";
// action
import { userForgetPassword } from "../../slices/thunks";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { supabase } from "../../lib/supabase";
import { getErrorMessage } from "../../lib/errorHandler";

const ForgetPasswordPage = (props: any) => {
	const dispatch: any = useDispatch();
	const navigate = useNavigate();
	const [useSupabase, setUseSupabase] = useState(false);
	const [loading, setLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [otpCode, setOtpCode] = useState("");
	const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [verified, setVerified] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		const hasSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
		setUseSupabase(!!hasSupabase);
	}, []);

	useEffect(() => {
		if (!otpSent || otpSecondsLeft <= 0) return;
		const timer = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
		return () => clearInterval(timer);
	}, [otpSent, otpSecondsLeft]);

	const validation: any = useFormik({
		enableReinitialize: true,
		initialValues: {
			email: "",
		},
		validationSchema: Yup.object({
			email: Yup.string().email("Invalid email").required("Please Enter Your Email"),
		}),
		onSubmit: async (values) => {
			if (useSupabase) {
				await handleSupabaseForgotPassword(values.email);
			} else {
				dispatch(userForgetPassword(values, props.history || navigate));
			}
		},
	});

	const handleSupabaseForgotPassword = async (email: string) => {
		setLoading(true);
		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: email.trim(),
				options: {
					shouldCreateUser: false,
				},
			});

			if (error) {
				const errorMsg = getErrorMessage(error);
				toast.error(errorMsg);
				return;
			}

			setOtpSent(true);
			setOtpSecondsLeft(180);
			setShowOtpModal(true);
			toast.success("Verification code sent to your email");
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const verifyOtp = async () => {
		if (otpSecondsLeft <= 0) {
			toast.error("Code expired. Please resend.");
			return;
		}

		const code = otpCode.trim();
		if (!/^\d{6}$/.test(code)) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await supabase.auth.verifyOtp({
				email: validation.values.email.trim(),
				token: code,
				type: "email",
			});

			if (error) throw error;
			if (!data.session) throw new Error("No session returned");

			setVerified(true);
			toast.success("Code verified! Please enter your new password");
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const updatePassword = async () => {
		if (!newPassword || newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) throw error;

			toast.success("Password updated successfully! Redirecting to login...");
			setTimeout(() => {
				navigate("/login", { replace: true });
			}, 2000);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const resendOtp = async () => {
		setOtpCode("");
		setOtpSent(false);
		setOtpSecondsLeft(0);
		await handleSupabaseForgotPassword(validation.values.email);
	};

	const selectLayoutState = (state: any) => state.ForgetPassword;
	const selectLayoutProperties = createSelector(selectLayoutState, (state) => ({
		forgetError: state.forgetError,
		forgetSuccessMsg: state.forgetSuccessMsg,
	}));
	// Inside your component
	const { forgetError, forgetSuccessMsg } = useSelector(selectLayoutProperties);

	document.title = "Reset Password | Velzon - React Admin & Dashboard Template";
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
								<p className="mt-3 fs-15 fw-medium">
									Premium Admin & Dashboard Template
								</p>
							</div>
						</Col>
					</Row>

					<Row className="justify-content-center">
						<Col md={8} lg={6} xl={5}>
							<Card className="mt-4">
								<CardBody className="p-4">
									<div className="text-center mt-2">
										<h5 className="text-primary">Forgot Password?</h5>
										<p className="text-muted">Reset password with velzon</p>

										<i className="ri-mail-send-line display-5 text-success mb-3"></i>
									</div>

									<Alert
										className="border-0 alert-warning text-center mb-2 mx-2"
										role="alert"
									>
										Enter your email and instructions will be sent to you!
									</Alert>
									<div className="p-2">
										{forgetError && forgetError ? (
											<Alert color="danger" style={{ marginTop: "13px" }}>
												{forgetError}
											</Alert>
										) : null}
										{forgetSuccessMsg ? (
											<Alert color="success" style={{ marginTop: "13px" }}>
												{forgetSuccessMsg}
											</Alert>
										) : null}
										<Form
											onSubmit={(e) => {
												e.preventDefault();
												validation.handleSubmit();
												return false;
											}}
										>
											<div className="mb-4">
												<Label className="form-label">Email</Label>
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
														<div>{validation.errors.email}</div>
													</FormFeedback>
												) : null}
											</div>

											<div className="text-center mt-4">
												<button className="btn btn-success w-100" type="submit">
													Send Reset Link
												</button>
											</div>
										</Form>
									</div>
								</CardBody>
							</Card>

							<div className="mt-4 text-center">
								<p className="mb-0">
									Wait, I remember my password...{" "}
									<Link
										to="/login"
										className="fw-semibold text-primary text-decoration-underline"
									>
										{" "}
										Click here{" "}
									</Link>{" "}
								</p>
							</div>
						</Col>
					</Row>
				</Container>
			</div>

			{/* OTP Verification Modal */}
			<Modal isOpen={showOtpModal} toggle={() => !verified && setShowOtpModal(false)} centered>
				<ModalHeader toggle={() => !verified && setShowOtpModal(false)}>
					{verified ? "Set New Password" : "Verify Email"}
				</ModalHeader>
				<ModalBody>
					{!verified ? (
						<>
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
										onClick={resendOtp}
									>
										Resend code
									</button>
								)}
							</div>
							<div className="d-flex gap-2">
								<Button
									color="primary"
									className="flex-fill"
									onClick={verifyOtp}
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
									onClick={() => setShowOtpModal(false)}
								>
									Cancel
								</Button>
							</div>
						</>
					) : (
						<>
							<div className="mb-3">
								<Label>New Password</Label>
								<Input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Enter new password"
								/>
							</div>
							<div className="mb-3">
								<Label>Confirm Password</Label>
								<Input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm new password"
								/>
							</div>
							<Button
								color="primary"
								className="w-100"
								onClick={updatePassword}
								disabled={loading || !newPassword || !confirmPassword}
							>
								{loading ? (
									<>
										<Spinner size="sm" className="me-2" />
										Updating...
									</>
								) : (
									"Update Password"
								)}
							</Button>
						</>
					)}
				</ModalBody>
			</Modal>
		</ParticlesAuth>
	);
};

ForgetPasswordPage.propTypes = {
	history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
