
import React, { useEffect, useMemo, useState } from 'react';
// TODO: Replace these with your actual implementations
// import { useToast } from '../../hooks/useToast';
// import { fetchGalleryItems } from '../../lib/projects';
// import { getSortedCountries } from '../../lib/countries';
// import FilterBar from '../../components/FilterBar';
const useToast = () => ({ toast: (args: any) => {} });
const fetchGalleryItems = async (_opts: any) => [];
const getSortedCountries = () => [];
const FilterBar = (props: any) => <div />;

interface GalleryItem {
	id: string | number;
	title: string;
	artist: string;
	subtitle?: string;
	imageUrl: string;
	category?: string;
	views: number;
	availableStatus: boolean;
	availableLabel?: string;
	badges?: string[];
	likes: number;
	author?: {
		name: string;
		avatarUrl?: string;
		country?: string;
		verified?: boolean;
	};
	actions?: string[];
	date?: string;
	description?: string;
	location?: string;
}

const Gallery: React.FC = () => {
	const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchValue, setSearchValue] = useState('');
	const [statusValue, setStatusValue] = useState('all');
	const [countryValue, setCountryValue] = useState('all');
	const [categoryValue, setCategoryValue] = useState('all');
	const [cityValue, setCityValue] = useState('all');
	const [investmentRangeValue, setInvestmentRangeValue] = useState('all');
	const [equityRangeValue, setEquityRangeValue] = useState('all');
	const [tagValue, setTagValue] = useState('all');
	const [popularityValue, setPopularityValue] = useState('all');
	const { toast } = useToast();

	// Show sign-in success toast after redirect
	useEffect(() => {
		const showSignInSuccess = sessionStorage.getItem('showSignInSuccess');
		if (showSignInSuccess === 'true') {
			sessionStorage.removeItem('showSignInSuccess');
			toast({
				title: 'Signed in successfully',
				description: 'Welcome back!',
				variant: 'default',
			});
		}
	}, [toast]);

	// Fetch gallery items
	useEffect(() => {
		const loadGalleryItems = async () => {
			try {
				setLoading(true);
				const data = await fetchGalleryItems({ limit: 1000 });
				// Convert DB gallery items to UI gallery items format
				const convertedItems: GalleryItem[] = data.map((item: any) => {
					const badges: string[] = [];
					if (item.featured) badges.push('FEATURED');
					if (item.author_verified) badges.push('VALIDATED');
					if ((item.likes || 0) > 100 || (item.views || 0) > 10000) badges.push('TRENDING');
					if (item.badges && item.badges.length > 0) badges.push(...item.badges);
					return {
						id: item.id,
						title: item.title,
						artist: item.artist || item.author_name || 'Unknown',
						subtitle: item.subtitle,
						imageUrl: item.image_url || (item.images && item.images[0]) || '/placeholder.svg',
						category: item.category,
						views: item.views || 0,
						availableStatus: item.available_status ?? true,
						availableLabel: item.available_label || (item.available_status ? 'Available' : 'Unavailable'),
						badges: badges.length > 0 ? badges : undefined,
						likes: item.likes || 0,
						author: item.author_name ? {
							name: item.author_name,
							avatarUrl: item.author_avatar_url || undefined,
							country: item.author_country || undefined,
							verified: item.author_verified || false,
						} : undefined,
						actions: item.actions && item.actions.length > 0 ? item.actions : undefined,
						date: item.date,
						description: item.description,
						location: item.location || item.author_country,
					};
				});
				setGalleryItems(convertedItems);
			} catch (error) {
				console.error('Error loading gallery items:', error);
			} finally {
				setLoading(false);
			}
		};
		loadGalleryItems();
	}, []);

	// Statuses
	const statuses = useMemo(() => {
		const statusSet = new Set<string>(['Available', 'Unavailable']);
		galleryItems.forEach(item => {
			if (item.availableLabel) statusSet.add(item.availableLabel);
		});
		return Array.from(statusSet).sort();
	}, [galleryItems]);

	// Countries
	const allCountries = useMemo(() => {
		return getSortedCountries().map((country: any) => country.name);
	}, []);

	// Categories
	const categories = useMemo(() => {
		const categorySet = new Set<string>();
		galleryItems.forEach(item => {
			if (item.category && item.category.trim()) categorySet.add(item.category.trim());
		});
		return Array.from(categorySet).sort();
	}, [galleryItems]);

	// Cities
	const cities = useMemo(() => {
		const citySet = new Set<string>();
		galleryItems.forEach(item => {
			if (item.location && item.location.trim()) citySet.add(item.location.trim());
		});
		return Array.from(citySet).sort();
	}, [galleryItems]);

	// Investment ranges
	const investmentRanges = [
		'$0 - $50K',
		'$50K - $100K',
		'$100K - $250K',
		'$250K - $500K',
		'$500K - $1M',
		'$1M - $5M',
		'$5M+'
	];

	// Equity ranges
	const equityRanges = [
		'0% - 5%',
		'5% - 10%',
		'10% - 20%',
		'20% - 30%',
		'30% - 50%',
		'50%+'
	];

	// Tags
	const tags = useMemo(() => {
		const tagSet = new Set<string>();
		galleryItems.forEach(item => {
			if (item.badges && item.badges.length > 0) {
				item.badges.forEach(badge => tagSet.add(badge));
			}
		});
		return Array.from(tagSet).sort();
	}, [galleryItems]);

	// Popularity options
	const popularityOptions = [
		'Most Popular',
		'High Engagement',
		'Moderate Engagement',
		'Low Engagement'
	];

	// Filtered items
	const filteredItems = useMemo(() => {
		return galleryItems.filter(item => {
			const matchesSearch = searchValue === '' ||
				item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
				item.artist.toLowerCase().includes(searchValue.toLowerCase()) ||
				item.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
				item.category?.toLowerCase().includes(searchValue.toLowerCase());
			const matchesStatus = statusValue === 'all' || item.availableLabel === statusValue;
			const matchesCountry = countryValue === 'all' || item.location === countryValue || item.author?.country === countryValue;
			const matchesCategory = categoryValue === 'all' || item.category === categoryValue;
			const matchesCity = cityValue === 'all' || item.location === cityValue;
			const matchesInvestmentRange = investmentRangeValue === 'all' || true;
			const matchesEquityRange = equityRangeValue === 'all' || true;
			const matchesTag = tagValue === 'all' || (item.badges && item.badges.includes(tagValue));
			let matchesPopularity = true;
			if (popularityValue !== 'all') {
				const likes = item.likes || 0;
				const views = item.views || 0;
				const engagementScore = likes * 10 + views;
				switch (popularityValue) {
					case 'Most Popular':
						matchesPopularity = engagementScore > 10000;
						break;
					case 'High Engagement':
						matchesPopularity = engagementScore > 5000;
						break;
					case 'Moderate Engagement':
						matchesPopularity = engagementScore > 1000;
						break;
					case 'Low Engagement':
						matchesPopularity = engagementScore <= 1000;
						break;
					default:
						matchesPopularity = true;
				}
			}
			return matchesSearch && matchesStatus && matchesCountry && matchesCategory && matchesCity && matchesInvestmentRange && matchesEquityRange && matchesTag && matchesPopularity;
		});
	}, [galleryItems, searchValue, statusValue, countryValue, categoryValue, cityValue, investmentRangeValue, equityRangeValue, tagValue, popularityValue]);

	const handleReset = () => {
		setSearchValue('');
		setStatusValue('all');
		setCountryValue('all');
		setCategoryValue('all');
		setCityValue('all');
		setInvestmentRangeValue('all');
		setEquityRangeValue('all');
		setTagValue('all');
		setPopularityValue('all');
	};

	// Stats
	const stats = useMemo(() => {
		const activeProjects = galleryItems.filter(item => item.availableStatus).length;
		const totalProjects = galleryItems.length;
		const totalViews = galleryItems.reduce((sum, item) => sum + (item.views || 0), 0);
		const totalLikes = galleryItems.reduce((sum, item) => sum + (item.likes || 0), 0);
		const formatNumber = (num: number): string => {
			if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
			if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
			return `${num}+`;
		};
		return [
			{ value: activeProjects > 0 ? `${activeProjects}+` : '0', label: 'ACTIVE PROJECTS' },
			{ value: totalViews > 0 ? formatNumber(totalViews) : '0', label: 'TOTAL VIEWS' },
			{ value: totalProjects > 0 ? `${totalProjects}+` : '0', label: 'TOTAL PROJECTS' },
			{ value: totalLikes > 0 ? formatNumber(totalLikes) : '0', label: 'TOTAL LIKES' },
		];
	}, [galleryItems]);

	return (
		<div className="min-h-screen bg-white flex flex-col items-center mb-12">
			{/* Hero Stats Section */}
			<div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4">
				<div className="max-w-4xl mx-auto text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Gallery</h1>
					<p className="text-lg text-gray-600">Discover and invest in innovative projects.</p>
				</div>
				<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					{stats.map((stat, idx) => (
						<div key={idx} className="bg-white rounded-xl shadow p-6 text-center">
							<div className="text-2xl font-bold text-blue-900">{stat.value}</div>
							<div className="text-xs text-gray-500 mt-2">{stat.label}</div>
						</div>
					))}
				</div>
			</div>

			<div className="w-full max-w-7xl 2xl:mx-40 lg:mx-30 md:mx-10 sm:mx-10 xs:mx-10 px-4">
				<FilterBar
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					statusValue={statusValue}
					onStatusChange={setStatusValue}
					countryValue={countryValue}
					onCountryChange={setCountryValue}
					categoryValue={categoryValue}
					onCategoryChange={setCategoryValue}
					cityValue={cityValue}
					onCityChange={setCityValue}
					investmentRangeValue={investmentRangeValue}
					onInvestmentRangeChange={setInvestmentRangeValue}
					equityRangeValue={equityRangeValue}
					onEquityRangeChange={setEquityRangeValue}
					onReset={handleReset}
					statuses={statuses}
					countries={allCountries}
					categories={categories}
					cities={cities}
					investmentRanges={investmentRanges}
					equityRanges={equityRanges}
					searchPlaceholder="Search startups, founders..."
				/>

				{loading ? (
					<div className="flex justify-center items-center min-h-[300px]">
						<span>Loading...</span>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
						{filteredItems.length === 0 ? (
							<div className="col-span-full text-center text-gray-500">No projects found.</div>
						) : (
							filteredItems.map(item => (
								<div key={item.id} className="bg-white rounded-xl shadow p-4">
									<img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
									<div className="font-bold text-lg mb-2">{item.title}</div>
									<div className="text-xs text-gray-500 mb-2">{item.artist}</div>
									<div className="text-sm text-gray-600 mb-2">{item.description?.slice(0, 80)}...</div>
									<div className="flex gap-2 flex-wrap mb-2">
										{item.badges && item.badges.map((badge, i) => (
											<span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{badge}</span>
										))}
									</div>
									<div className="flex justify-between items-center mt-2">
										<span className="text-xs text-gray-400">{item.category}</span>
										<span className="text-xs text-gray-400">{item.location}</span>
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Gallery;
