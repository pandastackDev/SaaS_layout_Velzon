import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

const AuthCallback = () => {
	const navigate = useNavigate();
	const { user, loading } = useAuth();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				// Get the session from URL hash
				const { data, error } = await supabase.auth.getSession();

				if (error) {
					console.error("Auth callback error:", error);
					navigate("/login");
					return;
				}

				if (data.session) {
					// Store user in sessionStorage for Redux compatibility
					const userData = {
						email: data.session.user.email,
						username: data.session.user.email?.split("@")[0] || "user",
						first_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0] || "User",
						token: data.session.access_token,
					};

					sessionStorage.setItem("authUser", JSON.stringify(userData));
					
					// Check if user needs to complete registration
					const { data: userProfile } = await supabase
						.from("users")
						.select("user_type")
						.eq("id", data.session.user.id)
						.single();

					if (!userProfile || !userProfile.user_type) {
						// User needs to complete registration
						navigate("/register?oauth=true");
					} else {
						// User is fully registered, go to admin dashboard
						navigate("/admin/dashboard");
					}
				} else {
					navigate("/login");
				}
			} catch (error) {
				console.error("Callback error:", error);
				navigate("/login");
			}
		};

		handleAuthCallback();
	}, [navigate]);

	return (
		<div className="page-content">
			<Container fluid>
				<div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
					<div className="text-center">
						<Spinner color="primary" />
						<p className="mt-3">Completing sign in...</p>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default AuthCallback;
