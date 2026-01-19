import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import config from "../config";

const { api } = config;

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// content type
const authUser = sessionStorage.getItem("authUser");
const parsedAuth = authUser
	? (JSON.parse(authUser) as { token?: string })
	: null;
const token = parsedAuth?.token || null;
if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

// intercepting to capture errors
axios.interceptors.response.use(
	(response) => (response.data ? response.data : response),
	(error) => {
		// Any status codes that falls outside the range of 2xx cause this function to trigger
		let message;
		switch (error.status) {
			case 500:
				message = "Internal Server Error";
				break;
			case 401:
				message = "Invalid credentials";
				break;
			case 404:
				message = "Sorry! the data you are looking for could not be found";
				break;
			default:
				message = error.message || error;
		}
		return Promise.reject(message);
	},
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token: string) => {
	axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

class APIClient {
	/**
	 * Fetches data from the given URL
	 */
	get = (
		url: string,
		params?: Record<string, unknown>,
	): Promise<AxiosResponse> => {
		let response: Promise<AxiosResponse>;

		const paramKeys: string[] = [];

		if (params) {
			Object.keys(params).map((key) => {
				paramKeys.push(`${key}=${params[key]}`);
				return paramKeys;
			});

			const queryString = paramKeys?.length ? paramKeys.join("&") : "";
			response = axios.get(`${url}?${queryString}`, params);
		} else {
			response = axios.get(`${url}`, params);
		}

		return response;
	};

	/**
	 * Posts the given data to the URL
	 */
	create = (url: string, data: unknown): Promise<AxiosResponse> => {
		return axios.post(url, data);
	};

	/**
	 * Updates data
	 */
	update = (url: string, data: unknown): Promise<AxiosResponse> => {
		return axios.patch(url, data);
	};

	put = (url: string, data: unknown): Promise<AxiosResponse> => {
		return axios.put(url, data);
	};

	/**
	 * Deletes data
	 */
	delete = (
		url: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse> => {
		return axios.delete(url, { ...config });
	};
}

const getLoggedinUser = () => {
	const user = sessionStorage.getItem("authUser");
	if (!user) {
		return null;
	} else {
		return JSON.parse(user);
	}
};

export { APIClient, setAuthorization, getLoggedinUser };
