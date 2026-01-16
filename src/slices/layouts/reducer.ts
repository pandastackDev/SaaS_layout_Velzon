import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  LAYOUT_TYPES,
  LAYOUT_MODE_TYPES,
  LAYOUT_SIDEBAR_TYPES,
  LAYOUT_WIDTH_TYPES,
  LAYOUT_POSITION_TYPES,
  LAYOUT_TOPBAR_THEME_TYPES,
  LEFT_SIDEBAR_SIZE_TYPES,
  LEFT_SIDEBAR_VIEW_TYPES,
  LEFT_SIDEBAR_IMAGE_TYPES,
  PERLOADER_TYPES,
  SIDEBAR_VISIBILITY_TYPES
} from "../../Components/constants/layout"


export interface LayoutState {
  layoutType: LAYOUT_TYPES.VERTICAL;
  layoutModeType: LAYOUT_MODE_TYPES.LIGHTMODE;
  leftSidebarType: LAYOUT_SIDEBAR_TYPES.LIGHT;
  layoutWidthType: LAYOUT_WIDTH_TYPES.FLUID;
  layoutPositionType: LAYOUT_POSITION_TYPES.FIXED;
  topbarThemeType: LAYOUT_TOPBAR_THEME_TYPES.LIGHT;
  leftsidbarSizeType: LEFT_SIDEBAR_SIZE_TYPES.DEFAULT;
  leftSidebarViewType: LEFT_SIDEBAR_VIEW_TYPES.DEFAULT;
  leftSidebarImageType: LEFT_SIDEBAR_IMAGE_TYPES.NONE;
  preloader: PERLOADER_TYPES.ENABLE;
  sidebarVisibilitytype: SIDEBAR_VISIBILITY_TYPES.SHOW | SIDEBAR_VISIBILITY_TYPES.HIDDEN;
}

export const initialState = {
  layoutType: LAYOUT_TYPES.VERTICAL,           // 1. Layout: Vertical
  layoutModeType: LAYOUT_MODE_TYPES.LIGHTMODE, // 2. Color Scheme: Light
  layoutWidthType: LAYOUT_WIDTH_TYPES.FLUID,   // 3. Layout Width: Fluid
  layoutPositionType: LAYOUT_POSITION_TYPES.FIXED, // 4. Layout Position: Fixed
  topbarThemeType: LAYOUT_TOPBAR_THEME_TYPES.LIGHT, // 5. Topbar Color: Light
  leftsidbarSizeType: LEFT_SIDEBAR_SIZE_TYPES.DEFAULT, // 6. Sidebar Size: Default
  leftSidebarViewType: LEFT_SIDEBAR_VIEW_TYPES.DEFAULT, // 7. Sidebar View: Default
  leftSidebarType: LAYOUT_SIDEBAR_TYPES.LIGHT, // 8. Sidebar Color: Light
  leftSidebarImageType: LEFT_SIDEBAR_IMAGE_TYPES.NONE, // 9. Sidebar Images: None
  preloader: PERLOADER_TYPES.ENABLE,           // 10. Preloader: Enabled
  sidebarVisibilitytype: SIDEBAR_VISIBILITY_TYPES.SHOW
};

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state: any, action : any) {
      state.layoutType = action.payload;
    },
    changeLayoutModeAction(state: any, action: any) {
      state.layoutModeType = action.payload;
    },
    changeSidebarThemeAction(state: any, action: any) {
      state.leftSidebarType = action.payload;
    },
    changeLayoutWidthAction(state: any, action: any) {
      state.layoutWidthType = action.payload;
    },
    changeLayoutPositionAction(state: any, action: any) {
      state.layoutPositionType = action.payload;
    },
    changeTopbarThemeAction(state: any, action: any) {
      state.topbarThemeType = action.payload;
    },
    changeLeftsidebarSizeTypeAction(state: any, action: any) {
      state.leftsidbarSizeType = action.payload;
    },
    changeLeftsidebarViewTypeAction(state: any, action: any) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state: any, action: any) {
      state.leftSidebarImageType = action.payload;
    },
    changePreLoaderAction(state: any, action: any) {
      state.preloader = action.payload;
    },
    changeSidebarVisibilityAction(state: any, action: any) {
      state.sidebarVisibilitytype = action.payload;
    },
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changePreLoaderAction,
  changeSidebarVisibilityAction
} = LayoutSlice.actions;

export default LayoutSlice.reducer;