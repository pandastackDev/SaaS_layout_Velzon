import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
	getAllMarketData as getAllMarketDataApi,
	getBtcPortfolioData as getBtcPortfolioDataApi,
	getEuroPortfolioData as getEuroPortfolioDataApi,
	getHourMarketData as getHourMarketDataApi,
	getMonthMarketData as getMonthMarketDataApi,
	getUsdPortfolioData as getUsdPortfolioDataApi,
	getWeekMarketData as getWeekMarketDataApi,
	getYearMarketData as getYearMarketDataApi,
} from "../../helpers/fakebackend_helper";

export const getPortfolioChartsData = createAsyncThunk(
	"dashboardCrypto/getPortfolioChartsData",
	async (data: string) => {
		try {
			let response: unknown;
			if (data === "btc") {
				response = getBtcPortfolioDataApi();
			} else if (data === "usd") {
				response = getUsdPortfolioDataApi();
			} else if (data === "euro") {
				response = getEuroPortfolioDataApi();
			} else {
				response = null;
			}
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const getMarketChartsData = createAsyncThunk(
	"dashboardCrypto/getMarketChartsData",
	async (data: string) => {
		try {
			let response: unknown;

			if (data === "all") {
				response = getAllMarketDataApi();
			} else if (data === "year") {
				response = getYearMarketDataApi();
			} else if (data === "month") {
				response = getMonthMarketDataApi();
			} else if (data === "week") {
				response = getWeekMarketDataApi();
			} else if (data === "hour") {
				response = getHourMarketDataApi();
			} else {
				response = null;
			}
			return response;
		} catch (error) {
			return error;
		}
	},
);
