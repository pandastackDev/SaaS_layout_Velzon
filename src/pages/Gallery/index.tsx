import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
	Badge,
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Input,
	Row,
} from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import GalleryCard from "../../Components/Common/GalleryCard";
import { galleryItems } from "./galleryData";

const Gallery: React.FC = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("All Status");
	const [selectedCountry, setSelectedCountry] = useState("All Countries");
	const [selectedCategory, setSelectedCategory] = useState("All Categories");
	const [selectedCity, setSelectedCity] = useState("All Cities");
	const [selectedTag, setSelectedTag] = useState("All Tags");

	// Extract unique values for filters
	const statuses = useMemo(() => {
		const statusSet = new Set<string>([
			"All Status",
			"Available",
			"Unavailable",
		]);
		galleryItems.forEach((item) => {
			if (item.availableLabel) {
				statusSet.add(item.availableLabel);
			}
		});
		return Array.from(statusSet).sort();
	}, []);

	const countries = useMemo(() => {
		const countrySet = new Set<string>(["All Countries"]);
		galleryItems.forEach((item) => {
			if (item.location) {
				countrySet.add(item.location);
			}
			if (item.author?.country) {
				countrySet.add(item.author.country);
			}
		});
		return Array.from(countrySet).sort();
	}, []);

	const categories = useMemo(() => {
		const categorySet = new Set<string>(["All Categories"]);
		galleryItems.forEach((item) => {
			if (item.category) {
				categorySet.add(item.category);
			}
		});
		return Array.from(categorySet).sort();
	}, []);

	const cities = useMemo(() => {
		const citySet = new Set<string>(["All Cities"]);
		galleryItems.forEach((item) => {
			if (item.location) {
				citySet.add(item.location);
			}
		});
		return Array.from(citySet).sort();
	}, []);

	const tags = useMemo(() => {
		const tagSet = new Set<string>(["All Tags"]);
		galleryItems.forEach((item) => {
			if (item.badges && item.badges.length > 0) {
				for (const badge of item.badges) {
					tagSet.add(badge);
				}
			}
		});
		return Array.from(tagSet).sort();
	}, []);

	// Filter gallery items
	const filteredItems = useMemo(() => {
		return galleryItems.filter((item) => {
			const matchesSearch =
				searchTerm === "" ||
				item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.category?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus =
				selectedStatus === "All Status" ||
				item.availableLabel === selectedStatus ||
				(selectedStatus === "Available" && item.availableStatus) ||
				(selectedStatus === "Unavailable" && !item.availableStatus);

			const matchesCategory =
				selectedCategory === "All Categories" ||
				item.category === selectedCategory;

			const matchesCountry =
				selectedCountry === "All Countries" ||
				item.location === selectedCountry ||
				item.author?.country === selectedCountry;

			const matchesCity =
				selectedCity === "All Cities" || item.location === selectedCity;

			const matchesTag =
				selectedTag === "All Tags" || item.badges?.includes(selectedTag);

			return (
				matchesSearch &&
				matchesStatus &&
				matchesCategory &&
				matchesCountry &&
				matchesCity &&
				matchesTag
			);
		});
	}, [
		searchTerm,
		selectedStatus,
		selectedCategory,
		selectedCountry,
		selectedCity,
		selectedTag,
	]);

	const resetFilters = () => {
		setSearchTerm("");
		setSelectedStatus("All Status");
		setSelectedCountry("All Countries");
		setSelectedCategory("All Categories");
		setSelectedCity("All Cities");
		setSelectedTag("All Tags");
	};

	// Show sign-in success toast after redirect
	useEffect(() => {
		const showSignInSuccess = sessionStorage.getItem("showSignInSuccess");
		if (showSignInSuccess === "true") {
			sessionStorage.removeItem("showSignInSuccess");
			toast("Signed in successfully! Welcome back!", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-success text-white",
			});
		}
	}, []);

	// Calculate stats
	const stats = useMemo(() => {
		const activeProjects = galleryItems.filter(
			(item) => item.availableStatus,
		).length;
		const totalProjects = galleryItems.length;
		const totalViews = galleryItems.reduce(
			(sum, item) => sum + (item.views || 0),
			0,
		);
		const totalLikes = galleryItems.reduce(
			(sum, item) => sum + (item.likes || 0),
			0,
		);

		return [
			{
				label: "ACTIVE PROJECTS",
				value: activeProjects,
				icon: "ri-folder-open-line",
				iconClass: "primary",
			},
			{
				label: "TOTAL VIEWS",
				value: totalViews,
				icon: "ri-eye-line",
				iconClass: "info",
			},
			{
				label: "TOTAL PROJECTS",
				value: totalProjects,
				icon: "ri-stack-line",
				iconClass: "success",
			},
			{
				label: "TOTAL LIKES",
				value: totalLikes,
				icon: "ri-heart-line",
				iconClass: "danger",
			},
		];
	}, []);

	document.title = "Gallery | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content pitch-invest-dashboard">
			<ToastContainer closeButton={false} limit={1} />
			<Container fluid>
				{/* Stats Section */}
				<Row className="g-3 mb-4">
					{stats.map((stat) => (
						<Col xxl={3} sm={6} key={stat.label}>
							<Card className="card-animate">
								<CardBody>
									<div className="d-flex justify-content-between">
										<div>
											<p className="fw-medium text-muted mb-0 text-uppercase fs-12">
												{stat.label}
											</p>
											<h2 className="mt-4 ff-secondary fw-semibold">
												<span className="counter-value">
													<CountUp
														start={0}
														end={stat.value}
														suffix="+"
														duration={3}
													/>
												</span>
											</h2>
										</div>
										<div>
											<div className="avatar-sm flex-shrink-0">
												<span
													className={
														"avatar-title rounded-circle fs-4 bg-" +
														stat.iconClass +
														"-subtle text-" +
														stat.iconClass
													}
												>
													<i className={stat.icon}></i>
												</span>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						</Col>
					))}
				</Row>

				{/* Section Header */}
				<div className="investment-opportunities">
					<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
						<div>
							<h4 className="mb-1 section-title">
								<i className="ri-image-line me-2"></i>
								Gallery
							</h4>
							<p className="text-muted mb-0 section-subtitle">
								Discover revolutionary innovations and groundbreaking projects
							</p>
						</div>
						<Badge className="startup-count-badge">
							{filteredItems.length} Items
						</Badge>
					</div>

					{/* Filter Bar */}
					<Card className="border-0 mb-3 mb-md-4 filter-card">
						<CardBody className="py-2 py-md-3 px-2 px-md-3">
							{/* Desktop Layout: Single row with flex */}
							<div className="filter-bar-desktop d-none d-xl-flex align-items-center gap-2 flex-wrap">
								{/* Search - expands to fill remaining space */}
								<div className="position-relative filter-search-wrapper">
									<i className="ri-search-line position-absolute"></i>
									<Input
										type="text"
										placeholder="Search projects..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="filter-input"
									/>
								</div>
								{/* Status */}
								<Input
									type="select"
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value)}
									className="filter-select filter-select-status"
								>
									{statuses.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</Input>
								{/* Countries */}
								<Input
									type="select"
									value={selectedCountry}
									onChange={(e) => setSelectedCountry(e.target.value)}
									className="filter-select filter-select-country"
								>
									{countries.map((country) => (
										<option key={country} value={country}>
											{country}
										</option>
									))}
								</Input>
								{/* Categories */}
								<Input
									type="select"
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="filter-select filter-select-category"
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</Input>
								{/* Cities */}
								<Input
									type="select"
									value={selectedCity}
									onChange={(e) => setSelectedCity(e.target.value)}
									className="filter-select filter-select-city"
								>
									{cities.map((city) => (
										<option key={city} value={city}>
											{city}
										</option>
									))}
								</Input>
								{/* Tags */}
								<Input
									type="select"
									value={selectedTag}
									onChange={(e) => setSelectedTag(e.target.value)}
									className="filter-select filter-select-tag"
								>
									{tags.map((tag) => (
										<option key={tag} value={tag}>
											{tag}
										</option>
									))}
								</Input>
								{/* Reset */}
								<Button
									outline
									color="secondary"
									className="btn-reset"
									onClick={resetFilters}
								>
									<i className="ri-refresh-line me-1"></i>Reset
								</Button>
							</div>

							{/* Mobile/Tablet Layout: Grid rows */}
							<div className="filter-bar-mobile d-xl-none">
								{/* First Row: Search */}
								<Row className="g-2 align-items-center mb-2">
									<Col xs={12}>
										<div className="position-relative filter-search-wrapper">
											<i className="ri-search-line position-absolute"></i>
											<Input
												type="text"
												placeholder="Search projects..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="filter-input"
											/>
										</div>
									</Col>
								</Row>
								{/* Second Row: Status, Countries, Categories */}
								<Row className="g-2 align-items-center mb-2">
									<Col xs={6} sm={4}>
										<Input
											type="select"
											value={selectedStatus}
											onChange={(e) => setSelectedStatus(e.target.value)}
											className="filter-select"
										>
											{statuses.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</Input>
									</Col>
									<Col xs={6} sm={4}>
										<Input
											type="select"
											value={selectedCountry}
											onChange={(e) => setSelectedCountry(e.target.value)}
											className="filter-select"
										>
											{countries.map((country) => (
												<option key={country} value={country}>
													{country}
												</option>
											))}
										</Input>
									</Col>
									<Col xs={12} sm={4}>
										<Input
											type="select"
											value={selectedCategory}
											onChange={(e) => setSelectedCategory(e.target.value)}
											className="filter-select"
										>
											{categories.map((category) => (
												<option key={category} value={category}>
													{category}
												</option>
											))}
										</Input>
									</Col>
								</Row>
								{/* Third Row: Cities, Tags, Reset */}
								<Row className="g-2 align-items-center">
									<Col xs={6} sm={4}>
										<Input
											type="select"
											value={selectedCity}
											onChange={(e) => setSelectedCity(e.target.value)}
											className="filter-select"
										>
											{cities.map((city) => (
												<option key={city} value={city}>
													{city}
												</option>
											))}
										</Input>
									</Col>
									<Col xs={6} sm={4}>
										<Input
											type="select"
											value={selectedTag}
											onChange={(e) => setSelectedTag(e.target.value)}
											className="filter-select"
										>
											{tags.map((tag) => (
												<option key={tag} value={tag}>
													{tag}
												</option>
											))}
										</Input>
									</Col>
									<Col xs={12} sm={4}>
										<Button
											outline
											color="secondary"
											className="w-100 btn-reset"
											onClick={resetFilters}
										>
											<i className="ri-refresh-line me-1"></i>Reset
										</Button>
									</Col>
								</Row>
							</div>
						</CardBody>
					</Card>

					{/* Gallery Cards Grid */}
					<Row className="g-3 g-md-4">
						{filteredItems.map((item) => (
							<Col key={item.id} xs={12} sm={6} xl={4} lg={6}>
								<GalleryCard
									{...item}
									onClick={() => navigate(`/gallery/${item.id}`)}
								/>
							</Col>
						))}
					</Row>

					{filteredItems.length === 0 && (
						<div className="text-center py-5 empty-state">
							<i className="ri-search-eye-line"></i>
							<h5 className="mt-3 text-muted">No items found</h5>
							<p className="text-muted">Try adjusting your filters</p>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
};

export default Gallery;
