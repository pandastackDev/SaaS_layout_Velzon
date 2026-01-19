import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { getMarketChartsData, getPortfolioChartsData } from "./thunk";

interface ChartData {
	[key: string]: unknown;
}

interface DashboardCryptoState {
	portfolioData: ChartData[];
	marketData: ChartData[];
	error: Record<string, unknown> | null;
}

export const initialState: DashboardCryptoState = {
	portfolioData: [],
	marketData: [],
	error: null,
};

const DashboardCryptoSlice = createSlice({
	name: "DashboardCrypto",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getPortfolioChartsData.fulfilled,
			(state, action: PayloadAction<ChartData[]>) => {
				state.portfolioData = action.payload;
			},
		);
		builder.addCase(getPortfolioChartsData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getMarketChartsData.fulfilled,
			(state, action: PayloadAction<ChartData[]>) => {
				state.marketData = action.payload;
			},
		);
		builder.addCase(getMarketChartsData.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default DashboardCryptoSlice.reducer;
