import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from "reactstrap";
import { createSelector } from "reselect";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../lib/toast";
import { logoutUser } from "../../slices/thunks";

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";

const ProfileDropdown = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { user, profile, signOut } = useAuth();
	
	const profiledropdownData = createSelector(
		(state: { Profile: { user: Record<string, unknown> } }) => state.Profile,
		(user) => user.user,
	);
	// Inside your component
	const reduxUser = useSelector(profiledropdownData);

	const [userName, setUserName] = useState("Admin");
	const [userPhoto, setUserPhoto] = useState(avatar1);
	const [isSigningOut, setIsSigningOut] = useState(false);

	useEffect(() => {
		// Priority: Supabase profile > Supabase user > Redux/sessionStorage
		if (profile?.full_name) {
			setUserName(profile.full_name);
		} else if (user?.user_metadata?.full_name) {
			setUserName(user.user_metadata.full_name);
		} else if (user?.email) {
			setUserName(user.email.split("@")[0] || "User");
		} else {
			const authUser = sessionStorage.getItem("authUser");
			if (authUser) {
				const obj = JSON.parse(authUser) as {
					username?: string;
					email?: string;
					first_name?: string;
					data?: { first_name?: string };
					[key: string]: unknown;
				};
				const userObj = reduxUser as { first_name?: string; [key: string]: unknown };
				setUserName(
					import.meta.env.VITE_APP_DEFAULTAUTH === "fake"
						? obj.username === undefined
							? (userObj.first_name as string) ||
								obj.first_name ||
								(obj.data?.first_name as string) ||
								"Admin"
							: "Admin"
						: import.meta.env.VITE_APP_DEFAULTAUTH === "firebase"
							? (obj.email as string) || "Admin"
							: obj.first_name || obj.email?.split("@")[0] || "Admin",
				);
			}
		}

		// Set user photo
		if (profile?.photo_url) {
			setUserPhoto(profile.photo_url);
		} else if (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) {
			setUserPhoto(user.user_metadata.avatar_url || user.user_metadata.picture);
		}
	}, [user, profile, reduxUser]);

	const handleSignOut = async () => {
		if (isSigningOut) return;

		try {
			setIsSigningOut(true);
			
			// Use Supabase signOut if available
			if (user) {
				await signOut();
			}
			
			// Always call Redux logout for compatibility
			dispatch(logoutUser() as any);

			showToast.success("Signed out successfully");
			navigate("/login", { replace: true });
		} catch (error: any) {
			console.error("Sign out error:", error);
			showToast.error(error.message || "Failed to sign out");
			// Still try to logout via Redux
			dispatch(logoutUser() as any);
		} finally {
			setIsSigningOut(false);
		}
	};

	//Dropdown Toggle
	const [isProfileDropdown, setIsProfileDropdown] = useState(false);
	const toggleProfileDropdown = () => {
		setIsProfileDropdown(!isProfileDropdown);
	};
	return (
		<Dropdown
			isOpen={isProfileDropdown}
			toggle={toggleProfileDropdown}
			className="ms-sm-3 header-item topbar-user"
		>
			<DropdownToggle tag="button" type="button" className="btn">
				<span className="d-flex align-items-center">
					<img
						className="rounded-circle header-profile-user"
						src={userPhoto}
						alt="Header Avatar"
						onError={(e) => {
							// Fallback to default avatar if image fails to load
							(e.target as HTMLImageElement).src = avatar1;
						}}
					/>
					<span className="text-start ms-xl-2">
						<span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
							{userName}
						</span>
						<span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
							{profile?.user_type || user?.user_metadata?.user_type || "User"}
						</span>
					</span>
				</span>
			</DropdownToggle>
			<DropdownMenu className="dropdown-menu-end">
				<h6 className="dropdown-header">Welcome {userName}!</h6>
				<DropdownItem className="p-0">
					<Link to="/profile" className="dropdown-item">
						<i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
						<span className="align-middle">Profile</span>
					</Link>
				</DropdownItem>
				<DropdownItem className="p-0">
					<Link to="/apps-chat" className="dropdown-item">
						<i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>{" "}
						<span className="align-middle">Messages</span>
					</Link>
				</DropdownItem>
				<div className="dropdown-divider"></div>
				<DropdownItem className="p-0">
					<Link to="/pages-profile-settings" className="dropdown-item">
						<i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
						<span className="align-middle">Settings</span>
					</Link>
				</DropdownItem>
				<DropdownItem
					onClick={handleSignOut}
					disabled={isSigningOut}
					className="dropdown-item"
					style={{ cursor: isSigningOut ? "not-allowed" : "pointer" }}
				>
					<i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
					<span className="align-middle" data-key="t-logout">
						{isSigningOut ? "Signing out..." : "Logout"}
					</span>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};

export default ProfileDropdown;
