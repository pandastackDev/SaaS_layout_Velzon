import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addNewCustomer,
	addNewOrder,
	addNewProduct,
	deleteCustomer,
	deleteOrder,
	deleteProducts,
	getCustomers,
	getOrders,
	getProducts,
	getSellers,
	updateCustomer,
	updateOrder,
	updateProduct,
} from "./thunk";

interface Product {
	id: string | number;
	[key: string]: unknown;
}

interface Order {
	id: string | number;
	[key: string]: unknown;
}

interface Seller {
	[key: string]: unknown;
}

interface Customer {
	id: string | number;
	[key: string]: unknown;
}

interface EcommerceState {
	products: Product[];
	orders: Order[];
	sellers: Seller[];
	customers: Customer[];
	error: Record<string, unknown> | null;
	isOrderCreated?: boolean;
	isOrderSuccess?: boolean;
	isCustomerCreated?: boolean;
	isCustomerSuccess?: boolean;
}

export const initialState: EcommerceState = {
	products: [],
	orders: [],
	sellers: [],
	customers: [],
	error: null,
};

const EcommerceSlice = createSlice({
	name: "EcommerceSlice",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getProducts.fulfilled,
			(state, action: PayloadAction<Product[]>) => {
				state.products = action.payload;
			},
		);

		builder.addCase(getProducts.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			addNewProduct.fulfilled,
			(state, action: PayloadAction<Product>) => {
				state.products.push(action.payload);
			},
		);

		builder.addCase(addNewProduct.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateProduct.fulfilled,
			(state, action: PayloadAction<Product>) => {
				state.products = state.products.map((product) =>
					product.id === action.payload.id
						? { ...product, ...action.payload }
						: product,
				);
			},
		);

		builder.addCase(updateProduct.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteProducts.fulfilled,
			(state, action: PayloadAction<{ product: string | number }>) => {
				state.products = (state.products || []).filter(
					(product) =>
						product.id.toString() !== action.payload.product.toString(),
				);
			},
		);

		builder.addCase(deleteProducts.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getOrders.fulfilled,
			(state, action: PayloadAction<Order[]>) => {
				state.orders = action.payload;
				state.isOrderCreated = false;
				state.isOrderSuccess = true;
			},
		);

		builder.addCase(getOrders.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isOrderCreated = false;
			state.isOrderSuccess = false;
		});

		builder.addCase(
			addNewOrder.fulfilled,
			(state, action: PayloadAction<Order>) => {
				state.orders.push(action.payload);
				state.isOrderCreated = true;
			},
		);

		builder.addCase(addNewOrder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateOrder.fulfilled,
			(state, action: PayloadAction<Order>) => {
				state.orders = state.orders.map((order) =>
					order.id === action.payload.id
						? { ...order, ...action.payload }
						: order,
				);
			},
		);

		builder.addCase(updateOrder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteOrder.fulfilled,
			(state, action: PayloadAction<{ order: string | number }>) => {
				state.orders = state.orders.filter(
					(order) => order.id.toString() !== action.payload.order.toString(),
				);
			},
		);

		builder.addCase(deleteOrder.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getSellers.fulfilled,
			(state, action: PayloadAction<Seller[]>) => {
				state.sellers = action.payload;
			},
		);

		builder.addCase(getSellers.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getCustomers.fulfilled,
			(state, action: PayloadAction<Customer[]>) => {
				state.customers = action.payload;
				state.isCustomerCreated = false;
				state.isCustomerSuccess = true;
			},
		);

		builder.addCase(getCustomers.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isCustomerCreated = false;
			state.isCustomerSuccess = false;
		});

		builder.addCase(
			addNewCustomer.fulfilled,
			(state, action: PayloadAction<Customer>) => {
				state.customers.push(action.payload);
				state.isCustomerCreated = true;
			},
		);
		builder.addCase(addNewCustomer.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			updateCustomer.fulfilled,
			(state, action: PayloadAction<Customer>) => {
				state.customers = state.customers.map((customer) =>
					customer.id === action.payload.id
						? { ...customer, ...action.payload }
						: customer,
				);
			},
		);
		builder.addCase(updateCustomer.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			deleteCustomer.fulfilled,
			(state, action: PayloadAction<{ customer: string | number }>) => {
				state.customers = state.customers.filter(
					(customer) =>
						customer.id.toString() !== action.payload.customer.toString(),
				);
			},
		);
		builder.addCase(deleteCustomer.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});
	},
});

export default EcommerceSlice.reducer;
