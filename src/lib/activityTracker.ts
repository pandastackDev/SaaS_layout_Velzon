interface Activity {
	id: string;
	type: string;
	title: string;
	description: string;
	icon: string;
	iconClass: string;
	timestamp: string;
	page?: string;
	userId?: string;
	userName?: string;
}

const STORAGE_KEY = "admin_recent_activities";
const MAX_ACTIVITIES = 50;

/**
 * Log an activity to recent activity feed
 */
export const logActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
	try {
		const activities = getActivities();
		const newActivity: Activity = {
			...activity,
			id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date().toISOString(),
		};

		// Add new activity to the beginning
		activities.unshift(newActivity);

		// Keep only the most recent activities
		const limitedActivities = activities.slice(0, MAX_ACTIVITIES);

		// Save to localStorage
		localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedActivities));
	} catch (error) {
		console.error("Error logging activity:", error);
	}
};

/**
 * Get all activities from storage
 */
export const getActivities = (): Activity[] => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored);
	} catch (error) {
		console.error("Error getting activities:", error);
		return [];
	}
};

/**
 * Clear all activities
 */
export const clearActivities = () => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error("Error clearing activities:", error);
	}
};

/**
 * Helper functions for specific activity types
 */
export const activityHelpers = {
	profileApproved: (userName: string, userId?: string) => {
		logActivity({
			type: "profile_approved",
			title: "Profile Approved",
			description: `Approved profile for ${userName}`,
			icon: "ri-checkbox-circle-line",
			iconClass: "success",
			page: "/admin/profile-approval",
			userId,
			userName,
		});
	},

	profileRejected: (userName: string, userId?: string) => {
		logActivity({
			type: "profile_rejected",
			title: "Profile Rejected",
			description: `Rejected profile for ${userName}`,
			icon: "ri-close-circle-line",
			iconClass: "danger",
			page: "/admin/profile-approval",
			userId,
			userName,
		});
	},

	profileReset: (userName: string, userId?: string) => {
		logActivity({
			type: "profile_reset",
			title: "Profile Reset",
			description: `Reset profile status for ${userName} to pending`,
			icon: "ri-refresh-line",
			iconClass: "warning",
			page: "/admin/profile-approval",
			userId,
			userName,
		});
	},

	projectApproved: (projectName: string, projectId?: string) => {
		logActivity({
			type: "project_approved",
			title: "Project Approved",
			description: `Approved project: ${projectName}`,
			icon: "ri-checkbox-circle-line",
			iconClass: "success",
			page: "/admin/projects",
		});
	},

	projectRejected: (projectName: string, projectId?: string) => {
		logActivity({
			type: "project_rejected",
			title: "Project Rejected",
			description: `Rejected project: ${projectName}`,
			icon: "ri-close-circle-line",
			iconClass: "danger",
			page: "/admin/projects",
		});
	},

	userUpdated: (userName: string, userId?: string) => {
		logActivity({
			type: "user_updated",
			title: "User Updated",
			description: `Updated user: ${userName}`,
			icon: "ri-user-settings-line",
			iconClass: "info",
			page: "/admin/users",
			userId,
			userName,
		});
	},

	pricingUpdated: (planName: string) => {
		logActivity({
			type: "pricing_updated",
			title: "Pricing Updated",
			description: `Updated pricing plan: ${planName}`,
			icon: "ri-money-dollar-circle-line",
			iconClass: "warning",
			page: "/admin/pricing",
		});
	},

	bannerUploaded: (assetName: string) => {
		logActivity({
			type: "banner_uploaded",
			title: "Banner Uploaded",
			description: `Uploaded advertising banner: ${assetName}`,
			icon: "ri-image-line",
			iconClass: "primary",
			page: "/admin/advertising",
		});
	},

	bannerDeleted: (assetName: string) => {
		logActivity({
			type: "banner_deleted",
			title: "Banner Deleted",
			description: `Deleted advertising banner: ${assetName}`,
			icon: "ri-delete-bin-line",
			iconClass: "danger",
			page: "/admin/advertising",
		});
	},

	invoiceCreated: (invoiceId: string, amount: string) => {
		logActivity({
			type: "invoice_created",
			title: "Invoice Created",
			description: `Created invoice #${invoiceId} for $${amount}`,
			icon: "ri-file-list-line",
			iconClass: "info",
			page: "/admin/invoices",
		});
	},

	userBanned: (userName: string, userId?: string) => {
		logActivity({
			type: "user_banned",
			title: "User Banned",
			description: `Banned user: ${userName}`,
			icon: "ri-user-forbid-line",
			iconClass: "danger",
			page: "/admin/users",
			userId,
			userName,
		});
	},

	userUnbanned: (userName: string, userId?: string) => {
		logActivity({
			type: "user_unbanned",
			title: "User Unbanned",
			description: `Unbanned user: ${userName}`,
			icon: "ri-user-unfollow-line",
			iconClass: "success",
			page: "/admin/users",
			userId,
			userName,
		});
	},
};
