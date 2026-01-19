import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getOrderList, getTransationList } from "./thunk";

interface Transaction {
	[key: string]: unknown;
}

interface Order {
	[key: string]: unknown;
}

interface CryptoState {
	transationList: Transaction[];
	orderList: Order[];
	error?: Record<string, unknown> | null;
}

export const initialState: CryptoState = {
	transationList: [],
	orderList: [],
};

const Cryptoslice = createSlice({
	name: "Crypto",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getTransationList.fulfilled,
			(state, action: PayloadAction<Transaction[]>) => {
				state.transationList = action.payload;
			},
		);
		builder.addCase(getTransationList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getOrderList.fulfilled,
			(state, action: PayloadAction<Order[]>) => {
				state.orderList = action.payload;
			},
		);
		builder.addCase(getOrderList.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default Cryptoslice.reducer;
