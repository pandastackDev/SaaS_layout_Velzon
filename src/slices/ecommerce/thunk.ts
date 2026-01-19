import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Include Both Helper File with needed methods
import {
	addNewCustomer as addNewCustomerApi,
	addNewOrder as addNewOrderApi,
	addNewProduct as addNewProductApi,
	deleteCustomer as deleteCustomerApi,
	deleteOrder as deleteOrderApi,
	deleteProducts as deleteProductsApi,
	getCustomers as getCustomersApi,
	getOrders as getOrdersApi,
	getProducts as getProductsApi,
	getSellers as getSellersApi,
	updateCustomer as updateCustomerApi,
	updateOrder as updateOrderApi,
	updateProduct as updateProductApi,
} from "../../helpers/fakebackend_helper";

export const getProducts = createAsyncThunk(
	"ecommerce/getProducts",
	async () => {
		try {
			const response = getProductsApi();
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const getOrders = createAsyncThunk("ecommerce/getOrders", async () => {
	try {
		const response = getOrdersApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const getSellers = createAsyncThunk("ecommerce/getSellers", async () => {
	try {
		const response = getSellersApi();
		return response;
	} catch (error) {
		return error;
	}
});

export const getCustomers = createAsyncThunk(
	"ecommerce/getCustomers",
	async () => {
		try {
			const response = getCustomersApi();
			return response;
		} catch (error) {
			return error;
		}
	},
);

export const deleteProducts = createAsyncThunk(
	"ecommerce/deleteProducts",
	async (product: string | number | Record<string, unknown>) => {
		try {
			const response = deleteProductsApi(product);
			toast.success("Product Delete Successfully", { autoClose: 3000 });
			return { product, ...response };
		} catch (error) {
			toast.error("Product Delete Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const updateOrder = createAsyncThunk(
	"ecommerce/updateOrder",
	async (order: Record<string, unknown>) => {
		try {
			const response = updateOrderApi(order);
			const data = await response;
			toast.success("Order Updateded Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Order Updateded Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const addNewProduct = createAsyncThunk(
	"ecommerce/addNewProduct",
	async (product: Record<string, unknown>) => {
		try {
			const response = addNewProductApi(product);
			const data = await response;
			toast.success("Product Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Product Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const updateProduct = createAsyncThunk(
	"ecommerce/updateProduct",
	async (product: Record<string, unknown>) => {
		try {
			const response = updateProductApi(product);
			const data = await response;
			toast.success("Product Updateded Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Product Updateded Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const deleteOrder = createAsyncThunk(
	"ecommerce/deleteOrder",
	async (order: string | number | Record<string, unknown>) => {
		try {
			const response = deleteOrderApi(order);
			toast.success("Order Deleted Successfully", { autoClose: 3000 });
			return { order, ...response };
		} catch (error) {
			toast.error("Order Deleted Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const addNewOrder = createAsyncThunk(
	"ecommerce/addNewOrder",
	async (order: Record<string, unknown>) => {
		try {
			const response = addNewOrderApi(order);
			const data = await response;
			toast.success("Order Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Order Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const updateCustomer = createAsyncThunk(
	"ecommerce/updateCustomer",
	async (customer: Record<string, unknown>) => {
		try {
			const response = updateCustomerApi(customer);
			const data = await response;
			toast.success("Customer Updateded Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Customer Updateded Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const deleteCustomer = createAsyncThunk(
	"ecommerce/deleteCustomer",
	async (customer: string | number | Record<string, unknown>) => {
		try {
			const response = deleteCustomerApi(customer);
			toast.success("Customer Deleted Successfully", { autoClose: 3000 });
			return { customer, ...response };
		} catch (error) {
			toast.error("Customer Deleted Failed", { autoClose: 3000 });
			return error;
		}
	},
);

export const addNewCustomer = createAsyncThunk(
	"ecommerce/addNewCustomer",
	async (customer: Record<string, unknown>) => {
		try {
			const response = addNewCustomerApi(customer);
			const data = await response;
			toast.success("Customer Added Successfully", { autoClose: 3000 });
			return data;
		} catch (error) {
			toast.error("Customer Added Failed", { autoClose: 3000 });
			return error;
		}
	},
);
