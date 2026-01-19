import { combineReducers } from "redux";
// API Key
import APIKeyReducer from "./apiKey/reducer";
import ForgetPasswordReducer from "./auth/forgetpwd/reducer";
// Authentication
import LoginReducer from "./auth/login/reducer";
import ProfileReducer from "./auth/profile/reducer";
import AccountReducer from "./auth/register/reducer";

//Calendar
import CalendarReducer from "./calendar/reducer";
//Chat
import chatReducer from "./chat/reducer";
//Crm
import CrmReducer from "./crm/reducer";
//Crypto
import CryptoReducer from "./crypto/reducer";
// Dashboard Crypto
import DashboardCryptoReducer from "./dashboardCrypto/reducer";
//Ecommerce
import EcommerceReducer from "./ecommerce/reducer";
// File Manager
import FileManagerReducer from "./fileManager/reducer";
//Invoice
import InvoiceReducer from "./invoice/reducer";
// Job
import JobReducer from "./jobs/reducer";
// Front
import LayoutReducer from "./layouts/reducer";
//Mailbox
import MailboxReducer from "./mailbox/reducer";
//Project
import ProjectsReducer from "./projects/reducer";
// Tasks
import TasksReducer from "./tasks/reducer";
// Pages > Team
import TeamDataReducer from "./team/reducer";
//TicketsList
import TicketsReducer from "./tickets/reducer";
// To do
import TodosReducer from "./todos/reducer";

const rootReducer = combineReducers({
	Layout: LayoutReducer,
	Login: LoginReducer,
	Account: AccountReducer,
	ForgetPassword: ForgetPasswordReducer,
	Profile: ProfileReducer,
	Calendar: CalendarReducer,
	Chat: chatReducer,
	Projects: ProjectsReducer,
	Ecommerce: EcommerceReducer,
	Tasks: TasksReducer,
	Crypto: CryptoReducer,
	Tickets: TicketsReducer,
	Crm: CrmReducer,
	Invoice: InvoiceReducer,
	Mailbox: MailboxReducer,
	DashboardCrypto: DashboardCryptoReducer,
	Team: TeamDataReducer,
	FileManager: FileManagerReducer,
	Todos: TodosReducer,
	Jobs: JobReducer,
	APIKey: APIKeyReducer,
});

export default rootReducer;
