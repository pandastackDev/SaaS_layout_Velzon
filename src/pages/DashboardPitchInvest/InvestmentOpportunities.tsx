import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button, Badge, Input } from "reactstrap";
import { Startup } from "./types";
import {
	statuses,
	countries,
	categories,
	cities,
	investmentRanges,
	equityRanges,
} from "./data";
import StartupProfileCard from "./StartupProfileCard";

interface InvestmentOpportunitiesProps {
	startups: Startup[];
	onOpenVideo: (startup: Startup) => void;
}

const InvestmentOpportunities: React.FC<InvestmentOpportunitiesProps> = ({
	startups,
	onOpenVideo,
}) => {
	const [selectedStatus, setSelectedStatus] = useState("All Status");
	const [selectedCountry, setSelectedCountry] = useState("All Countries");
	const [selectedCategory, setSelectedCategory] = useState("All Categories");
	const [selectedCity, setSelectedCity] = useState("All Cities");
	const [selectedRange, setSelectedRange] = useState("All Ranges");
	const [selectedEquity, setSelectedEquity] = useState("All %");
	const [searchTerm, setSearchTerm] = useState("");

	const filteredStartups = startups.filter((startup) => {
		const matchesCategory =
			selectedCategory === "All Categories" ||
			startup.sector === selectedCategory;
		const matchesCountry =
			selectedCountry === "All Countries" ||
			startup.country === selectedCountry;
		const matchesSearch =
			startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			startup.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesCategory && matchesCountry && matchesSearch;
	});

	const resetFilters = () => {
		setSelectedStatus("All Status");
		setSelectedCountry("All Countries");
		setSelectedCategory("All Categories");
		setSelectedCity("All Cities");
		setSelectedRange("All Ranges");
		setSelectedEquity("All %");
		setSearchTerm("");
	};

	return (
		<div className="investment-opportunities">
			{/* Section Header */}
			<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
				<div>
					<h4 className="mb-1 section-title">
						<i className="ri-rocket-2-line me-2"></i>
						Investment Opportunities
					</h4>
					<p className="text-muted mb-0 section-subtitle">
						Discover promising startups seeking investment
					</p>
				</div>
				<Badge className="startup-count-badge">
					{filteredStartups.length} Startups
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
								placeholder="Search startups..."
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
						{/* Ranges */}
						<Input
							type="select"
							value={selectedRange}
							onChange={(e) => setSelectedRange(e.target.value)}
							className="filter-select filter-select-range"
						>
							{investmentRanges.map((range) => (
								<option key={range} value={range}>
									{range}
								</option>
							))}
						</Input>
						{/* Equity % */}
						<Input
							type="select"
							value={selectedEquity}
							onChange={(e) => setSelectedEquity(e.target.value)}
							className="filter-select filter-select-equity"
						>
							{equityRanges.map((equity) => (
								<option key={equity} value={equity}>
									{equity}
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
										placeholder="Search startups..."
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
						{/* Third Row: Cities, Ranges, Equity %, Reset */}
						<Row className="g-2 align-items-center">
							<Col xs={6} sm={3}>
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
							<Col xs={6} sm={3}>
								<Input
									type="select"
									value={selectedRange}
									onChange={(e) => setSelectedRange(e.target.value)}
									className="filter-select"
								>
									{investmentRanges.map((range) => (
										<option key={range} value={range}>
											{range}
										</option>
									))}
								</Input>
							</Col>
							<Col xs={6} sm={3}>
								<Input
									type="select"
									value={selectedEquity}
									onChange={(e) => setSelectedEquity(e.target.value)}
									className="filter-select"
								>
									{equityRanges.map((equity) => (
										<option key={equity} value={equity}>
											{equity}
										</option>
									))}
								</Input>
							</Col>
							<Col xs={6} sm={3}>
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

			{/* Startup Cards Grid */}
			<Row className="g-3 g-md-4">
				{filteredStartups.map((startup) => (
					<Col key={startup.id} xs={12} sm={6} xl={4} lg={6}>
						<StartupProfileCard startup={startup} onOpenVideo={onOpenVideo} />
					</Col>
				))}
			</Row>

			{filteredStartups.length === 0 && (
				<div className="text-center py-5 empty-state">
					<i className="ri-search-eye-line"></i>
					<h5 className="mt-3 text-muted">No startups found</h5>
					<p className="text-muted">Try adjusting your filters</p>
				</div>
			)}
		</div>
	);
};

export default InvestmentOpportunities;
