import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import { Startup } from "./types";
import { featuredStartupProfile, featuredInvestor } from "./data";

interface FeaturedCarouselProps {
	startups: Startup[];
	onOpenVideo: (startup: Startup) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
	startups,
	onOpenVideo,
}) => {
	const navigate = useNavigate();
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

	const featuredStartups = startups.filter((s) => s.featured);

	// Auto-scroll every 3 seconds
	useEffect(() => {
		if (isAutoPlaying && featuredStartups.length > 1) {
			autoPlayRef.current = setInterval(() => {
				setActiveIndex((prev) => (prev + 1) % featuredStartups.length);
			}, 3000);
		}
		return () => {
			if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		};
	}, [isAutoPlaying, featuredStartups.length]);

	const handleManualNav = (direction: "next" | "prev") => {
		setIsAutoPlaying(false);
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);

		if (direction === "next") {
			setActiveIndex((prev) => (prev + 1) % featuredStartups.length);
		} else {
			setActiveIndex(
				(prev) =>
					(prev - 1 + featuredStartups.length) % featuredStartups.length,
			);
		}
	};

	const handleDotClick = (idx: number) => {
		setIsAutoPlaying(false);
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		setActiveIndex(idx);
	};

	const currentStartup = featuredStartups[activeIndex];
	if (!currentStartup) return null;

	const approvalClass =
		currentStartup.publicApproval >= 90
			? "approval-high"
			: currentStartup.publicApproval >= 70
				? "approval-medium"
				: "approval-low";

	return (
		<Card className="border-0 mb-3 mb-md-4 featured-opportunities-card">
			<CardBody className="p-2 p-sm-3 p-md-4">
				<div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 flex-wrap gap-2">
					<div className="d-flex align-items-center gap-2">
						<i className="ri-star-fill text-warning fs-5"></i>
						<h4 className="mb-0 featured-title">
							Featured <span className="d-none d-sm-inline">Opportunities</span>
						</h4>
					</div>
					{!isAutoPlaying ? (
						<Badge className="control-badge badge-manual">Manual</Badge>
					) : (
						<Badge
							color="success"
							className="d-flex align-items-center gap-1 control-badge"
						>
							<span className="pulse-dot"></span>{" "}
							<span className="d-none d-sm-inline">Auto-playing</span>
						</Badge>
					)}
				</div>

				<Row className="align-items-stretch g-2 g-md-3">
					{/* Left Card - Inventor/Startup/Company Profile */}
					<Col lg={3} md={6} className="d-none d-lg-block">
						<Card className="h-100 border-0 position-relative profile-card">
							{/* Header with background */}
							<div
								className="position-relative profile-header"
								style={{
									backgroundImage: `url(${featuredStartupProfile.coverImage})`,
								}}
							>
								<div className="position-absolute profile-avatar-wrapper">
									<img
										src={featuredStartupProfile.photo}
										alt={featuredStartupProfile.name}
										className="rounded-circle profile-avatar"
									/>
								</div>
								<div className="position-absolute top-0 end-0 m-2">
									<div className="bg-white rounded-circle d-flex align-items-center justify-content-center company-logo-wrapper">
										<img
											src={featuredStartupProfile.companyLogo}
											alt={featuredStartupProfile.companyName}
											className="rounded-circle company-logo"
										/>
									</div>
								</div>
							</div>

							<CardBody className="p-3 profile-body">
								<div className="text-end text-muted small fw-semibold mb-2">
									{featuredStartupProfile.companyName}
								</div>

								<div className="mb-3 profile-info">
									<div className="mb-1">
										<span className="fw-semibold">Name:</span>{" "}
										{featuredStartupProfile.name}
									</div>
									<div className="mb-1">
										<span className="fw-semibold">Startup:</span>{" "}
										{featuredStartupProfile.projectName}
									</div>
									<div className="mb-1">
										<span className="fw-semibold">Cidade:</span>{" "}
										{featuredStartupProfile.city}
									</div>
									<div className="d-flex align-items-center gap-2 mb-1">
										<span className="fw-semibold">País:</span>
										<span>
											{featuredStartupProfile.country}{" "}
											{featuredStartupProfile.countryFlag}
										</span>
									</div>
								</div>

								<div className="d-flex gap-2 mb-3">
									<Button size="sm" className="flex-fill btn-message">
										Message
									</Button>
									<Button size="sm" className="flex-fill btn-proposal-outline">
										Proposal
									</Button>
								</div>

								<div className="text-center mb-3">
									<div className="fw-bold capital-info">
										{featuredStartupProfile.capitalPercentage}% por{" "}
										{featuredStartupProfile.capitalTotalValue}
									</div>
									<div className="text-success fw-bold small">
										{featuredStartupProfile.commission}% Comissão
									</div>
								</div>

								<Row className="g-2 mb-3">
									{featuredStartupProfile.photos[0] && (
										<Col xs={6}>
											<img
												src={featuredStartupProfile.photos[0]}
												alt="Product 1"
												className="profile-thumbnail"
											/>
										</Col>
									)}
									<Col xs={6}>
										<div
											className="position-relative profile-video-thumbnail"
											onClick={() => onOpenVideo(currentStartup)}
										>
											<img
												src={featuredStartupProfile.photos[0]}
												alt="Video thumbnail"
											/>
											<div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center play-btn-small">
												<i className="ri-play-fill"></i>
											</div>
										</div>
									</Col>
								</Row>

								<div className="text-center p-3 mt-auto profile-stats-section">
									<div className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
										{featuredStartupProfile.description}
									</div>
									<div className="text-muted small mb-1">PUBLIC APPROVAL</div>
									<div
										className="fw-bold mb-2 text-success"
										style={{ fontSize: "1.5rem" }}
									>
										{featuredStartupProfile.approvalRate}%
									</div>
									<div className="d-flex justify-content-center gap-2">
										<button className="btn btn-sm d-flex align-items-center gap-1 like-btn">
											<i className="ri-thumb-up-fill text-warning"></i>
											<span>{featuredStartupProfile.likes}</span>
										</button>
										<button className="btn btn-sm d-flex align-items-center gap-1 view-btn">
											<i className="ri-eye-line"></i>
											<span>{featuredStartupProfile.views}</span>
										</button>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>

					{/* Center - Featured Project Carousel */}
					<Col xs={12} lg={6} md={12}>
						<div className="d-flex align-items-center justify-content-center h-100">
							{/* Carousel Wrapper - Centered Content */}
							<div className="w-100 px-4 px-sm-4 px-md-4">
								{/* Carousel Content with Navigation */}
								<div className="position-relative carousel-wrapper">
									{/* Navigation Buttons - Outside carousel-content to avoid overflow:hidden clipping */}
									<button
										onClick={() => handleManualNav("prev")}
										className="position-absolute top-50 translate-middle-y border-0 d-flex align-items-center justify-content-center carousel-nav-btn carousel-nav-prev"
									>
										<i className="ri-arrow-left-s-line"></i>
									</button>

									<button
										onClick={() => handleManualNav("next")}
										className="position-absolute top-50 translate-middle-y border-0 d-flex align-items-center justify-content-center carousel-nav-btn carousel-nav-next"
									>
										<i className="ri-arrow-right-s-line"></i>
									</button>

									{/* Carousel Content */}
									<div className="carousel-content">
										{/* Dual Frame: Photo + Video */}
										<Row className="g-0">
											<Col xs={6} md={6}>
												<div className="position-relative carousel-frame">
													<img
														src={currentStartup.photo}
														alt={currentStartup.name}
														className="w-100 h-100"
														style={{ objectFit: "cover" }}
													/>
													<div className="position-absolute top-0 start-0 m-2 m-md-3 d-flex align-items-center gap-1 gap-md-2 px-2 px-md-3 py-1 py-md-2 startup-name-badge">
														<img
															src={currentStartup.logo}
															alt=""
															className="startup-logo-small"
														/>
														<span className="fw-semibold startup-name-text">
															{currentStartup.name}
														</span>
													</div>
													<div className="position-absolute bottom-0 start-0 w-100 p-2 p-md-3 carousel-overlay-bottom">
														<p className="text-white-50 small mb-0 country-text">
															{currentStartup.countryFlag}{" "}
															<span className="d-none d-sm-inline">
																{currentStartup.country}
															</span>
														</p>
													</div>
												</div>
											</Col>
											<Col xs={6} md={6}>
												<div
													className="position-relative d-flex align-items-center justify-content-center carousel-frame video-frame"
													onClick={() => onOpenVideo(currentStartup)}
												>
													<div className="text-center px-2">
														<div className="mb-2 mb-md-3 mx-auto play-button-wrapper d-flex align-items-center justify-content-center">
															<i className="ri-play-fill play-icon"></i>
														</div>
														<h6 className="text-white mb-1 mb-md-2 video-cta-text">
															🎥{" "}
															<span className="d-none d-sm-inline">Watch</span>{" "}
															Pitch Video
														</h6>
														<p className="text-white-50 small mb-0 d-none d-md-block">
															Click to play
														</p>
													</div>
												</div>
											</Col>
										</Row>

										{/* Quick Info Bar */}
										<div className="p-2 p-md-3 d-flex justify-content-between align-items-center flex-wrap gap-2 quick-info-bar">
											<div className="d-flex align-items-center gap-2 gap-md-3 flex-wrap">
												<span className="small fw-semibold d-none d-sm-inline text-primary-dark">
													{currentStartup.countryFlag} {currentStartup.name}
												</span>
												<Badge className={`approval-badge ${approvalClass}`}>
													{currentStartup.publicApproval}%{" "}
													<span className="d-none d-sm-inline">Approval</span>
												</Badge>
												<span className="small fw-bold raised-amount">
													€
													{(currentStartup.currentInvestment / 1000).toFixed(0)}
													K <span className="d-none d-sm-inline">Raised</span>
												</span>
											</div>
											<Button size="sm" className="btn-proposal-small">
												💰 <span className="d-none d-sm-inline">Proposal</span>
											</Button>
										</div>
									</div>
								</div>

								{/* Carousel Indicators - Below the carousel */}
								<div className="d-flex justify-content-center gap-1 gap-sm-2 mb-2 mb-md-3">
									{featuredStartups.map((_, idx) => (
										<div
											key={idx}
											onClick={() => handleDotClick(idx)}
											className={`carousel-dot ${activeIndex === idx ? "active" : ""}`}
										/>
									))}
								</div>

								{/* Navigation Buttons */}
								<div className="d-flex justify-content-center gap-2 gap-md-3">
									<Button
										className="btn-nav-primary"
										onClick={() => navigate("/gallery")}
									>
										Innovation
									</Button>
									<Button
										className="btn-nav-secondary"
										onClick={() => navigate("/investors")}
									>
										Investor
									</Button>
								</div>
							</div>
						</div>
					</Col>

					{/* Right Card - Investor Profile */}
					<Col lg={3} md={6} className="d-none d-lg-block">
						<Card className="h-100 border-0 position-relative profile-card">
							{/* Header with background */}
							<div
								className="position-relative profile-header"
								style={{
									backgroundImage: featuredInvestor.coverImage
										? `url(${featuredInvestor.coverImage})`
										: "linear-gradient(135deg, #0a3d62 0%, #062a3d 100%)",
								}}
							>
								<div className="text-white fw-bold text-center d-flex align-items-center justify-content-center investor-header-overlay">
									{featuredInvestor.company}
								</div>

								{/* Avatar overlapping header */}
								<div className="position-absolute profile-avatar-wrapper">
									<div className="rounded-circle overflow-hidden bg-white profile-avatar">
										<img
											src={featuredInvestor.photo}
											alt={featuredInvestor.name}
											className="w-100 h-100"
											style={{ objectFit: "cover" }}
										/>
									</div>
								</div>
							</div>

							<CardBody className="p-3 d-flex flex-column profile-body">
								{/* Name and Location */}
								<div className="text-end mb-2">
									<h5
										className="mb-0"
										style={{ fontSize: "0.85rem", fontWeight: 600 }}
									>
										{featuredInvestor.name}
									</h5>
									<div className="text-muted" style={{ fontSize: "0.75rem" }}>
										{featuredInvestor.location}
									</div>
								</div>

								{/* Investor Type Info */}
								<div className="mb-3 profile-info">
									<div className="mb-1">
										<span className="fw-semibold">Type:</span>{" "}
										{featuredInvestor.role}
									</div>
									<div className="mb-1">
										<span className="fw-semibold">Company:</span>{" "}
										{featuredInvestor.company}
									</div>
									<div className="mb-1">
										<span className="fw-semibold">Focus:</span> Fintech &
										Innovation
									</div>
								</div>

								{/* Buttons */}
								<div className="d-flex gap-2 mb-3">
									<Button size="sm" className="flex-fill btn-message">
										Message
									</Button>
									<Button size="sm" className="flex-fill btn-profile-outline">
										View Profile
									</Button>
								</div>

								{/* Investment Stats */}
								<div className="text-center mb-3">
									<div className="fw-bold capital-info">
										6 Portfolio Companies
									</div>
									<div className="text-success fw-bold small">
										Active Investor
									</div>
								</div>

								{/* Portfolio Grid */}
								<div className="mb-3">
									<Row className="g-2">
										<Col xs={6}>
											<div
												className="bg-white rounded d-flex align-items-center justify-content-center overflow-hidden profile-video-thumbnail"
												style={{ border: "1px solid #e0e0e0" }}
											>
												<img
													src={featuredInvestor.portfolio[0].image}
													alt={featuredInvestor.portfolio[0].name}
													className="w-100 h-100"
													style={{ objectFit: "cover", filter: "none" }}
												/>
											</div>
										</Col>
										<Col xs={6}>
											<div
												className="position-relative profile-video-thumbnail cursor-pointer"
												onClick={() => onOpenVideo(currentStartup)}
											>
												<img
													src={featuredInvestor.portfolio[0].image}
													alt="Video thumbnail"
												/>
												<div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center play-btn-small">
													<i className="ri-play-fill"></i>
												</div>
											</div>
										</Col>
									</Row>
								</div>

								{/* Company Description Section */}
								<div className="text-center p-3 mt-auto profile-stats-section">
									<div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
										Investment Focus
									</div>
									<div
										className="text-muted mb-2"
										style={{ fontSize: "0.8rem", lineHeight: "1.4" }}
									>
										{featuredInvestor.description.substring(0, 100)}...
									</div>
									<div className="d-flex justify-content-center gap-2">
										<div className="text-center px-2">
											<div
												className="fw-bold"
												style={{ fontSize: "1.2rem", color: "#0a3d62" }}
											>
												6
											</div>
											<div
												className="text-muted"
												style={{ fontSize: "0.7rem" }}
											>
												Portfolio
											</div>
										</div>
										<div className="text-center px-2">
											<div
												className="fw-bold text-success"
												style={{ fontSize: "1.2rem" }}
											>
												95%
											</div>
											<div
												className="text-muted"
												style={{ fontSize: "0.7rem" }}
											>
												Success
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</CardBody>
		</Card>
	);
};

export default FeaturedCarousel;
