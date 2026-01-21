import BasicLogout from "pages/AuthenticationInner/Logout/BasicLogout";
import SlopeCharts from "pages/Charts/ApexCharts/SlopeCharts";
import BlogGridView from "pages/Pages/Blogs/GridView";
import BlogListView from "pages/Pages/Blogs/ListView";
import PageBlogOverview from "pages/Pages/Blogs/Overview";
import Kanbanboard from "pages/Tasks/KanbanBoard";
import { Navigate } from "react-router-dom";
import AboutUsPage from "../pages/AboutUs";
import UiAnimation from "../pages/AdvanceUi/UiAnimation/UiAnimation";
import UiHighlight from "../pages/AdvanceUi/UiHighlight/UiHighlight";
import UiRatings from "../pages/AdvanceUi/UiRatings/UiRatings";
// // Advance Ui
import UiScrollbar from "../pages/AdvanceUi/UiScrollbar/UiScrollbar";
import UiSwiperSlider from "../pages/AdvanceUi/UiSwiperSlider/UiSwiperSlider";
// //APi Key
import APIKey from "../pages/APIKey/index";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
// //login
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import AuthCallback from "../pages/Authentication/Callback";
// // User Profile
import UserProfile from "../pages/Authentication/user-profile";
import Alt404 from "../pages/AuthenticationInner/Errors/Alt404";
import Basic404 from "../pages/AuthenticationInner/Errors/Basic404";
import Cover404 from "../pages/AuthenticationInner/Errors/Cover404";
import Error500 from "../pages/AuthenticationInner/Errors/Error500";
import Offlinepage from "../pages/AuthenticationInner/Errors/Offlinepage";
import BasicLockScreen from "../pages/AuthenticationInner/LockScreen/BasicLockScr";
import CoverLockScreen from "../pages/AuthenticationInner/LockScreen/CoverLockScr";
// //AuthenticationInner pages
import BasicSignIn from "../pages/AuthenticationInner/Login/BasicSignIn";
import CoverSignIn from "../pages/AuthenticationInner/Login/CoverSignIn";
import CoverLogout from "../pages/AuthenticationInner/Logout/CoverLogout";
import BasicPasswCreate from "../pages/AuthenticationInner/PasswordCreate/BasicPasswCreate";
import CoverPasswCreate from "../pages/AuthenticationInner/PasswordCreate/CoverPasswCreate";
import BasicPasswReset from "../pages/AuthenticationInner/PasswordReset/BasicPasswReset";
import CoverPasswReset from "../pages/AuthenticationInner/PasswordReset/CoverPasswReset";
import BasicSignUp from "../pages/AuthenticationInner/Register/BasicSignUp";
import CoverSignUp from "../pages/AuthenticationInner/Register/CoverSignUp";
import BasicSuccessMsg from "../pages/AuthenticationInner/SuccessMessage/BasicSuccessMsg";
import CoverSuccessMsg from "../pages/AuthenticationInner/SuccessMessage/CoverSuccessMsg";
import BasicTwosVerify from "../pages/AuthenticationInner/TwoStepVerification/BasicTwosVerify";
import CoverTwosVerify from "../pages/AuthenticationInner/TwoStepVerification/CoverTwosVerify";
import UiAccordions from "../pages/BaseUi/UiAccordion&Collapse/UiAccordion&Collapse";
// // Base Ui
import UiAlerts from "../pages/BaseUi/UiAlerts/UiAlerts";
import UiBadges from "../pages/BaseUi/UiBadges/UiBadges";
import UiButtons from "../pages/BaseUi/UiButtons/UiButtons";
import UiCards from "../pages/BaseUi/UiCards/UiCards";
import UiCarousel from "../pages/BaseUi/UiCarousel/UiCarousel";
import UiColors from "../pages/BaseUi/UiColors/UiColors";
import UiDropdowns from "../pages/BaseUi/UiDropdowns/UiDropdowns";
import UiEmbedVideo from "../pages/BaseUi/UiEmbedVideo/UiEmbedVideo";
import UiGeneral from "../pages/BaseUi/UiGeneral/UiGeneral";
import UiGrid from "../pages/BaseUi/UiGrid/UiGrid";
import UiImages from "../pages/BaseUi/UiImages/UiImages";
import UiLink from "../pages/BaseUi/UiLinks/UiLinks";
import UiList from "../pages/BaseUi/UiLists/UiLists";
import UiMediaobject from "../pages/BaseUi/UiMediaobject/UiMediaobject";
import UiModals from "../pages/BaseUi/UiModals/UiModals";
import UiNotifications from "../pages/BaseUi/UiNotifications/UiNotifications";
import UiOffcanvas from "../pages/BaseUi/UiOffcanvas/UiOffcanvas";
import UiPlaceholders from "../pages/BaseUi/UiPlaceholders/UiPlaceholders";
import UiProgress from "../pages/BaseUi/UiProgress/UiProgress";
import UiRibbons from "../pages/BaseUi/UiRibbons/UiRibbons";
import UiTabs from "../pages/BaseUi/UiTabs/UiTabs";
import UiTypography from "../pages/BaseUi/UiTypography/UiTypography";
import UiUtilities from "../pages/BaseUi/UiUtilities/UiUtilities";
import BlogPage from "../pages/Blog";
// //Calendar
import Calendar from "../pages/Calendar";
import MonthGrid from "../pages/Calendar/monthGrid";
import AreaCharts from "../pages/Charts/ApexCharts/AreaCharts";
import BarCharts from "../pages/Charts/ApexCharts/BarCharts";
import BoxplotCharts from "../pages/Charts/ApexCharts/BoxplotCharts";
import BubbleChart from "../pages/Charts/ApexCharts/BubbleChart";
import CandlestickChart from "../pages/Charts/ApexCharts/CandlestickChart";
import ColumnCharts from "../pages/Charts/ApexCharts/ColumnCharts";
import FunnelChart from "../pages/Charts/ApexCharts/FunnelCharts/Index";
import HeatmapCharts from "../pages/Charts/ApexCharts/HeatmapCharts";
//Charts
import LineCharts from "../pages/Charts/ApexCharts/LineCharts";
import MixedCharts from "../pages/Charts/ApexCharts/MixedCharts";
import PieCharts from "../pages/Charts/ApexCharts/PieCharts";
import PolarCharts from "../pages/Charts/ApexCharts/PolarCharts";
import RadarCharts from "../pages/Charts/ApexCharts/RadarCharts";
import RadialbarCharts from "../pages/Charts/ApexCharts/RadialbarCharts";
import RangeArea from "../pages/Charts/ApexCharts/RangeAreaCharts/Index";
import ScatterCharts from "../pages/Charts/ApexCharts/ScatterCharts";
import TimelineCharts from "../pages/Charts/ApexCharts/TimelineCharts";
import TreemapCharts from "../pages/Charts/ApexCharts/TreemapCharts";
import ChartsJs from "../pages/Charts/ChartsJs/index";
import Echarts from "../pages/Charts/ECharts/index";
// //Chat
import Chat from "../pages/Chat";
import ContactPage from "../pages/Contact";
// //Crm Pages
import CrmCompanies from "../pages/Crm/CrmCompanies";
import CrmContacts from "../pages/Crm/CrmContacts";
import CrmDeals from "../pages/Crm/CrmDeals/index";
import CrmLeads from "../pages/Crm/CrmLeads/index";
import BuySell from "../pages/Crypto/BuySell";
import CryproOrder from "../pages/Crypto/CryptoOrder";
import ICOList from "../pages/Crypto/ICOList";
import KYCVerification from "../pages/Crypto/KYCVerification";
import MyWallet from "../pages/Crypto/MyWallet";
// //Transactions
import Transactions from "../pages/Crypto/Transactions";
import DashboardCrypto from "../pages/DashboardCrypto";
//Dashboard
import DashboardPitchInvest from "../pages/DashboardPitchInvest";
//Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import ManageProjects from "../pages/Admin/Projects";
import ProjectDetails from "../pages/Admin/Projects/ProjectDetails";
import ProfileApproval from "../pages/Admin/ProfileApproval";
import ManageUsers from "../pages/Admin/Users";
import UserDetails from "../pages/Admin/Users/UserDetails";
import Analytics from "../pages/Admin/Analytics";
import ViewInvoices from "../pages/Admin/Invoices";
import ManagePricing from "../pages/Admin/Pricing";
import Advertising from "../pages/Admin/Advertising";
import SubscriptionsHistory from "../pages/Admin/Subscriptions";
import ManageAuctions from "../pages/Admin/Auctions";
import EcommerceCart from "../pages/Ecommerce/EcommerceCart";
import EcommerceCheckout from "../pages/Ecommerce/EcommerceCheckout";
import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";
import EcommerceOrderDetail from "../pages/Ecommerce/EcommerceOrders/EcommerceOrderDetail";
import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
import EcommerceAddProduct from "../pages/Ecommerce/EcommerceProducts/EcommerceAddProduct";
import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
// // //Ecommerce Pages
import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts/index";
import EcommerceSellerDetail from "../pages/Ecommerce/EcommerceSellers/EcommerceSellerDetail";
import EcommerceSellers from "../pages/Ecommerce/EcommerceSellers/index";
import BasicAction from "../pages/Email/EmailTemplates/BasicAction";
import EcommerceAction from "../pages/Email/EmailTemplates/EcommerceAction";
// // Email box
import MailInbox from "../pages/EmailInbox";
import FileManager from "../pages/FileManager";
// //Forms
import BasicElements from "../pages/Forms/BasicElements/BasicElements";
import CheckBoxAndRadio from "../pages/Forms/CheckboxAndRadio/CheckBoxAndRadio";
import FileUpload from "../pages/Forms/FileUpload/FileUpload";
import FormAdvanced from "../pages/Forms/FormAdvanced/FormAdvanced";
import FormEditor from "../pages/Forms/FormEditor/FormEditor";
import Formlayouts from "../pages/Forms/FormLayouts/Formlayouts";
import FormPickers from "../pages/Forms/FormPickers/FormPickers";
import FormRangeSlider from "../pages/Forms/FormRangeSlider/FormRangeSlider";
import FormSelect from "../pages/Forms/FormSelect/FormSelect";
import FormValidation from "../pages/Forms/FormValidation/FormValidation";
import FormWizard from "../pages/Forms/FormWizard/FormWizard";
import Masks from "../pages/Forms/Masks/Masks";
import Select2 from "../pages/Forms/Select2/Select2";
// Custom Pages
import GalleryPage from "../pages/Gallery";
import GalleryDetailPage from "../pages/Gallery/gallerydetails";
import BoxIcons from "../pages/Icons/BoxIcons/BoxIcons";
import CryptoIcons from "../pages/Icons/CryptoIcons/CryptoIcons";
import FeatherIcons from "../pages/Icons/FeatherIcons/FeatherIcons";
import LineAwesomeIcons from "../pages/Icons/LineAwesomeIcons/LineAwesomeIcons";
import MaterialDesign from "../pages/Icons/MaterialDesign/MaterialDesign";
// //Icon pages
import RemixIcons from "../pages/Icons/RemixIcons/RemixIcons";
import InvestorsPage from "../pages/Investors";
import InvoiceCreate from "../pages/Invoices/InvoiceCreate";
import InvoiceDetails from "../pages/Invoices/InvoiceDetails";
// //Invoices
import InvoiceList from "../pages/Invoices/InvoiceList";
import JobLanding from "../pages/Job_Landing/Job";
import Application from "../pages/Jobs/Application";
import CandidateGrid from "../pages/Jobs/CandidateList/GridView";
import CandidateList from "../pages/Jobs/CandidateList/ListView";
import CompaniesList from "../pages/Jobs/CompaniesList";
import JobCategories from "../pages/Jobs/JobCategories";
import JobGrid from "../pages/Jobs/JobList/Grid";
import JobList from "../pages/Jobs/JobList/List";
import JobOverview from "../pages/Jobs/JobList/Overview";
import NewJobs from "../pages/Jobs/NewJob";
// //Job pages
import Statistics from "../pages/Jobs/Statistics";
import NFTLanding from "../pages/Landing/NFTLanding";
// Landing Index
import OnePage from "../pages/Landing/OnePage";
// //Maps
import GoogleMaps from "../pages/Maps/GoogleMaps/GoogleMaps";
import Collections from "../pages/NFTMarketplace/Collections";
import CreateNFT from "../pages/NFTMarketplace/CreateNFT";
import Creators from "../pages/NFTMarketplace/Creators";
import ExploreNow from "../pages/NFTMarketplace/ExploreNow";
import ItemDetails from "../pages/NFTMarketplace/Itemdetails";
import LiveAuction from "../pages/NFTMarketplace/LiveAuction";
// // NFT Marketplace Pages
import Marketplace from "../pages/NFTMarketplace/Marketplace";
import Ranking from "../pages/NFTMarketplace/Ranking";
import WalletConnect from "../pages/NFTMarketplace/WalletConnect";
import ComingSoon from "../pages/Pages/ComingSoon/ComingSoon";
import Faqs from "../pages/Pages/Faqs/Faqs";
import Gallery from "../pages/Pages/Gallery/Gallery";
import Maintenance from "../pages/Pages/Maintenance/Maintenance";
import Pricing from "../pages/Pages/Pricing/Pricing";
import PrivacyPolicy from "../pages/Pages/PrivacyPolicy";
import Settings from "../pages/Pages/Profile/Settings/Settings";
import ProfileSettings from "../pages/Pages/Profile/ProfileSettings";
import SimplePage from "../pages/Pages/Profile/SimplePage/SimplePage";
import SearchResults from "../pages/Pages/SearchResults/SearchResults";
import SiteMap from "../pages/Pages/SiteMap/SiteMap";
// //pages
import Starter from "../pages/Pages/Starter/Starter";
import Team from "../pages/Pages/Team/Team";
import TermsCondition from "../pages/Pages/TermsCondition";
import Timeline from "../pages/Pages/Timeline/Timeline";
import CreateProject from "../pages/Projects/CreateProject";
// // Project
import ProjectList from "../pages/Projects/ProjectList";
import ProjectOverview from "../pages/Projects/ProjectOverview";
// // Support Tickets
import ListView from "../pages/SupportTickets/ListView";
import TicketsDetails from "../pages/SupportTickets/TicketsDetails";
// //Tables
import BasicTables from "../pages/Tables/BasicTables/BasicTables";
// import ListTables from '../pages/Tables/ListTables/ListTables';
import ReactTable from "../pages/Tables/ReactTables";
// //Task
import TaskDetails from "../pages/Tasks/TaskDetails";
import TaskList from "../pages/Tasks/TaskList";
import ToDoList from "../pages/ToDo";
// // Widgets
import Widgets from "../pages/Widgets/Index";

const authProtectedRoutes = [
	// Custom Routes
	{ path: "/gallery", component: <GalleryPage /> },
	{ path: "/gallery/:id", component: <GalleryDetailPage /> },
	{ path: "/investors", component: <InvestorsPage /> },
	{ path: "/blog", component: <BlogPage /> },
	{ path: "/contact", component: <ContactPage /> },
	{ path: "/about-us", component: <AboutUsPage /> },

	{ path: "/index", component: <DashboardPitchInvest /> },
	{ path: "/dashboard-crypto", component: <DashboardCrypto /> },

	// Admin Routes
	{ path: "/admin/dashboard", component: <AdminDashboard /> },
	{ path: "/admin/projects", component: <ManageProjects /> },
	{ path: "/admin/projects/details", component: <ProjectDetails /> },
	{ path: "/admin/profile-approval", component: <ProfileApproval /> },
	{ path: "/admin/users", component: <ManageUsers /> },
	{ path: "/admin/users/details", component: <UserDetails /> },
	{ path: "/admin/analytics", component: <Analytics /> },
	{ path: "/admin/invoices", component: <ViewInvoices /> },
	{ path: "/admin/pricing", component: <ManagePricing /> },
	{ path: "/admin/advertising", component: <Advertising /> },
	{ path: "/admin/subscriptions", component: <SubscriptionsHistory /> },
	{ path: "/admin/auctions", component: <ManageAuctions /> },

	{ path: "/apps-calendar", component: <Calendar /> },
	{ path: "/apps-calendar-month-grid", component: <MonthGrid /> },
	{ path: "/apps-ecommerce-products", component: <EcommerceProducts /> },
	{
		path: "/apps-ecommerce-product-details/:_id",
		component: <EcommerceProductDetail />,
	},
	{
		path: "/apps-ecommerce-product-details",
		component: <EcommerceProductDetail />,
	},
	{ path: "/apps-ecommerce-add-product", component: <EcommerceAddProduct /> },
	{ path: "/apps-ecommerce-orders", component: <EcommerceOrders /> },
	{
		path: "/apps-ecommerce-order-details",
		component: <EcommerceOrderDetail />,
	},
	{ path: "/apps-ecommerce-customers", component: <EcommerceCustomers /> },
	{ path: "/apps-ecommerce-cart", component: <EcommerceCart /> },
	{ path: "/apps-ecommerce-checkout", component: <EcommerceCheckout /> },
	{ path: "/apps-ecommerce-sellers", component: <EcommerceSellers /> },
	{
		path: "/apps-ecommerce-seller-details",
		component: <EcommerceSellerDetail />,
	},

	{ path: "/apps-file-manager", component: <FileManager /> },
	{ path: "/apps-todo", component: <ToDoList /> },

	// //Chat
	{ path: "/apps-chat", component: <Chat /> },

	// //EMail
	{ path: "/apps-mailbox", component: <MailInbox /> },
	{ path: "/apps-email-basic", component: <BasicAction /> },
	{ path: "/apps-email-ecommerce", component: <EcommerceAction /> },

	// //Projects
	{ path: "/apps-projects-list", component: <ProjectList /> },
	{ path: "/apps-projects-overview", component: <ProjectOverview /> },
	{ path: "/apps-projects-create", component: <CreateProject /> },

	// //Task
	{ path: "/apps-tasks-kanban", component: <Kanbanboard /> },
	{ path: "/apps-tasks-list-view", component: <TaskList /> },
	{ path: "/apps-tasks-details", component: <TaskDetails /> },

	// //Api Key
	{ path: "/apps-api-key", component: <APIKey /> },

	// //Crm
	{ path: "/apps-crm-contacts", component: <CrmContacts /> },
	{ path: "/apps-crm-companies", component: <CrmCompanies /> },
	{ path: "/apps-crm-deals", component: <CrmDeals /> },
	{ path: "/apps-crm-leads", component: <CrmLeads /> },

	// //Invoices
	{ path: "/apps-invoices-list", component: <InvoiceList /> },
	{ path: "/apps-invoices-details", component: <InvoiceDetails /> },
	{ path: "/apps-invoices-create", component: <InvoiceCreate /> },

	// //Supports Tickets
	{ path: "/apps-tickets-list", component: <ListView /> },
	{ path: "/apps-tickets-details", component: <TicketsDetails /> },

	// //transactions
	{ path: "/apps-crypto-transactions", component: <Transactions /> },
	{ path: "/apps-crypto-buy-sell", component: <BuySell /> },
	{ path: "/apps-crypto-orders", component: <CryproOrder /> },
	{ path: "/apps-crypto-wallet", component: <MyWallet /> },
	{ path: "/apps-crypto-ico", component: <ICOList /> },
	{ path: "/apps-crypto-kyc", component: <KYCVerification /> },

	// // NFT Marketplace
	{ path: "/apps-nft-marketplace", component: <Marketplace /> },
	{ path: "/apps-nft-collections", component: <Collections /> },
	{ path: "/apps-nft-create", component: <CreateNFT /> },
	{ path: "/apps-nft-creators", component: <Creators /> },
	{ path: "/apps-nft-explore", component: <ExploreNow /> },
	{ path: "/apps-nft-item-details", component: <ItemDetails /> },
	{ path: "/apps-nft-auction", component: <LiveAuction /> },
	{ path: "/apps-nft-ranking", component: <Ranking /> },
	{ path: "/apps-nft-wallet", component: <WalletConnect /> },

	// //charts
	{ path: "/charts-apex-line", component: <LineCharts /> },
	{ path: "/charts-apex-area", component: <AreaCharts /> },
	{ path: "/charts-apex-column", component: <ColumnCharts /> },
	{ path: "/charts-apex-bar", component: <BarCharts /> },
	{ path: "/charts-apex-mixed", component: <MixedCharts /> },
	{ path: "/charts-apex-timeline", component: <TimelineCharts /> },
	{ path: "/charts-apex-range-area", component: <RangeArea /> },
	{ path: "/charts-apex-funnel", component: <FunnelChart /> },
	{ path: "/charts-apex-candlestick", component: <CandlestickChart /> },
	{ path: "/charts-apex-boxplot", component: <BoxplotCharts /> },
	{ path: "/charts-apex-bubble", component: <BubbleChart /> },
	{ path: "/charts-apex-scatter", component: <ScatterCharts /> },
	{ path: "/charts-apex-heatmap", component: <HeatmapCharts /> },
	{ path: "/charts-apex-treemap", component: <TreemapCharts /> },
	{ path: "/charts-apex-pie", component: <PieCharts /> },
	{ path: "/charts-apex-radialbar", component: <RadialbarCharts /> },
	{ path: "/charts-apex-radar", component: <RadarCharts /> },
	{ path: "/charts-apex-polar", component: <PolarCharts /> },
	{ path: "/charts-apex-slope", component: <SlopeCharts /> },
	{ path: "/charts-chartjs", component: <ChartsJs /> },
	{ path: "/charts-echarts", component: <Echarts /> },

	// // Base Ui
	{ path: "/ui-alerts", component: <UiAlerts /> },
	{ path: "/ui-badges", component: <UiBadges /> },
	{ path: "/ui-buttons", component: <UiButtons /> },
	{ path: "/ui-colors", component: <UiColors /> },
	{ path: "/ui-cards", component: <UiCards /> },
	{ path: "/ui-carousel", component: <UiCarousel /> },
	{ path: "/ui-dropdowns", component: <UiDropdowns /> },
	{ path: "/ui-grid", component: <UiGrid /> },
	{ path: "/ui-images", component: <UiImages /> },
	{ path: "/ui-tabs", component: <UiTabs /> },
	{ path: "/ui-accordions", component: <UiAccordions /> },
	{ path: "/ui-modals", component: <UiModals /> },
	{ path: "/ui-offcanvas", component: <UiOffcanvas /> },
	{ path: "/ui-placeholders", component: <UiPlaceholders /> },
	{ path: "/ui-progress", component: <UiProgress /> },
	{ path: "/ui-notifications", component: <UiNotifications /> },
	{ path: "/ui-media", component: <UiMediaobject /> },
	{ path: "/ui-embed-video", component: <UiEmbedVideo /> },
	{ path: "/ui-typography", component: <UiTypography /> },
	{ path: "/ui-lists", component: <UiList /> },
	{ path: "/ui-links", component: <UiLink /> },
	{ path: "/ui-general", component: <UiGeneral /> },
	{ path: "/ui-ribbons", component: <UiRibbons /> },
	{ path: "/ui-utilities", component: <UiUtilities /> },

	// // Advance Ui
	{ path: "/advance-ui-scrollbar", component: <UiScrollbar /> },
	{ path: "/advance-ui-animation", component: <UiAnimation /> },
	{ path: "/advance-ui-swiper", component: <UiSwiperSlider /> },
	{ path: "/advance-ui-ratings", component: <UiRatings /> },
	{ path: "/advance-ui-highlight", component: <UiHighlight /> },

	// // Widgets
	{ path: "/widgets", component: <Widgets /> },

	// // Forms
	{ path: "/forms-elements", component: <BasicElements /> },
	{ path: "/forms-select", component: <FormSelect /> },
	{ path: "/forms-checkboxes-radios", component: <CheckBoxAndRadio /> },
	{ path: "/forms-pickers", component: <FormPickers /> },
	{ path: "/forms-masks", component: <Masks /> },
	{ path: "/forms-advanced", component: <FormAdvanced /> },
	{ path: "/forms-range-sliders", component: <FormRangeSlider /> },
	{ path: "/forms-validation", component: <FormValidation /> },
	{ path: "/forms-wizard", component: <FormWizard /> },
	{ path: "/forms-editors", component: <FormEditor /> },
	{ path: "/forms-file-uploads", component: <FileUpload /> },
	{ path: "/forms-layouts", component: <Formlayouts /> },
	{ path: "/forms-select2", component: <Select2 /> },

	// //Tables
	{ path: "/tables-basic", component: <BasicTables /> },
	// { path: "/tables-listjs", component: <ListTables /> },
	{ path: "/tables-react", component: <ReactTable /> },

	// //Icons
	{ path: "/icons-remix", component: <RemixIcons /> },
	{ path: "/icons-boxicons", component: <BoxIcons /> },
	{ path: "/icons-materialdesign", component: <MaterialDesign /> },
	{ path: "/icons-feather", component: <FeatherIcons /> },
	{ path: "/icons-lineawesome", component: <LineAwesomeIcons /> },
	{ path: "/icons-crypto", component: <CryptoIcons /> },

	// //Maps
	{ path: "/maps-google", component: <GoogleMaps /> },

	// //Pages
	{ path: "/pages-starter", component: <Starter /> },
	{ path: "/pages-profile", component: <SimplePage /> },
	{ path: "/pages-profile-settings", component: <ProfileSettings /> },
	{ path: "/pages-team", component: <Team /> },
	{ path: "/pages-timeline", component: <Timeline /> },
	{ path: "/pages-faqs", component: <Faqs /> },
	{ path: "/pages-gallery", component: <Gallery /> },
	{ path: "/pages-pricing", component: <Pricing /> },
	{ path: "/pages-sitemap", component: <SiteMap /> },
	{ path: "/pages-search-results", component: <SearchResults /> },
	{ path: "/pages-privacy-policy", component: <PrivacyPolicy /> },
	{ path: "/pages-terms-condition", component: <TermsCondition /> },
	{ path: "/pages-blog-list", component: <BlogListView /> },
	{ path: "/pages-blog-grid", component: <BlogGridView /> },
	{ path: "/pages-blog-overview", component: <PageBlogOverview /> },

	// //Job pages
	{ path: "/apps-job-statistics", component: <Statistics /> },
	{ path: "/apps-job-lists", component: <JobList /> },
	{ path: "/apps-job-grid-lists", component: <JobGrid /> },
	{ path: "/apps-job-details", component: <JobOverview /> },
	{ path: "/apps-job-candidate-lists", component: <CandidateList /> },
	{ path: "/apps-job-candidate-grid", component: <CandidateGrid /> },
	{ path: "/apps-job-application", component: <Application /> },
	{ path: "/apps-job-new", component: <NewJobs /> },
	{ path: "/apps-job-companies-lists", component: <CompaniesList /> },
	{ path: "/apps-job-categories", component: <JobCategories /> },

	//User Profile
	{ path: "/profile", component: <UserProfile /> },

	// this route should be at the end of all other routes
	// eslint-disable-next-line react/display-name
	{
		path: "/",
		exact: true,
		component: <Navigate to="/admin/dashboard" />,
	},
	{ path: "*", component: <Navigate to="/admin/dashboard" /> },
];

const publicRoutes = [
	// Redirect root and dashboard to admin dashboard
	{ path: "/", component: <Navigate to="/admin/dashboard" replace /> },
	{ path: "/dashboard", component: <Navigate to="/admin/dashboard" replace /> },
	{ path: "/index", component: <DashboardPitchInvest /> },

	// Authentication Page
	{ path: "/logout", component: <Logout /> },
	{ path: "/login", component: <Login /> },
	{ path: "/forgot-password", component: <ForgetPasswordPage /> },
	{ path: "/register", component: <Register /> },
	{ path: "/auth/callback", component: <AuthCallback /> },

	// //AuthenticationInner pages
	{ path: "/auth-signin-basic", component: <BasicSignIn /> },
	{ path: "/auth-signin-cover", component: <CoverSignIn /> },
	{ path: "/auth-signup-basic", component: <BasicSignUp /> },
	{ path: "/auth-signup-cover", component: <CoverSignUp /> },
	{ path: "/auth-pass-reset-basic", component: <BasicPasswReset /> },
	{ path: "/auth-pass-reset-cover", component: <CoverPasswReset /> },
	{ path: "/auth-lockscreen-basic", component: <BasicLockScreen /> },
	{ path: "/auth-lockscreen-cover", component: <CoverLockScreen /> },
	{ path: "/auth-logout-basic", component: <BasicLogout /> },
	{ path: "/auth-logout-cover", component: <CoverLogout /> },
	{ path: "/auth-success-msg-basic", component: <BasicSuccessMsg /> },
	{ path: "/auth-success-msg-cover", component: <CoverSuccessMsg /> },
	{ path: "/auth-twostep-basic", component: <BasicTwosVerify /> },
	{ path: "/auth-twostep-cover", component: <CoverTwosVerify /> },
	{ path: "/auth-404-basic", component: <Basic404 /> },
	{ path: "/auth-404-cover", component: <Cover404 /> },
	{ path: "/auth-404-alt", component: <Alt404 /> },
	{ path: "/auth-500", component: <Error500 /> },

	{ path: "/landing", component: <OnePage /> },
	{ path: "/nft-landing", component: <NFTLanding /> },
	{ path: "/job-landing", component: <JobLanding /> },

	{ path: "/auth-pass-change-basic", component: <BasicPasswCreate /> },
	{ path: "/auth-pass-change-cover", component: <CoverPasswCreate /> },
	{ path: "/auth-offline", component: <Offlinepage /> },

	{ path: "/pages-maintenance", component: <Maintenance /> },
	{ path: "/pages-coming-soon", component: <ComingSoon /> },
];

export { authProtectedRoutes, publicRoutes };
