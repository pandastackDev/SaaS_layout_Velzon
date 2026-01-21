import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Table,
	Button,
	Badge,
	Input,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Spinner,
	Label,
	Form,
	FormFeedback,
} from "reactstrap";
import { showToast } from "../../../lib/toast";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton, KPICardsSkeleton } from "../../../Components/Common/LoadingSkeleton";
import CountUp from "react-countup";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Auction {
	id: string;
	project_id: string;
	title: string;
	description?: string;
	start_date: string;
	end_date: string;
	starting_bid: number;
	current_bid: number;
	minimum_increment: number;
	currency: string;
	status: string;
	created_at: string;
	project?: {
		title: string;
		cover_image_url?: string;
	};
	bids_count?: number;
	// Timing fields
	proposal_status: 'inactive' | 'active' | 'ended' | 'cancelled';
	activated_at?: string;
	duration_days?: number;
	ends_at?: string;
	ended_at?: string;
	cancelled_at?: string;
	cancel_reason?: string;
}

interface Project {
	id: string;
	title: string;
	cover_image_url?: string;
}

interface Bid {
	id: string;
	auction_id_new: string;  // Changed from auction_id
	user_id: string;
	bid_amount: number;  // Changed from amount
	status: string;
	created_at: string;
	user?: {
		full_name: string;
		personal_email: string;
	};
}

const ManageAuctions = () => {
	document.title = "Manage Auctions | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [auctions, setAuctions] = useState<Auction[]>([]);
	const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
	const [bidsModal, setBidsModal] = useState(false);
	const [bids, setBids] = useState<Bid[]>([]);
	const [loadingBids, setLoadingBids] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [auctionToDelete, setAuctionToDelete] = useState<Auction | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [createModal, setCreateModal] = useState(false);
	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		completed: 0,
		totalBids: 0,
	});
	// Timing settings
	const [showTimingModal, setShowTimingModal] = useState(false);
	const [timingThreshold, setTimingThreshold] = useState(24); // 24h or 48h
	const [allowedDurations, setAllowedDurations] = useState([3, 7, 10]); // days

	useEffect(() => {
		if (adminLoading) return;

		if (!isAdmin && !adminLoading) {
			navigate("/admin/dashboard", { replace: true });
			return;
		}

		if (isAdmin) {
			loadAuctions();
			loadProjects();
		}
	}, [isAdmin, adminLoading, navigate]);

	useEffect(() => {
		filterAuctions();
		setCurrentPage(1);
	}, [auctions, searchTerm, statusFilter]);

	const loadAuctions = async () => {
		try {
			setLoading(true);
			
			const { data: auctionsData, error } = await supabase
				.from("auctions")
				.select(`
					*,
					projects (
						id,
						title,
						cover_image_url
					)
				`)
				.order("created_at", { ascending: false });

			if (error) {
				if (error.code === "PGRST116" || error.message?.includes("relation")) {
					showToast.warning("Auctions table not found. Please create the 'auctions' table in Supabase.");
					setAuctions([]);
					setFilteredAuctions([]);
					return;
				}
				throw error;
			}

			// Get bid counts for each auction
			const auctionsWithCounts = await Promise.all(
				(auctionsData || []).map(async (auction) => {
					const { count } = await supabase
						.from("bids")
						.select("*", { count: "exact", head: true })
						.eq("auction_id_new", auction.id);

					return {
						...auction,
						project: Array.isArray(auction.projects) ? auction.projects[0] : auction.projects,
						bids_count: count || 0,
					};
				})
			);

			setAuctions(auctionsWithCounts);
			setFilteredAuctions(auctionsWithCounts);

			// Calculate stats
			const total = auctionsWithCounts.length;
			const active = auctionsWithCounts.filter(a => a.status === "active").length;
			const completed = auctionsWithCounts.filter(a => a.status === "completed").length;
			const totalBids = auctionsWithCounts.reduce((sum, a) => sum + (a.bids_count || 0), 0);

			setStats({ total, active, completed, totalBids });
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
			setAuctions([]);
			setFilteredAuctions([]);
		} finally {
			setLoading(false);
		}
	};

	// Calculate time remaining with proper formatting
	const getTimeRemaining = (endsAt: string | undefined) => {
		if (!endsAt) return null;

		const now = new Date().getTime();
		const end = new Date(endsAt).getTime();
		const diff = end - now;

		if (diff <= 0) return { expired: true, display: "Ended" };

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		const hoursRemaining = days * 24 + hours;

		// Threshold logic (24h or 48h based on admin setting)
		if (hoursRemaining > timingThreshold) {
			// Above threshold: show Days + Hours
			return {
				expired: false,
				display: `${days}d ${hours}h`,
				days,
				hours,
				minutes,
				seconds,
				showSeconds: false
			};
		} else {
			// Below threshold: show Hours + Minutes + Seconds
			return {
				expired: false,
				display: `${hoursRemaining}h ${minutes}m ${seconds}s`,
				hours: hoursRemaining,
				minutes,
				seconds,
				showSeconds: true
			};
		}
	};

	// Activate proposal (admin can test this)
	const handleActivateProposal = async (auctionId: string, durationDays: number) => {
		try {
			const now = new Date();
			const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

			const { error } = await supabase
				.from('auctions')
				.update({
					proposal_status: 'active',
					activated_at: now.toISOString(),
					duration_days: durationDays,
					ends_at: endsAt.toISOString(),
					status: 'active',
				})
				.eq('id', auctionId);

			if (error) throw error;

			showToast.success(`Auction activated for ${durationDays} days!`);
			loadAuctions();
		} catch (error: any) {
			console.error('Error activating proposal:', error);
			showToast.error('Failed to activate proposal');
		}
	};

	// End proposal manually
	const handleEndProposal = async (auctionId: string) => {
		try {
			const now = new Date();

			const { error } = await supabase
				.from('auctions')
				.update({
					proposal_status: 'ended',
					ended_at: now.toISOString(),
					status: 'completed',
				})
				.eq('id', auctionId);

			if (error) throw error;

			showToast.success('Auction ended successfully!');
			loadAuctions();
		} catch (error: any) {
			console.error('Error ending proposal:', error);
			showToast.error('Failed to end proposal');
		}
	};

	// Cancel proposal
	const handleCancelProposal = async (auctionId: string, reason: string) => {
		try {
			const now = new Date();

			const { error } = await supabase
				.from('auctions')
				.update({
					proposal_status: 'cancelled',
					cancelled_at: now.toISOString(),
					cancel_reason: reason,
					status: 'cancelled',
				})
				.eq('id', auctionId);

			if (error) throw error;

			showToast.success('Auction cancelled successfully!');
			loadAuctions();
		} catch (error: any) {
			console.error('Error cancelling proposal:', error);
			showToast.error('Failed to cancel proposal');
		}
	};

	// Update threshold setting
	const handleUpdateThreshold = (newThreshold: number) => {
		setTimingThreshold(newThreshold);
		showToast.success(`Countdown threshold updated to ${newThreshold} hours`);
		localStorage.setItem('auction_timing_threshold', newThreshold.toString());
	};

	// Update allowed durations
	const handleUpdateDurations = (durations: number[]) => {
		setAllowedDurations(durations);
		showToast.success('Allowed durations updated');
		localStorage.setItem('auction_allowed_durations', JSON.stringify(durations));
	};

	// Load settings from localStorage on mount
	useEffect(() => {
		const savedThreshold = localStorage.getItem('auction_timing_threshold');
		if (savedThreshold) setTimingThreshold(Number(savedThreshold));

		const savedDurations = localStorage.getItem('auction_allowed_durations');
		if (savedDurations) setAllowedDurations(JSON.parse(savedDurations));
	}, []);

	const filterAuctions = () => {
		let filtered = [...auctions];
		if (searchTerm) {
			filtered = filtered.filter((a) =>
				a.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (statusFilter !== "all") {
			filtered = filtered.filter((a) => a.status === statusFilter);
		}
		setFilteredAuctions(filtered);
	};

	const loadProjects = async () => {
		try {
			const { data, error } = await supabase
				.from("projects")
				.select("id, title, cover_image_url")
				.order("created_at", { ascending: false });

			if (error) throw error;

			setProjects(data || []);
		} catch (error: any) {
			console.warn("Could not load projects for auctions", error?.message || error);
			setProjects([]);
		}
	};

	const loadBids = async (auctionId: string) => {
		try {
			setLoadingBids(true);
			const { data, error } = await supabase
				.from("bids")
				.select(`
					*,
					users (
						full_name,
						personal_email
					)
				`)
				.eq("auction_id_new", auctionId)
				.order("bid_amount", { ascending: false });

			if (error) throw error;

			setBids(
				(data || []).map((bid) => ({
					...bid,
					user: Array.isArray(bid.users) ? bid.users[0] : bid.users,
				}))
			);
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to load bids: ${errorMsg}`);
			setBids([]);
		} finally {
			setLoadingBids(false);
		}
	};

	const handleViewBids = (auction: Auction) => {
		setSelectedAuction(auction);
		setBidsModal(true);
		loadBids(auction.id);
	};

	const handleEdit = (auction: Auction) => {
		setSelectedAuction(auction);
		validation.setValues({
			starting_bid: auction.starting_bid,
			minimum_increment: auction.minimum_increment,
			start_date: auction.start_date?.split('T')[0] || "",
			end_date: auction.end_date?.split('T')[0] || "",
			status: auction.status,
		});
		setEditModal(true);
	};

	const handleDeleteClick = (auction: Auction) => {
		setAuctionToDelete(auction);
		setDeleteModal(true);
	};

	const handleAcceptBid = async (bid: Bid) => {
		try {
			const { error } = await supabase
				.from("bids")
				.update({ status: "accepted" })
				.eq("id", bid.id);

			if (error) throw error;

			// Update current bid in auction if this is higher
			if (selectedAuction && bid.bid_amount > selectedAuction.current_bid) {
				await supabase
					.from("auctions")
					.update({ current_bid: bid.bid_amount })
					.eq("id", bid.auction_id_new);
			}

			showToast.success("Bid accepted successfully!");
			if (selectedAuction) {
				loadBids(selectedAuction.id);
			}
			await loadAuctions();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to accept bid: ${errorMsg}`);
		}
	};

	const handleRejectBid = async (bid: Bid) => {
		try {
			const { error } = await supabase
				.from("bids")
				.update({ status: "rejected" })
				.eq("id", bid.id);

			if (error) throw error;

			showToast.success("Bid rejected successfully!");
			if (selectedAuction) {
				loadBids(selectedAuction.id);
			}
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(`Failed to reject bid: ${errorMsg}`);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!auctionToDelete) return;

		try {
			setDeleting(true);
			const { error } = await supabase
				.from("auctions")
				.delete()
				.eq("id", auctionToDelete.id);

			if (error) throw error;

			showToast.success("Auction deleted successfully!");
			setDeleteModal(false);
			setAuctionToDelete(null);
			await loadAuctions();
		} catch (error: any) {
			const errorMsg = getErrorMessage(error);
			showToast.error(errorMsg);
		} finally {
			setDeleting(false);
		}
	};

	const validation = useFormik({
		enableReinitialize: true,
		initialValues: {
			starting_bid: selectedAuction?.starting_bid || 0,
			minimum_increment: selectedAuction?.minimum_increment || 100,
			start_date: selectedAuction?.start_date?.split('T')[0] || "",
			end_date: selectedAuction?.end_date?.split('T')[0] || "",
			status: selectedAuction?.status || "active",
			currency: selectedAuction?.currency || "USD",
		},
		validationSchema: Yup.object({
			starting_bid: Yup.number().min(0, "Must be positive").required("Starting bid is required"),
			minimum_increment: Yup.number().min(1, "Must be at least 1").required("Minimum increment is required"),
			start_date: Yup.string().required("Start date is required"),
			end_date: Yup.string().required("End date is required"),
			currency: Yup.string().required("Currency is required"),
		}),
		onSubmit: async (values) => {
			if (!selectedAuction) return;

			try {
				const { error } = await supabase
					.from("auctions")
					.update({
						starting_bid: values.starting_bid,
						minimum_increment: values.minimum_increment,
						start_date: values.start_date,
						end_date: values.end_date,
						status: values.status,
						currency: values.currency,
					})
					.eq("id", selectedAuction.id);

				if (error) throw error;

				showToast.success("Auction updated successfully!");
				setEditModal(false);
				setSelectedAuction(null);
				await loadAuctions();
			} catch (error: any) {
				const errorMsg = getErrorMessage(error);
				showToast.error(errorMsg);
			}
		},
	});

	const createValidation = useFormik({
		initialValues: {
			project_id: "",
			title: "",
			starting_bid: 0,
			minimum_increment: 100,
			start_date: "",
			end_date: "",
			status: "pending",
			currency: "USD",
		},
		validationSchema: Yup.object({
			project_id: Yup.string().required("Project is required"),
			title: Yup.string().required("Title is required"),
			starting_bid: Yup.number().min(0, "Must be positive").required("Starting bid is required"),
			minimum_increment: Yup.number().min(1, "Must be at least 1").required("Minimum increment is required"),
			start_date: Yup.string().required("Start date is required"),
			end_date: Yup.string().required("End date is required"),
			status: Yup.string().required("Status is required"),
			currency: Yup.string().required("Currency is required"),
		}),
		onSubmit: async (values, { resetForm }) => {
			try {
				const { error } = await supabase.from("auctions").insert({
					project_id: values.project_id,
					title: values.title,
					start_date: values.start_date,
					end_date: values.end_date,
					starting_bid: values.starting_bid,
					current_bid: values.starting_bid,
					minimum_increment: values.minimum_increment,
					currency: values.currency,
					status: values.status,
				});

				if (error) throw error;

				showToast.success("Auction created successfully!");
				resetForm();
				setCreateModal(false);
				await loadAuctions();
			} catch (error: any) {
				const errorMsg = getErrorMessage(error);
				showToast.error(errorMsg);
			}
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-success">Active</Badge>;
			case "completed":
				return <Badge className="bg-primary">Completed</Badge>;
			case "cancelled":
				return <Badge className="bg-danger">Cancelled</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	const getBidStatusBadge = (status: string) => {
		switch (status) {
			case "accepted":
				return <Badge className="bg-success">Accepted</Badge>;
			case "rejected":
				return <Badge className="bg-danger">Rejected</Badge>;
			case "pending":
				return <Badge className="bg-warning">Pending</Badge>;
			default:
				return <Badge className="bg-secondary">{status}</Badge>;
		}
	};

	const formatCurrency = (amount: number, currency: string = "USD") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Manage Auctions" pageTitle="Admin" />
					<KPICardsSkeleton />
					<Row className="mt-4">
						<Col xs={12}>
							<TablePageSkeleton columns={7} rows={8} />
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	const indexOfLastData = currentPage * perPageData;
	const indexOfFirstData = indexOfLastData - perPageData;
	const currentAuctions = filteredAuctions.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Manage Auctions" pageTitle="Admin" />

				{/* KPI Cards */}
				<Row>
					<Col xl={3} md={6}>
						<Card className="card-animate">

		{/* Create Auction Modal */}
		<Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="lg" centered>
			<ModalHeader toggle={() => setCreateModal(false)}>Create Auction</ModalHeader>
			<ModalBody>
				<Form
					onSubmit={(e) => {
						e.preventDefault();
						createValidation.handleSubmit();
						return false;
					}}
				>
					<Row>
						<Col md={12}>
							<div className="mb-3">
								<Label>Project *</Label>
								<Input
									type="select"
									name="project_id"
									value={createValidation.values.project_id}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.project_id && createValidation.errors.project_id)}
								>
									<option value="">Select project</option>
									{projects.map((project) => (
										<option key={project.id} value={project.id}>
											{project.title}
										</option>
									))}
								</Input>
								{createValidation.touched.project_id && createValidation.errors.project_id ? (
									<FormFeedback type="invalid">
										{createValidation.errors.project_id}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={12}>
							<div className="mb-3">
								<Label>Auction Title *</Label>
								<Input
									type="text"
									name="title"
									placeholder="Enter auction title"
									value={createValidation.values.title}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.title && createValidation.errors.title)}
								/>
								{createValidation.touched.title && createValidation.errors.title ? (
									<FormFeedback type="invalid">
										{createValidation.errors.title}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>Starting Bid *</Label>
								<Input
									type="number"
									name="starting_bid"
									value={createValidation.values.starting_bid}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.starting_bid && createValidation.errors.starting_bid)}
								/>
								{createValidation.touched.starting_bid && createValidation.errors.starting_bid ? (
									<FormFeedback type="invalid">
										{createValidation.errors.starting_bid}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>Minimum Increment *</Label>
								<Input
									type="number"
									name="minimum_increment"
									value={createValidation.values.minimum_increment}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.minimum_increment && createValidation.errors.minimum_increment)}
								/>
								{createValidation.touched.minimum_increment && createValidation.errors.minimum_increment ? (
									<FormFeedback type="invalid">
										{createValidation.errors.minimum_increment}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>Start Date *</Label>
								<Input
									type="date"
									name="start_date"
									value={createValidation.values.start_date}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.start_date && createValidation.errors.start_date)}
								/>
								{createValidation.touched.start_date && createValidation.errors.start_date ? (
									<FormFeedback type="invalid">
										{createValidation.errors.start_date}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>End Date *</Label>
								<Input
									type="date"
									name="end_date"
									value={createValidation.values.end_date}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.end_date && createValidation.errors.end_date)}
								/>
								{createValidation.touched.end_date && createValidation.errors.end_date ? (
									<FormFeedback type="invalid">
										{createValidation.errors.end_date}
									</FormFeedback>
								) : null}
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>Status *</Label>
								<Input
									type="select"
									name="status"
									value={createValidation.values.status}
									onChange={createValidation.handleChange}
								>
									<option value="pending">Pending</option>
									<option value="active">Active</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
								</Input>
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<Label>Currency *</Label>
								<Input
									type="text"
									name="currency"
									value={createValidation.values.currency}
									onChange={createValidation.handleChange}
									onBlur={createValidation.handleBlur}
									invalid={!!(createValidation.touched.currency && createValidation.errors.currency)}
								/>
								{createValidation.touched.currency && createValidation.errors.currency ? (
									<FormFeedback type="invalid">
										{createValidation.errors.currency}
									</FormFeedback>
								) : null}
							</div>
						</Col>
					</Row>
				</Form>
			</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={() => setCreateModal(false)}>
					Cancel
				</Button>
				<Button color="primary" onClick={() => createValidation.handleSubmit()}>
					<i className="ri-save-line me-1"></i>Create Auction
				</Button>
			</ModalFooter>
		</Modal>
							<CardBody>
								<div className="d-flex align-items-center">
									<div className="flex-grow-1 overflow-hidden">
										<p className="text-uppercase fw-medium text-muted text-truncate mb-0">
											Total Auctions
										</p>
									</div>
									<div className="flex-shrink-0">
										<h5 className="text-success fs-14 mb-0">
											<i className="ri-auction-line align-middle"></i>
										</h5>
									</div>
								</div>
								<div className="d-flex align-items-end justify-content-between mt-2">
									<div>
										<h4 className="fs-22 fw-semibold ff-secondary mb-2">
											<CountUp start={0} end={stats.total} duration={2} />
										</h4>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>

					<Col xl={3} md={6}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex align-items-center">
									<div className="flex-grow-1 overflow-hidden">
										<p className="text-uppercase fw-medium text-muted text-truncate mb-0">
											Active Auctions
										</p>
									</div>
									<div className="flex-shrink-0">
										<h5 className="text-success fs-14 mb-0">
											<i className="ri-play-circle-line align-middle"></i>
										</h5>
									</div>
								</div>
								<div className="d-flex align-items-end justify-content-between mt-2">
									<div>
										<h4 className="fs-22 fw-semibold ff-secondary mb-2">
											<CountUp start={0} end={stats.active} duration={2} />
										</h4>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>

					<Col xl={3} md={6}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex align-items-center">
									<div className="flex-grow-1 overflow-hidden">
										<p className="text-uppercase fw-medium text-muted text-truncate mb-0">
											Completed
										</p>
									</div>
									<div className="flex-shrink-0">
										<h5 className="text-info fs-14 mb-0">
											<i className="ri-checkbox-circle-line align-middle"></i>
										</h5>
									</div>
								</div>
								<div className="d-flex align-items-end justify-content-between mt-2">
									<div>
										<h4 className="fs-22 fw-semibold ff-secondary mb-2">
											<CountUp start={0} end={stats.completed} duration={2} />
										</h4>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>

					<Col xl={3} md={6}>
						<Card className="card-animate">
							<CardBody>
								<div className="d-flex align-items-center">
									<div className="flex-grow-1 overflow-hidden">
										<p className="text-uppercase fw-medium text-muted text-truncate mb-0">
											Total Bids
										</p>
									</div>
									<div className="flex-shrink-0">
										<h5 className="text-warning fs-14 mb-0">
											<i className="ri-hand-coin-line align-middle"></i>
										</h5>
									</div>
								</div>
								<div className="d-flex align-items-end justify-content-between mt-2">
									<div>
										<h4 className="fs-22 fw-semibold ff-secondary mb-2">
											<CountUp start={0} end={stats.totalBids} duration={2} />
										</h4>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Auctions Table */}
				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<div className="d-flex align-items-center gap-2">
									<h4 className="card-title mb-0">Auctions Management</h4>
									<Button
										color="info"
										outline
										size="sm"
										onClick={() => setShowTimingModal(true)}
									>
										<i className="ri-settings-3-line me-1"></i>
										Timing Settings
									</Button>
								</div>
								<div className="d-flex gap-2">
									<Input
										type="text"
										placeholder="Search auctions..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										style={{ maxWidth: "250px" }}
									/>
									<Input
										type="select"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										style={{ maxWidth: "150px" }}
									>
										<option value="all">All Status</option>
										<option value="pending">Pending</option>
										<option value="active">Active</option>
										<option value="completed">Completed</option>
										<option value="cancelled">Cancelled</option>
									</Input>
									<Button color="primary" onClick={() => setCreateModal(true)}>
										<i className="ri-add-line me-1"></i>New Auction
									</Button>
								</div>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>Image</th>
												<th>Project</th>
												<th>Current Bid</th>
												<th>Min Increment</th>
												<th>Start Date</th>
												<th>End Date</th>
												<th>Bids</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredAuctions.length === 0 ? (
												<tr>
													<td colSpan={9} className="text-center py-4">
														<p className="text-muted mb-0">No auctions found</p>
													</td>
												</tr>
											) : (
												currentAuctions.map((auction) => (
													<tr key={auction.id}>
														<td>
															<div style={{ width: "60px", height: "60px" }}>
																{auction.project?.cover_image_url ? (
																	<img
																	src={auction.project.cover_image_url}
																		alt={auction.project.title}
																		style={{
																			width: "100%",
																			height: "100%",
																			objectFit: "cover",
																			borderRadius: "4px",
																		}}
																	/>
																) : (
																	<div
																		className="bg-light d-flex align-items-center justify-content-center"
																		style={{
																			width: "100%",
																			height: "100%",
																			borderRadius: "4px",
																		}}
																	>
																		<i className="ri-auction-line text-muted fs-20"></i>
																	</div>
																)}
															</div>
														</td>
														<td>
															<h6 className="mb-0">{auction.project?.title || "N/A"}</h6>
															<small className="text-muted">
																Starting: {formatCurrency(auction.starting_bid, auction.currency)}
															</small>
														</td>
														<td>
															<h6 className="text-success mb-0">
																{formatCurrency(auction.current_bid, auction.currency)}
															</h6>
														</td>
														<td>
															<span className="badge bg-primary-subtle text-primary">
																{formatCurrency(auction.minimum_increment, auction.currency)}
															</span>
														</td>
														<td>{new Date(auction.start_date).toLocaleDateString()}</td>
														<td>{new Date(auction.end_date).toLocaleDateString()}</td>
														<td>
															<Badge className="bg-info-subtle text-info">
																{auction.bids_count || 0} bids
															</Badge>
														</td>
														<td>{getStatusBadge(auction.status)}</td>
														<td>
															<UncontrolledDropdown>
																<DropdownToggle
																	tag="button"
																	className="btn btn-soft-secondary btn-sm"
																>
																	<i className="ri-more-fill"></i>
																</DropdownToggle>
																<DropdownMenu>
																	<DropdownItem onClick={() => handleViewBids(auction)}>
																		<i className="ri-eye-line me-2"></i>View Bids
																	</DropdownItem>
																	<DropdownItem onClick={() => handleEdit(auction)}>
																		<i className="ri-edit-line me-2"></i>Edit Auction
																	</DropdownItem>
																	<DropdownItem divider />
																	<DropdownItem onClick={() => handleDeleteClick(auction)}>
																		<i className="ri-delete-bin-line me-2 text-danger"></i>
																		Delete
																	</DropdownItem>
																</DropdownMenu>
															</UncontrolledDropdown>
														</td>
													</tr>
												))
											)}
										</tbody>
									</Table>
								</div>
								{filteredAuctions.length > 0 && (
									<Pagination
										data={filteredAuctions}
										currentPage={currentPage}
										setCurrentPage={setCurrentPage}
										perPageData={perPageData}
									/>
								)}
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Bids Modal */}
			<Modal isOpen={bidsModal} toggle={() => setBidsModal(false)} size="lg" centered>
				<ModalHeader toggle={() => setBidsModal(false)}>
					Bids for "{selectedAuction?.project?.title}"
				</ModalHeader>
				<ModalBody>
					{loadingBids ? (
						<div className="text-center py-4">
							<Spinner color="primary" />
							<p className="mt-2">Loading bids...</p>
						</div>
					) : bids.length === 0 ? (
						<div className="text-center py-4">
							<i className="ri-auction-line text-muted" style={{ fontSize: "3rem" }}></i>
							<p className="text-muted mt-3 mb-0">No bids yet for this auction</p>
						</div>
					) : (
						<Table className="table-nowrap align-middle mb-0">
							<thead className="table-light">
								<tr>
									<th>Bidder</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Bid Time</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{bids.map((bid) => (
									<tr key={bid.id}>
										<td>
											<div>
												<p className="mb-0 fw-medium">{bid.user?.full_name || "N/A"}</p>
												<small className="text-muted">{bid.user?.personal_email || ""}</small>
											</div>
										</td>
										<td>
											<h6 className="text-success mb-0">
												${bid.bid_amount.toLocaleString()}
											</h6>
										</td>
										<td>{getBidStatusBadge(bid.status)}</td>
										<td>{new Date(bid.created_at).toLocaleString()}</td>
										<td>
											{bid.status === 'pending' && (
												<div className="d-flex gap-2">
													<Button
														size="sm"
														color="success"
														outline
														onClick={() => handleAcceptBid(bid)}
													>
														<i className="ri-check-line"></i>
													</Button>
													<Button
														size="sm"
														color="danger"
														outline
														onClick={() => handleRejectBid(bid)}
													>
														<i className="ri-close-line"></i>
													</Button>
												</div>
											)}
											{bid.status !== 'pending' && (
												<span className="text-muted">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setBidsModal(false)}>
						Close
					</Button>
				</ModalFooter>
			</Modal>

			{/* Edit Auction Modal */}
			<Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
				<ModalHeader toggle={() => setEditModal(false)}>Edit Auction</ModalHeader>
				<ModalBody>
					<Form
						onSubmit={(e) => {
							e.preventDefault();
							validation.handleSubmit();
							return false;
						}}
					>
						<Row>
							<Col md={6}>
								<div className="mb-3">
									<Label>Starting Bid *</Label>
									<Input
										type="number"
										name="starting_bid"
										value={validation.values.starting_bid}
										onChange={validation.handleChange}
										onBlur={validation.handleBlur}
										invalid={
											!!(validation.touched.starting_bid && validation.errors.starting_bid)
										}
									/>
									{validation.touched.starting_bid && validation.errors.starting_bid ? (
										<FormFeedback type="invalid">
											{validation.errors.starting_bid}
										</FormFeedback>
									) : null}
								</div>
							</Col>
							<Col md={6}>
								<div className="mb-3">
									<Label>Minimum Increment *</Label>
									<Input
										type="number"
										name="minimum_increment"
										value={validation.values.minimum_increment}
										onChange={validation.handleChange}
										onBlur={validation.handleBlur}
										invalid={
											!!(validation.touched.minimum_increment && validation.errors.minimum_increment)
										}
									/>
									{validation.touched.minimum_increment && validation.errors.minimum_increment ? (
										<FormFeedback type="invalid">
											{validation.errors.minimum_increment}
										</FormFeedback>
									) : null}
								</div>
							</Col>
							<Col md={6}>
								<div className="mb-3">
									<Label>Start Date *</Label>
									<Input
										type="date"
										name="start_date"
										value={validation.values.start_date}
										onChange={validation.handleChange}
										onBlur={validation.handleBlur}
										invalid={
											!!(validation.touched.start_date && validation.errors.start_date)
										}
									/>
									{validation.touched.start_date && validation.errors.start_date ? (
										<FormFeedback type="invalid">{validation.errors.start_date}</FormFeedback>
									) : null}
								</div>
							</Col>
							<Col md={6}>
								<div className="mb-3">
									<Label>End Date *</Label>
									<Input
										type="date"
										name="end_date"
										value={validation.values.end_date}
										onChange={validation.handleChange}
										onBlur={validation.handleBlur}
										invalid={!!(validation.touched.end_date && validation.errors.end_date)}
									/>
									{validation.touched.end_date && validation.errors.end_date ? (
										<FormFeedback type="invalid">{validation.errors.end_date}</FormFeedback>
									) : null}
								</div>
							</Col>
							<Col md={12}>
								<div className="mb-3">
									<Label>Status *</Label>
									<Input
										type="select"
										name="status"
										value={validation.values.status}
										onChange={validation.handleChange}
									>
										<option value="pending">Pending</option>
										<option value="active">Active</option>
										<option value="completed">Completed</option>
										<option value="cancelled">Cancelled</option>
									</Input>
								</div>
							</Col>
							<Col md={6}>
								<div className="mb-3">
									<Label>Currency *</Label>
									<Input
										type="text"
										name="currency"
										value={validation.values.currency}
										onChange={validation.handleChange}
										onBlur={validation.handleBlur}
										invalid={!!(validation.touched.currency && validation.errors.currency)}
									/>
									{validation.touched.currency && validation.errors.currency ? (
										<FormFeedback type="invalid">{validation.errors.currency}</FormFeedback>
									) : null}
								</div>
							</Col>
						</Row>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditModal(false)}>
						Cancel
					</Button>
					<Button color="primary" onClick={() => validation.handleSubmit()}>
						<i className="ri-save-line me-1"></i>Update Auction
					</Button>
				</ModalFooter>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} centered>
				<ModalHeader toggle={() => setDeleteModal(false)}>Delete Auction</ModalHeader>
				<ModalBody>
					<p>
						Are you sure you want to delete the auction for{" "}
						<strong>"{auctionToDelete?.project?.title}"</strong>?
					</p>
					<p className="text-muted mb-0">
						This will also delete all associated bids. This action cannot be undone.
					</p>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setDeleteModal(false)}>
						Cancel
					</Button>
					<Button color="danger" onClick={handleDeleteConfirm} disabled={deleting}>
						{deleting ? (
							<>
								<Spinner size="sm" className="me-2" />
								Deleting...
							</>
						) : (
							<>
								<i className="ri-delete-bin-line me-1"></i>Delete Auction
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Timing Settings Modal */}
			<Modal isOpen={showTimingModal} toggle={() => setShowTimingModal(false)} size="lg" centered>
				<ModalHeader toggle={() => setShowTimingModal(false)}>
					Auction Timing Settings
				</ModalHeader>
				<ModalBody>
					<div className="mb-4">
						<h5 className="mb-3">Countdown Display Threshold</h5>
						<p className="text-muted">
							Choose when to switch from "Days + Hours" to "Hours + Minutes + Seconds" display
						</p>
						<div className="d-flex gap-3">
							<Button
								color={timingThreshold === 24 ? "primary" : "light"}
								onClick={() => handleUpdateThreshold(24)}
							>
								24 Hours
							</Button>
							<Button
								color={timingThreshold === 48 ? "primary" : "light"}
								onClick={() => handleUpdateThreshold(48)}
							>
								48 Hours
							</Button>
						</div>
					</div>

					<hr />

					<div className="mb-4">
						<h5 className="mb-3">Allowed Duration Options</h5>
						<p className="text-muted">
							Users can choose from these duration options when activating proposals
						</p>
						<div className="d-flex gap-3 flex-wrap">
							{[3, 7, 10, 14, 21].map(days => (
								<Button
									key={days}
									color={allowedDurations.includes(days) ? "success" : "light"}
									onClick={() => {
										if (allowedDurations.includes(days)) {
											handleUpdateDurations(allowedDurations.filter(d => d !== days));
										} else {
											handleUpdateDurations([...allowedDurations, days].sort((a, b) => a - b));
										}
									}}
								>
									{days} Days
								</Button>
							))}
						</div>
						<div className="mt-3">
							<Badge color="info" className="me-2">
								Selected: {allowedDurations.join(', ')} days
							</Badge>
						</div>
					</div>

					<hr />

					<div>
						<h5 className="mb-3">Preview</h5>
						<div className="border rounded p-3 bg-light mb-2">
							<p className="mb-2"><strong>Example 1:</strong> 5 days 12 hours remaining</p>
							<p className="mb-0 text-primary">Display: "5d 12h"</p>
						</div>
						<div className="border rounded p-3 bg-light">
							<p className="mb-2"><strong>Example 2:</strong> {timingThreshold - 1} hours remaining (below threshold)</p>
							<p className="mb-0 text-warning">Display: "{timingThreshold - 1}h 45m 30s"</p>
						</div>
					</div>
				</ModalBody>
			</Modal>
		</div>
	);
};

export default ManageAuctions;
