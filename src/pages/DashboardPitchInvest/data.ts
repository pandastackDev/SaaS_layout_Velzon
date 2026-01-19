import {
	Startup,
	Announcement,
	FeaturedStartupProfile,
	FeaturedInvestor,
} from "./types";

// ============================================
// MOCK DATA - STARTUPS
// ============================================
export const mockStartups: Startup[] = [
	{
		id: 1,
		name: "TechVenture AI",
		logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "United States",
		countryFlag: "🇺🇸",
		sector: "Technology",
		investmentGoal: 500000,
		currentInvestment: 325000,
		minInvestment: 1000,
		publicApproval: 87,
		totalVotes: 1234,
		shortDescription: "AI-powered business intelligence platform",
		featured: true,
	},
	{
		id: 2,
		name: "GreenEnergy Solutions",
		logo: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "Germany",
		countryFlag: "🇩🇪",
		sector: "Clean Energy",
		investmentGoal: 750000,
		currentInvestment: 412000,
		minInvestment: 2500,
		publicApproval: 92,
		totalVotes: 2156,
		shortDescription: "Sustainable energy solutions for smart cities",
		featured: true,
	},
	{
		id: 3,
		name: "HealthTech Pro",
		logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "United Kingdom",
		countryFlag: "🇬🇧",
		sector: "Healthcare",
		investmentGoal: 300000,
		currentInvestment: 189000,
		minInvestment: 500,
		publicApproval: 78,
		totalVotes: 890,
		shortDescription: "Telemedicine platform connecting doctors worldwide",
		featured: true,
	},
	{
		id: 4,
		name: "FinanceFlow",
		logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "Singapore",
		countryFlag: "🇸🇬",
		sector: "FinTech",
		investmentGoal: 1000000,
		currentInvestment: 670000,
		minInvestment: 5000,
		publicApproval: 95,
		totalVotes: 3421,
		shortDescription: "Next-gen payment processing infrastructure",
		featured: true,
	},
	{
		id: 5,
		name: "EduLearn Platform",
		logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "Brazil",
		countryFlag: "🇧🇷",
		sector: "Education",
		investmentGoal: 200000,
		currentInvestment: 145000,
		minInvestment: 250,
		publicApproval: 84,
		totalVotes: 1567,
		shortDescription: "Interactive learning for the digital generation",
	},
	{
		id: 6,
		name: "AgriTech Innovations",
		logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop",
		photo:
			"https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		country: "Netherlands",
		countryFlag: "🇳🇱",
		sector: "Agriculture",
		investmentGoal: 450000,
		currentInvestment: 267000,
		minInvestment: 1500,
		publicApproval: 89,
		totalVotes: 1890,
		shortDescription: "Smart farming solutions using IoT and AI",
	},
];

// ============================================
// MOCK DATA - ANNOUNCEMENTS
// ============================================
export const announcements: Announcement[] = [
	{
		id: 1,
		type: "left",
		title: "🎉 New Investment Round Open",
		description: "Join 500+ investors in our latest opportunity",
	},
	{
		id: 2,
		type: "right",
		title: "📈 Record Returns This Quarter",
		description: "Our top startups achieved 340% growth",
	},
];

// ============================================
// MOCK DATA - FEATURED STARTUP PROFILE
// ============================================
export const featuredStartupProfile: FeaturedStartupProfile = {
	id: "featured-1",
	name: "David Dias",
	role: "Inventor/Startup/Company",
	photo:
		"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
	companyLogo:
		"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
	companyName: "Investment AI Feature",
	projectName: "Investment AI Feature",
	city: "Tokyo",
	country: "Japan",
	countryFlag: "🇯🇵",
	coverImage:
		"https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
	capitalPercentage: 15,
	capitalTotalValue: "1.800000€",
	commission: 0,
	photos: [
		"https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
	],
	video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	description: "Investment AI feature",
	approvalRate: 89,
	likes: 2,
	views: 1,
	availableStatus: true,
};

// ============================================
// MOCK DATA - FEATURED INVESTOR
// ============================================
export const featuredInvestor: FeaturedInvestor = {
	name: "Cesare Okerosi",
	role: "Angel Investor",
	photo:
		"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
	location: "Amsterdam, Netherlands",
	country: "🇳🇱",
	company: "INVESTMENT COMPANY",
	coverImage:
		"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
	description:
		"Looking for early-stage Fintech startups with innovative payment solutions, blockchain technology, or digital banking platforms. I prefer companies with a clear revenue model.",
	portfolio: [
		{
			name: "Portfolio 1",
			image:
				"https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop",
		},
		{
			name: "Portfolio 2",
			image:
				"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
		},
		{
			name: "Portfolio 3",
			image:
				"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop",
		},
		{
			name: "Portfolio 4",
			image:
				"https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop",
		},
		{
			name: "Portfolio 5",
			image:
				"https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop",
		},
		{
			name: "Portfolio 6",
			image:
				"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
		},
	],
};

// ============================================
// FILTER OPTIONS
// ============================================
export const sectors = [
	"All Sectors",
	"Technology",
	"Clean Energy",
	"Healthcare",
	"FinTech",
	"Education",
	"Agriculture",
];
export const countries = [
	"All Countries",
	"United States",
	"Germany",
	"United Kingdom",
	"Singapore",
	"Brazil",
	"Netherlands",
];
export const statuses = [
	"All Status",
	"Active",
	"Funding",
	"Completed",
	"Pending",
	"Closed",
];
export const categories = [
	"All Categories",
	"Technology",
	"Healthcare",
	"Clean Energy",
	"FinTech",
	"Education",
	"Agriculture",
	"Real Estate",
	"Manufacturing",
];
export const cities = [
	"All Cities",
	"New York",
	"San Francisco",
	"London",
	"Berlin",
	"Singapore",
	"Dubai",
	"São Paulo",
	"Amsterdam",
];
export const investmentRanges = [
	"All Ranges",
	"$0 - $50K",
	"$50K - $100K",
	"$100K - $250K",
	"$250K - $500K",
	"$500K+",
];
export const equityRanges = [
	"All %",
	"1% - 5%",
	"5% - 10%",
	"10% - 20%",
	"20% - 30%",
	"30%+",
];
