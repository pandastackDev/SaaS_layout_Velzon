// Global type declarations for missing modules

// Node.js types
declare module 'node:path' {
	import path from 'path';
	export = path;
}

declare module 'prop-types' {
	export const any: any;
	export const array: any;
	export const bool: any;
	export const func: any;
	export const number: any;
	export const object: any;
	export const string: any;
	export const node: any;
	export const element: any;
	export const oneOf: any;
	export const oneOfType: any;
	export const arrayOf: any;
	export const objectOf: any;
	export const shape: any;
	export const exact: any;
	export const instanceOf: any;
	export const checkPropTypes: any;
	export const PropTypes: any;
}

declare module 'lodash' {
	const _: any;
	export default _;
}

declare module 'reactstrap' {
	export const Row: any;
	export const Col: any;
	export const Container: any;
	export const Card: any;
	export const CardBody: any;
	export const CardHeader: any;
	export const Button: any;
	export const Input: any;
	export const Label: any;
	export const Form: any;
	export const FormFeedback: any;
	export const Table: any;
	export const Dropdown: any;
	export const DropdownToggle: any;
	export const DropdownMenu: any;
	export const DropdownItem: any;
	export const Spinner: any;
	export const Alert: any;
	export const TabContent: any;
	export const TabPane: any;
	export const Nav: any;
	export const NavItem: any;
	export const NavLink: any;
	export const Badge: any;
	export const Modal: any;
	export const ModalHeader: any;
	export const ModalBody: any;
	export const ModalFooter: any;
	export const Pagination: any;
	export const PaginationItem: any;
	export const PaginationLink: any;
	export const UncontrolledDropdown: any;
	export const UncontrolledButtonDropdown: any;
	export const UncontrolledTooltip: any;
	export const UncontrolledPopover: any;
	export const UncontrolledCollapse: any;
	export const UncontrolledAlert: any;
	export const UncontrolledCarousel: any;
}

// Extend Document interface for fullscreen API vendor prefixes
interface Document {
	mozFullScreenElement?: Element | null;
	webkitFullscreenElement?: Element | null;
	msFullscreenElement?: Element | null;
	mozFullScreen?: boolean;
	webkitIsFullScreen?: boolean;
	cancelFullScreen?: () => void;
	mozCancelFullScreen?: () => void;
	webkitCancelFullScreen?: () => void;
}

// Extend HTMLElement interface for fullscreen API vendor prefixes
interface HTMLElement {
	mozRequestFullScreen?: () => void;
	webkitRequestFullscreen?: () => void;
	msRequestFullscreen?: () => void;
}

// Extend Window interface
interface Window {
	LAYOUT_MODE_TYPES?: {
		DARKMODE?: string;
		LIGHTMODE?: string;
	};
}

// Node.js globals for Vite config
declare const __dirname: string;
declare const __filename: string;
