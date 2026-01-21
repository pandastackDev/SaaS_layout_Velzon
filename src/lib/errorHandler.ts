/**
 * Error Handler Utility
 * Provides user-friendly error messages from Supabase and other sources
 */

export const getErrorMessage = (error: any): string => {
	if (!error) return "An unexpected error occurred";

	// Handle Supabase errors
	if (error.message) {
		const message = error.message.toLowerCase();

		// Authentication errors
		if (message.includes("invalid login credentials") || message.includes("invalid password")) {
			return "Invalid email or password. Please try again.";
		}

		if (message.includes("email not confirmed") || message.includes("email not verified")) {
			return "Please verify your email address before signing in. Check your inbox for the verification link.";
		}

		if (message.includes("user not found") || message.includes("doesn't exist")) {
			return "No account found with this email address. Please sign up first.";
		}

		if (message.includes("email already registered") || message.includes("already exists")) {
			return "An account with this email already exists. Please sign in instead.";
		}

		if (message.includes("password")) {
			return "Password must be at least 6 characters long.";
		}

		if (message.includes("network") || message.includes("fetch")) {
			return "Network error. Please check your internet connection and try again.";
		}

		if (message.includes("timeout")) {
			return "Request timed out. Please try again.";
		}

		if (message.includes("rate limit") || message.includes("too many requests")) {
			return "Too many requests. Please wait a moment and try again.";
		}

		// Return the original message if no specific match
		return error.message;
	}

	// Handle error objects
	if (typeof error === "string") {
		return error;
	}

	if (error.error) {
		return getErrorMessage(error.error);
	}

	return "An unexpected error occurred. Please try again.";
};

export const isNetworkError = (error: any): boolean => {
	if (!error) return false;
	const message = error.message?.toLowerCase() || "";
	return message.includes("network") || message.includes("fetch") || message.includes("timeout");
};

export const isAuthError = (error: any): boolean => {
	if (!error) return false;
	const message = error.message?.toLowerCase() || "";
	return (
		message.includes("invalid") ||
		message.includes("unauthorized") ||
		message.includes("forbidden") ||
		message.includes("not found")
	);
};
