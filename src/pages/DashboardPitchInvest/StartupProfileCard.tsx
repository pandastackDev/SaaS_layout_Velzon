import React from "react";
import { Card, CardBody, Row, Col, Button, Badge, Progress } from "reactstrap";
import { Startup } from "./types";

interface StartupProfileCardProps {
	startup: Startup;
	onOpenVideo: (startup: Startup) => void;
}

const StartupProfileCard: React.FC<StartupProfileCardProps> = ({
	startup,
	onOpenVideo,
}) => {
	const progressPercent = Math.round(
		(startup.currentInvestment / startup.investmentGoal) * 100,
	);
	const approvalClass =
		startup.publicApproval >= 80
			? "approval-high"
			: startup.publicApproval >= 60
				? "approval-medium"
				: "approval-low";

	return (
		<Card className="h-100 border-0 startup-card">
			<CardBody className="p-0">
				{/* Dual Frame Section - Photo + Video */}
				<Row className="g-0">
					{/* Photo Frame */}
					<Col xs={6}>
						<div className="position-relative card-frame-height">
							<img
								src={startup.photo}
								alt={startup.name}
								className="w-100 h-100"
							/>
							<div className="position-absolute bottom-0 start-0 end-0 p-2 card-overlay-gradient">
								<div className="d-flex align-items-center gap-1 gap-sm-2">
									<img
										src={startup.logo}
										alt=""
										className="card-startup-logo"
									/>
									<span className="text-white fw-medium card-startup-name">
										{startup.name}
									</span>
								</div>
							</div>
						</div>
					</Col>

					{/* Video Frame */}
					<Col xs={6}>
						<div
							className="position-relative cursor-pointer card-frame-height"
							onClick={() => onOpenVideo(startup)}
						>
							<img
								src={startup.photo}
								alt="Pitch video thumbnail"
								className="w-100 h-100 card-video-overlay"
							/>
							{/* Play Button */}
							<div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center card-play-btn">
								<i className="ri-play-fill card-play-icon"></i>
							</div>
							<div className="position-absolute bottom-0 start-0 end-0 p-2 text-center card-video-overlay-bottom">
								<small className="text-white card-video-label">
									<i className="ri-video-line me-1"></i>
									<span className="d-none d-sm-inline">Pitch </span>Video
								</small>
							</div>
						</div>
					</Col>
				</Row>

				{/* Card Content */}
				<div className="card-content">
					{/* Country & Sector Tags */}
					<div className="d-flex justify-content-between align-items-center mb-2">
						<span className="d-flex align-items-center gap-1 card-country-text">
							<span>{startup.countryFlag}</span>
							{startup.country}
						</span>
						<Badge className="card-sector-badge">{startup.sector}</Badge>
					</div>

					{/* Description */}
					<p className="text-muted mb-3 card-description">
						{startup.shortDescription}
					</p>

					{/* Investment Progress */}
					<div className="mb-3">
						<div className="d-flex justify-content-between mb-1">
							<small className="text-muted">Investment Progress</small>
							<small className="fw-semibold card-progress-label">
								{progressPercent}%
							</small>
						</div>
						<Progress value={progressPercent} className="card-progress-bar" />
						<div className="d-flex justify-content-between mt-1">
							<small className="text-muted">
								${startup.currentInvestment.toLocaleString()}
							</small>
							<small className="text-muted">
								Goal: ${startup.investmentGoal.toLocaleString()}
							</small>
						</div>
					</div>

					{/* Min Investment */}
					<div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded card-min-investment">
						<span className="text-muted label">Min. Investment</span>
						<span className="fw-bold value">
							${startup.minInvestment.toLocaleString()}
						</span>
					</div>

					{/* Public Approval Section */}
					<div className="public-approval-section text-center p-2 p-sm-3 mb-2 mb-sm-3">
						<small className="text-muted text-uppercase d-block mb-1 approval-label">
							Public Approval
						</small>
						{/* LARGE PERCENTAGE - Responsive font */}
						<div className={`approval-percentage fw-bold ${approvalClass}`}>
							{startup.publicApproval}%
						</div>
						<div className="d-flex align-items-center justify-content-center gap-1 mb-2 mb-sm-3">
							<i className="ri-group-line text-muted votes-icon"></i>
							<small className="text-muted votes-text">
								{startup.totalVotes.toLocaleString()} votes
							</small>
						</div>

						{/* PREMIUM VOTE BUTTON */}
						<Button className="btn-vote w-100 d-flex align-items-center justify-content-center gap-1 gap-sm-2">
							<i className="ri-thumb-up-fill vote-icon"></i>
							<span className="vote-btn-text">
								Vote
								<span className="d-none d-sm-inline"> for this Startup</span>
							</span>
						</Button>
					</div>

					{/* PROPOSAL Button */}
					<Button className="w-100 btn-proposal">
						<i className="ri-hand-coin-line me-1 me-sm-2"></i>
						Proposal
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default StartupProfileCard;
