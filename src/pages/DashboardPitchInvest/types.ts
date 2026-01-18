// ============================================
// TYPES & INTERFACES
// ============================================

export interface Startup {
  id: number;
  name: string;
  logo: string;
  photo: string;
  video: string;
  country: string;
  countryFlag: string;
  sector: string;
  investmentGoal: number;
  currentInvestment: number;
  minInvestment: number;
  publicApproval: number;
  totalVotes: number;
  shortDescription: string;
  featured?: boolean;
}

export interface Announcement {
  id: number;
  type: "left" | "right";
  title: string;
  description: string;
  link?: string;
}

export interface FeaturedStartupProfile {
  id: string;
  name: string;
  role: string;
  photo: string;
  companyLogo: string;
  companyName: string;
  projectName: string;
  city: string;
  country: string;
  countryFlag: string;
  coverImage: string;
  capitalPercentage: number;
  capitalTotalValue: string;
  commission: number;
  photos: string[];
  video: string;
  description: string;
  approvalRate: number;
  likes: number;
  views: number;
  availableStatus: boolean;
}

export interface FeaturedInvestor {
  name: string;
  role: string;
  photo: string;
  location: string;
  country: string;
  company: string;
  coverImage: string;
  description: string;
  portfolio: { name: string; image: string }[];
}
