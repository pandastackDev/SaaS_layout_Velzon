import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addNewInvoice,
	deleteInvoice,
	getInvoices,
	updateInvoice,
} from "./thunk";

interface Invoice {
	_id?: string | number;
	id?: string | number;
	[key: string]: unknown;
}

interface InvoiceState {
	invoices: Invoice[];
	error: Record<string, unknown> | null;
	isInvoiceCreated?: boolean;
	isInvoiceSuccess?: boolean;
}

export const initialState: InvoiceState = {
	invoices: [],
	error: null,
};

const InvoiceSlice = createSlice({
	name: "InvoiceSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getInvoices.fulfilled,
			(state, action: PayloadAction<{ data: Invoice[] }>) => {
				state.invoices = action.payload.data;
				state.isInvoiceCreated = false;
				state.isInvoiceSuccess = true;
			},
		);
		builder.addCase(getInvoices.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isInvoiceCreated = false;
			state.isInvoiceSuccess = false;
		});
		builder.addCase(
			addNewInvoice.fulfilled,
			(state, action: PayloadAction<Invoice>) => {
				state.invoices.push(action.payload);
				state.isInvoiceCreated = true;
			},
		);
		builder.addCase(addNewInvoice.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			updateInvoice.fulfilled,
			(state, action: PayloadAction<{ data: Invoice }>) => {
				state.invoices = state.invoices.map((invoice) => {
					const invoiceId = invoice._id || invoice.id;
					const payloadId = action.payload.data._id || action.payload.data.id;
					return invoiceId?.toString() === payloadId?.toString()
						? { ...invoice, ...action.payload.data }
						: invoice;
				});
			},
		);
		builder.addCase(updateInvoice.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
		builder.addCase(
			deleteInvoice.fulfilled,
			(state, action: PayloadAction<{ invoice: string | number }>) => {
				state.invoices = state.invoices.filter((invoice) => {
					const invoiceId = invoice._id || invoice.id;
					return invoiceId?.toString() !== action.payload.invoice.toString();
				});
			},
		);
		builder.addCase(deleteInvoice.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default InvoiceSlice.reducer;
