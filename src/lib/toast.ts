import { toast } from "react-toastify";

/**
 * Velzon-styled toast notifications
 * These match the Velzon theme design with proper className styling
 */

export const showToast = {
	success: (message: string, options?: any) => {
		return toast.success(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			className: "bg-success text-white",
			...options,
		});
	},

	error: (message: string, options?: any) => {
		return toast.error(message, {
			position: "top-right",
			autoClose: 4000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			className: "bg-danger text-white",
			...options,
		});
	},

	warning: (message: string, options?: any) => {
		return toast.warning(message, {
			position: "top-right",
			autoClose: 3500,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			className: "bg-warning text-white",
			...options,
		});
	},

	info: (message: string, options?: any) => {
		return toast.info(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			className: "bg-primary text-white",
			...options,
		});
	},

	default: (message: string, options?: any) => {
		return toast(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			className: "bg-primary text-white",
			...options,
		});
	},
};
