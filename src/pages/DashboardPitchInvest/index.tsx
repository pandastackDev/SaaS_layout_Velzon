import React, { useState } from "react";
import { Container } from "reactstrap";
import { mockStartups } from "./data";
import FeaturedCarousel from "./FeaturedCarousel";

// Import components
import HeroSection from "./HeroSection";
import InvestmentOpportunities from "./InvestmentOpportunities";
// Import types and data
import type { Startup } from "./types";
import VideoLightbox from "./VideoLightbox";

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const DashboardPitchInvest: React.FC = () => {
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

	document.title =
		"Dashboard | Pitch Invest - Global Startup Investment Platform";

	const handleOpenVideo = (startup: Startup) => {
		setSelectedStartup(startup);
		setVideoModalOpen(true);
	};

	return (
		<React.Fragment>
			<div className="page-content pitch-invest-dashboard">
				<Container fluid>
					{/* Hero Section */}
					<HeroSection />

					{/* Featured Carousel */}
					<FeaturedCarousel
						startups={mockStartups}
						onOpenVideo={handleOpenVideo}
					/>

					{/* Investment Opportunities */}
					<InvestmentOpportunities
						startups={mockStartups}
						onOpenVideo={handleOpenVideo}
					/>
				</Container>
			</div>

			{/* Video Lightbox Modal */}
			<VideoLightbox
				isOpen={videoModalOpen}
				toggle={() => setVideoModalOpen(false)}
				startup={selectedStartup}
			/>
		</React.Fragment>
	);
};

export default DashboardPitchInvest;
