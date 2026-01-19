import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	addNewCompanies,
	addNewContact,
	addNewLead,
	deleteCompanies,
	deleteContact,
	deleteLead,
	getCompanies,
	getContacts,
	getDeals,
	getLeads,
	updateCompanies,
	updateContact,
	updateLead,
} from "./thunk";

interface Contact {
	id: string | number;
	[key: string]: unknown;
}

interface Company {
	id: string | number;
	[key: string]: unknown;
}

interface Deal {
	[key: string]: unknown;
}

interface Lead {
	id: string | number;
	[key: string]: unknown;
}

interface CrmState {
	crmcontacts: Contact[];
	companies: Company[];
	isLeadCreated: boolean;
	deals: Deal[];
	leads: Lead[];
	error: Record<string, unknown> | null;
	isContactCreated?: boolean;
	isContactSuccess?: boolean;
	isContactAdd?: boolean;
	isContactAddFail?: boolean;
	isContactUpdate?: boolean;
	isContactUpdateFail?: boolean;
	isContactDelete?: boolean;
	isContactDeleteFail?: boolean;
	isCompaniesCreated?: boolean;
	isCompaniesSuccess?: boolean;
	isCompaniesAdd?: boolean;
	isCompaniesAddFail?: boolean;
	isCompaniesUpdate?: boolean;
	isCompaniesUpdateFail?: boolean;
	isCompaniesDelete?: boolean;
	isCompaniesDeleteFail?: boolean;
	isLeadsSuccess?: boolean;
	isLeadsAdd?: boolean;
	isLeadsAddFail?: boolean;
	isLeadsUpdate?: boolean;
	isLeadsUpdateFail?: boolean;
	isLeadsDelete?: boolean;
	isLeadsDeleteFail?: boolean;
}

export const initialState: CrmState = {
	crmcontacts: [],
	companies: [],
	isLeadCreated: false,
	deals: [],
	leads: [],
	error: null,
};

const crmSlice = createSlice({
	name: "crm",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			getContacts.fulfilled,
			(state, action: PayloadAction<Contact[]>) => {
				state.crmcontacts = action.payload;
				state.isContactCreated = false;
				state.isContactSuccess = true;
			},
		);

		builder.addCase(getContacts.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isContactCreated = false;
			state.isContactSuccess = false;
		});

		builder.addCase(
			addNewContact.fulfilled,
			(state, action: PayloadAction<Contact>) => {
				state.crmcontacts.push(action.payload);
				state.isCompaniesCreated = true;
				state.isCompaniesAdd = true;
				state.isCompaniesAddFail = false;
			},
		);

		builder.addCase(addNewContact.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isContactAdd = false;
			state.isContactAddFail = true;
		});

		builder.addCase(
			updateContact.fulfilled,
			(state, action: PayloadAction<Contact>) => {
				state.crmcontacts = state.crmcontacts.map((contact) =>
					contact.id === action.payload.id
						? { ...contact, ...action.payload }
						: contact,
				);
				state.isCompaniesCreated = true;
				state.isCompaniesAdd = true;
				state.isCompaniesAddFail = false;
			},
		);

		builder.addCase(updateContact.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isContactUpdate = false;
			state.isContactUpdateFail = true;
		});

		builder.addCase(
			deleteContact.fulfilled,
			(state, action: PayloadAction<{ contact: string | number }>) => {
				state.crmcontacts = (state.crmcontacts || []).filter(
					(contact) =>
						contact.id.toString() !== action.payload.contact.toString(),
				);
				state.isContactDelete = true;
				state.isContactDeleteFail = false;
			},
		);

		builder.addCase(deleteContact.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isContactDelete = false;
			state.isContactDeleteFail = true;
		});

		builder.addCase(
			getCompanies.fulfilled,
			(state, action: PayloadAction<Company[]>) => {
				state.companies = action.payload;
				state.isCompaniesCreated = false;
				state.isCompaniesSuccess = true;
			},
		);

		builder.addCase(getCompanies.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isCompaniesCreated = false;
			state.isCompaniesSuccess = false;
		});

		builder.addCase(
			addNewCompanies.fulfilled,
			(state, action: PayloadAction<Company>) => {
				state.companies.push(action.payload);
				state.isCompaniesCreated = false;
				state.isCompaniesSuccess = true;
			},
		);

		builder.addCase(addNewCompanies.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isCompaniesCreated = false;
			state.isCompaniesSuccess = false;
		});

		builder.addCase(
			updateCompanies.fulfilled,
			(state, action: PayloadAction<Company>) => {
				state.companies = state.companies.map((company) =>
					company.id === action.payload.id
						? { ...company, ...action.payload }
						: company,
				);
				state.isCompaniesUpdate = true;
				state.isCompaniesUpdateFail = false;
			},
		);

		builder.addCase(updateCompanies.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isCompaniesUpdate = false;
			state.isCompaniesUpdateFail = true;
		});

		builder.addCase(
			deleteCompanies.fulfilled,
			(state, action: PayloadAction<{ companies: string | number }>) => {
				state.companies = state.companies.filter(
					(company) =>
						company.id.toString() !== action.payload.companies.toString(),
				);
				state.isCompaniesDelete = true;
				state.isCompaniesDeleteFail = false;
			},
		);

		builder.addCase(deleteCompanies.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isCompaniesDelete = false;
			state.isCompaniesDeleteFail = true;
		});

		builder.addCase(
			getDeals.fulfilled,
			(state, action: PayloadAction<Deal[]>) => {
				state.deals = action.payload;
			},
		);

		builder.addCase(getDeals.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
		});

		builder.addCase(
			getLeads.fulfilled,
			(state, action: PayloadAction<Lead[]>) => {
				state.leads = action.payload;
				state.isLeadCreated = false;
				state.isLeadsSuccess = true;
			},
		);

		builder.addCase(getLeads.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isLeadCreated = false;
			state.isLeadsSuccess = false;
		});

		builder.addCase(
			addNewLead.fulfilled,
			(state, action: PayloadAction<Lead>) => {
				state.leads.push(action.payload);
				state.isLeadCreated = true;
				state.isLeadsAdd = true;
				state.isLeadsAddFail = false;
			},
		);

		builder.addCase(addNewLead.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isLeadsAdd = false;
			state.isLeadsAddFail = true;
		});

		builder.addCase(
			updateLead.fulfilled,
			(state, action: PayloadAction<Lead>) => {
				state.leads = state.leads.map((lead) =>
					lead.id === action.payload.id ? { ...lead, ...action.payload } : lead,
				);
				state.isLeadsUpdate = true;
				state.isLeadsUpdateFail = false;
			},
		);

		builder.addCase(updateLead.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isLeadsUpdate = false;
			state.isLeadsUpdateFail = true;
		});

		builder.addCase(
			deleteLead.fulfilled,
			(state, action: PayloadAction<{ leads: string | number }>) => {
				state.leads = state.leads.filter(
					(lead) => lead.id.toString() !== action.payload.leads.toString(),
				);
				state.isLeadsDelete = true;
				state.isLeadsDeleteFail = false;
			},
		);

		builder.addCase(deleteLead.rejected, (state, action) => {
			state.error = (action.payload as { error?: unknown })?.error || null;
			state.isLeadsDelete = false;
			state.isLeadsDeleteFail = true;
		});
	},
});

export default crmSlice.reducer;
