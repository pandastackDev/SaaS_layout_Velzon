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
import { supabase } from "../../lib/supabase";

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
	const [imageError, setImageError] = useState(false);

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

		// Fetch user photo with priority: profile.photo_url > direct DB fetch > user_metadata > default
		const fetchUserPhoto = async () => {
			// Priority 1: Use profile.photo_url from useAuth hook (most reliable)
			if (profile?.photo_url) {
				setUserPhoto(profile.photo_url);
				setImageError(false);
				return;
			}

			// Priority 2: Try fetching directly from database if user ID is available
			// This ensures we get the latest photo_url even if profile hasn't updated yet
			if (user?.id) {
				try {
					const { data, error } = await supabase
						.from('users')
						.select('photo_url, full_name')
						.eq('id', user.id)
						.single();

					if (!error && data) {
						if (data.photo_url) {
							setUserPhoto(data.photo_url);
							setImageError(false);
							return;
						}
					}
				} catch (error) {
					console.error('Error fetching user photo from database:', error);
				}
			}

			// Priority 3: Use user_metadata (fallback for older auth methods)
			if (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) {
				setUserPhoto(user.user_metadata.avatar_url || user.user_metadata.picture);
				setImageError(false);
				return;
			}

			// Priority 4: Default avatar or initial-based avatar
			setUserPhoto(avatar1);
			setImageError(false);
		};

		fetchUserPhoto();
	}, [user?.id, profile?.photo_url, user?.user_metadata, reduxUser]);

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
					{!imageError && userPhoto !== avatar1 ? (
						<img
							className="rounded-circle header-profile-user"
							src={userPhoto}
							alt={userName || "Header Avatar"}
							onError={() => {
								// Fallback to default avatar if image fails to load
								setImageError(true);
								setUserPhoto(avatar1);
							}}
							style={{ width: "40px", height: "40px", objectFit: "cover" }}
						/>
					) : (
						<div 
							className="rounded-circle header-profile-user d-flex align-items-center justify-content-center"
							style={{ 
								width: "40px", 
								height: "40px", 
								backgroundColor: "#e9ecef",
								color: "#495057",
								fontWeight: "bold",
								fontSize: "16px"
							}}
						>
							{(userName?.charAt(0) || "U").toUpperCase()}
						</div>
					)}
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
