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
