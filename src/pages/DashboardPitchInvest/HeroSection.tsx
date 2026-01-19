import type React from "react";
import { Col, Row } from "reactstrap";
import heroBack from "../../assets/images/hero-back.png";

// Import hero images
import heroLogo from "../../assets/images/main-logo/hero-logo.png";
import { announcements } from "./data";

const HeroSection: React.FC = () => {
	const leftAnnouncement = announcements.find((a) => a.type === "left");
	const rightAnnouncement = announcements.find((a) => a.type === "right");

	return (
		<div
			className="hero-section position-relative overflow-hidden"
			style={{ backgroundImage: `url(${heroBack})` }}
		>
			<Row className="h-100 align-items-center position-relative g-0 hero-row">
				{/* Left Announcement - Hidden on mobile/tablet */}
				<Col lg={3} className="d-none d-lg-flex justify-content-center">
					{leftAnnouncement && (
						<div className="announcement-card text-center p-3 p-xl-4">
							<h5 className="text-white mb-2 announcement-title">
								{leftAnnouncement.title}
							</h5>
							<p className="text-white-50 mb-0 announcement-desc">
								{leftAnnouncement.description}
							</p>
						</div>
					)}
				</Col>

				{/* Center - Logo & Title */}
				<Col xs={12} lg={6} className="text-center py-3 py-md-4 px-3">
					<div className="hero-logo mb-2 mb-md-3">
						<img
							src={heroLogo}
							alt="Pitch Invest Logo"
							className="hero-logo-img"
						/>
					</div>
					<h1 className="text-white fw-bold mb-2 hero-title">PITCH INVEST</h1>
					<p className="text-white-50 mb-3 mb-md-4 hero-subtitle px-2">
						Connecting Visionary Startups with Global Investors
					</p>
					<div className="hero-stats d-flex justify-content-center gap-2 gap-sm-3 gap-md-4 flex-wrap px-2">
						<div className="text-center">
							<h3 className="mb-0 hero-stat-value">$12.5M+</h3>
							<small className="text-white-50 hero-stat-label">
								Total Invested
							</small>
						</div>
						<div className="text-center">
							<h3 className="mb-0 hero-stat-value">500+</h3>
							<small className="text-white-50 hero-stat-label">
								Active Investors
							</small>
						</div>
						<div className="text-center">
							<h3 className="mb-0 hero-stat-value">85+</h3>
							<small className="text-white-50 hero-stat-label">
								Funded Startups
							</small>
						</div>
					</div>
				</Col>

				{/* Right Announcement - Hidden on mobile/tablet */}
				<Col lg={3} className="d-none d-lg-flex justify-content-center">
					{rightAnnouncement && (
						<div className="announcement-card text-center p-3 p-xl-4">
							<h5 className="text-white mb-2 announcement-title">
								{rightAnnouncement.title}
							</h5>
							<p className="text-white-50 mb-0 announcement-desc">
								{rightAnnouncement.description}
							</p>
						</div>
					)}
				</Col>
			</Row>
		</div>
	);
};

export default HeroSection;
