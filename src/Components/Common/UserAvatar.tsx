import { useState } from "react";

interface UserAvatarProps {
	photoUrl?: string | null;
	fullName?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const UserAvatar = ({ photoUrl, fullName, size = "sm", className = "" }: UserAvatarProps) => {
	const [imageError, setImageError] = useState(false);

	const sizeClasses = {
		sm: { container: "avatar-sm", text: "fs-14" },
		md: { container: "avatar-md", text: "fs-16" },
		lg: { container: "avatar-lg", text: "fs-18" },
	};

	const sizePixels = {
		sm: "40px",
		md: "48px",
		lg: "64px",
	};

	const initial = fullName?.charAt(0)?.toUpperCase() || "U";

	if (photoUrl && !imageError) {
		return (
			<img
				src={photoUrl}
				alt={fullName || "User"}
				className={`rounded-circle ${sizeClasses[size].container} ${className}`}
				onError={() => setImageError(true)}
				style={{ width: sizePixels[size], height: sizePixels[size], objectFit: "cover" }}
			/>
		);
	}

	return (
		<div className={`${sizeClasses[size].container} ${className}`}>
			<span
				className="avatar-title bg-primary-subtle text-primary rounded-circle"
				style={{
					width: sizePixels[size],
					height: sizePixels[size],
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: sizeClasses[size].text,
					fontWeight: "600",
				}}
			>
				{initial}
			</span>
		</div>
	);
};

export default UserAvatar;
