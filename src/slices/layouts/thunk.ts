import {
	changeLayoutAction,
	changeLayoutModeAction,
	changeLayoutPositionAction,
	changeLayoutWidthAction,
	changeLeftsidebarSizeTypeAction,
	changeLeftsidebarViewTypeAction,
	changePreLoaderAction,
	changeSidebarImageTypeAction,
	changeSidebarThemeAction,
	changeSidebarVisibilityAction,
	changeTopbarThemeAction,
} from "./reducer";
import { changeHTMLAttribute } from "./utils";

/**
 * Changes the layout type
 * @param {*} param0
 */
export const changeLayout =
	(layout: string) => async (dispatch: (action: unknown) => void) => {
		try {
			if (layout === "twocolumn") {
				document.documentElement.removeAttribute("data-layout-width");
			} else if (layout === "horizontal") {
				document.documentElement.removeAttribute("data-sidebar-size");
			} else if (layout === "semibox") {
				changeHTMLAttribute("data-layout-width", "fluid");
				changeHTMLAttribute("data-layout-style", "default");
			}
			changeHTMLAttribute("data-layout", layout);
			dispatch(changeLayoutAction(layout));
		} catch (_error) {}
	};

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeLayoutMode =
	(layoutMode: string) => async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-bs-theme", layoutMode);
			dispatch(changeLayoutModeAction(layoutMode));
		} catch (_error) {}
	};

/**
 * Changes the left sidebar theme
 * @param {*} param0
 */
export const changeSidebarTheme =
	(theme: string) => async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-sidebar", theme);
			dispatch(changeSidebarThemeAction(theme));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the layout width
 * @param {*} param0
 */
export const changeLayoutWidth =
	(layoutWidth: string) => async (dispatch: (action: unknown) => void) => {
		try {
			if (layoutWidth === "lg") {
				changeHTMLAttribute("data-layout-width", "fluid");
			} else {
				changeHTMLAttribute("data-layout-width", "boxed");
			}
			dispatch(changeLayoutWidthAction(layoutWidth));
		} catch (error) {
			return error;
		}
	};

/**
 * Changes the layout position
 * @param {*} param0
 */
export const changeLayoutPosition =
	(layoutposition: string) => async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-layout-position", layoutposition);
			dispatch(changeLayoutPositionAction(layoutposition));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeTopbarTheme =
	(topbarTheme: string) => async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-topbar", topbarTheme);
			dispatch(changeTopbarThemeAction(topbarTheme));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeSidebarImageType =
	(leftsidebarImagetype: string) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-sidebar-image", leftsidebarImagetype);
			dispatch(changeSidebarImageTypeAction(leftsidebarImagetype));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the Preloader
 * @param {*} param0
 */
export const changePreLoader =
	(preloaderTypes: string) => async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-preloader", preloaderTypes);
			dispatch(changePreLoaderAction(preloaderTypes));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeLeftsidebarSizeType =
	(leftsidebarSizetype: string) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			switch (leftsidebarSizetype) {
				case "lg":
					changeHTMLAttribute("data-sidebar-size", "lg");
					break;
				case "md":
					changeHTMLAttribute("data-sidebar-size", "md");
					break;
				case "sm":
					changeHTMLAttribute("data-sidebar-size", "sm");
					break;
				case "sm-hover":
					changeHTMLAttribute("data-sidebar-size", "sm-hover");
					break;
				default:
					changeHTMLAttribute("data-sidebar-size", "lg");
			}
			dispatch(changeLeftsidebarSizeTypeAction(leftsidebarSizetype));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeLeftsidebarViewType =
	(leftsidebarViewtype: string) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-layout-style", leftsidebarViewtype);
			dispatch(changeLeftsidebarViewTypeAction(leftsidebarViewtype));
		} catch (_error) {
			// console.log(error);
		}
	};

/**
 * Changes the sidebar visibility
 * @param {*} param0
 */
export const changeSidebarVisibility =
	(sidebarVisibilitytype: string) =>
	async (dispatch: (action: unknown) => void) => {
		try {
			changeHTMLAttribute("data-sidebar-visibility", sidebarVisibilitytype);
			dispatch(changeSidebarVisibilityAction(sidebarVisibilitytype));
		} catch (_error) {}
	};
