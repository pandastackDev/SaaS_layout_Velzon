import React, { useState } from "react";
import { Container } from "reactstrap";

// Import types and data
import { Startup } from "./types";
import { mockStartups } from "./data";

// Import components
import HeroSection from "./HeroSection";
import FeaturedCarousel from "./FeaturedCarousel";
import InvestmentOpportunities from "./InvestmentOpportunities";
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
