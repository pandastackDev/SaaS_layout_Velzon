import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Badge, Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import GalleryCard from "../../../Components/Common/GalleryCard";
import Loader from "../../../Components/Common/Loader";
import { galleryItems } from "../galleryData";

// TODO: Replace these with your actual implementations
// import { fetchGalleryItemById, fetchGalleryItems, incrementProjectViews, toggleProjectLike } from '../../../lib/projects';
// import { useAuth } from '../../../hooks/useAuth';
const toggleProjectLike = async (
	_projectId: string,
	_userId: string,
	_galleryId: string,
) => 0;
const useAuth = () => ({ user: null, loading: false });

interface GalleryItem {
	id: string | number;
	title: string;
	artist: string;
	subtitle?: string;
	imageUrl: string;
	images?: string[];
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
	project_id?: string;
}

interface BidData {
	currentBid: number;
	totalBids: number;
	hasBids: boolean;
}

const GalleryDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [item, setItem] = useState<GalleryItem | null>(null);
	const [relatedItems] = useState<GalleryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [bidData] = useState<BidData>({
		currentBid: 0,
		totalBids: 0,
		hasBids: false,
	});
	const [projectData] = useState<unknown>(null);
	const [startingAuction] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [hasLiked, setHasLiked] = useState(false);

	const loadGalleryItem = useCallback(async () => {
		try {
			setLoading(true);

			if (!id) {
				navigate("/gallery");
				return;
			}

			// Find item from static data
			const galleryItem = galleryItems.find(
				(item) => item.id.toString() === id,
			);

			if (!galleryItem) {
				toast("Gallery item not found", {
					position: "top-right",
					hideProgressBar: false,
					className: "bg-danger text-white",
				});
				navigate("/gallery");
				return;
			}

			// Convert to UI format
			const convertedItem: GalleryItem = {
				id: galleryItem.id,
				title: galleryItem.title,
				artist: galleryItem.artist,
				subtitle: galleryItem.subtitle,
				imageUrl: galleryItem.imageUrl,
				images: galleryItem.images,
				category: galleryItem.category,
				views: galleryItem.views,
				availableStatus: galleryItem.availableStatus,
				availableLabel: galleryItem.availableLabel,
				badges: galleryItem.badges,
				likes: galleryItem.likes,
				author: galleryItem.author,
				date: galleryItem.date,
				description: galleryItem.description,
				location: galleryItem.location,
			};

			setItem(convertedItem);
		} catch (error: unknown) {
			console.error("Error loading gallery item:", error);
			toast("Failed to load gallery item", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-danger text-white",
			});
			navigate("/gallery");
		} finally {
			setLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		if (id) {
			loadGalleryItem();
		}
	}, [id, loadGalleryItem]);

	const handleLikeClick = async () => {
		if (!user) {
			toast("Please sign in to like projects", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-warning text-white",
			});
			navigate("/login");
			return;
		}

		if (!item?.project_id || isLiking) {
			return;
		}

		setIsLiking(true);
		try {
			const newLikes = await toggleProjectLike(
				item.project_id,
				user.id,
				item.id.toString(),
			);

			setItem((prev) => (prev ? { ...prev, likes: newLikes } : null));
			setHasLiked(!hasLiked);

			toast(hasLiked ? "Unliked project" : "Liked project", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-success text-white",
			});
		} catch (error: unknown) {
			console.error("Error toggling like:", error);
			toast("Failed to update like. Please try again.", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-danger text-white",
			});
		} finally {
			setIsLiking(false);
		}
	};

	const formatCurrency = (amount: number) => {
		if (amount >= 1000000) {
			return `$${(amount / 1000000).toFixed(1)}M`;
		}
		if (amount >= 1000) {
			return `$${(amount / 1000).toFixed(0)}K`;
		}
		return `$${amount.toFixed(0)}`;
	};

	const handleAuctionClick = () => {
		if (bidData.hasBids) {
			navigate(`/auction/${item?.id}`);
			return;
		}

		if (!user) {
			toast("Please sign in to start auctions", {
				position: "top-right",
				hideProgressBar: false,
				className: "bg-warning text-white",
			});
			navigate("/login");
			return;
		}

		// Start auction logic here
		navigate(`/auction/${item?.id}`);
	};

	const handleShareClick = () => {
		navigator.clipboard.writeText(window.location.href);
		toast("Project link copied to clipboard!", {
			position: "top-right",
			hideProgressBar: false,
			className: "bg-success text-white",
		});
	};

	document.title = `${item?.title || "Gallery Detail"} | Velzon - React Admin & Dashboard Template`;

	if (loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<div className="py-5">
						<Loader />
					</div>
				</Container>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="page-content">
				<Container fluid>
					<Card>
						<CardBody className="text-center py-5">
							<div>
								<i className="ri-error-warning-line display-5 text-danger" />
							</div>
							<div className="mt-4">
								<h5>Item not found</h5>
								<Link to="/gallery" className="btn btn-primary mt-3">
									<i className="ri-arrow-left-line me-1" />
									Back to gallery
								</Link>
							</div>
						</CardBody>
					</Card>
				</Container>
			</div>
		);
	}

	const images =
		item.images && item.images.length > 0 ? item.images : [item.imageUrl];
	const investmentAmount = projectData?.investment_amount
		? parseFloat(projectData.investment_amount.replace(/[^0-9.]/g, "")) || 0
		: 0;

	return (
		<div className="page-content">
			<ToastContainer closeButton={false} limit={1} />
			<Container fluid>
				<BreadCrumb title={item.title} pageTitle="Gallery" />

				{/* Gallery Item Detail */}
				<Row>
					{/* Left - Image Gallery */}
					<Col lg={8}>
						<Card>
							<CardBody className="p-0">
								{/* Main Image */}
								<div className="position-relative">
									<img
										src={images[currentIdx]}
										alt={item.title}
										className="img-fluid w-100"
										style={{
											height: "500px",
											objectFit: "cover",
										}}
										onError={(e) => {
											(e.target as HTMLImageElement).src = "/placeholder.svg";
										}}
									/>
									{images.length > 1 && (
										<>
											<button
												onClick={() =>
													setCurrentIdx(
														(prev) =>
															(prev - 1 + images.length) % images.length,
													)
												}
												className="btn btn-icon btn-primary position-absolute top-50 start-0 translate-middle-y ms-3"
												type="button"
											>
												<i className="ri-arrow-left-s-line" />
											</button>
											<button
												onClick={() =>
													setCurrentIdx((prev) => (prev + 1) % images.length)
												}
												className="btn btn-icon btn-primary position-absolute top-50 end-0 translate-middle-y me-3"
												type="button"
											>
												<i className="ri-arrow-right-s-line" />
											</button>
										</>
									)}
								</div>

								{/* Thumbnail Strip */}
								{images.length > 1 && (
									<div className="p-3">
										<div className="d-flex gap-2 flex-wrap">
											{images.map((img: string, idx: number) => (
												<button
													key={img}
													type="button"
													onClick={() => setCurrentIdx(idx)}
													className={`cursor-pointer border rounded ${currentIdx === idx ? "border-primary" : "border-light"}`}
													style={{
														width: "80px",
														height: "80px",
														overflow: "hidden",
														background: "none",
														padding: 0,
													}}
												>
													<img
														src={img}
														alt={`Thumbnail ${idx + 1}`}
														className="img-fluid w-100 h-100 object-fit-cover"
														onError={(e) => {
															(e.target as HTMLImageElement).src =
																"/placeholder.svg";
														}}
													/>
												</button>
											))}
										</div>
									</div>
								)}
							</CardBody>
						</Card>

						{/* Description Section */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Project Description</h5>
								<p className="text-muted">
									{item.description ||
										"Detailed project overview and value proposition are provided here to give potential investors context and rationale for interest."}
								</p>
							</CardBody>
						</Card>

						{/* Technical Specifications */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Technical Specifications</h5>
								<Row className="g-3">
									<Col md={6}>
										<div>
											<p className="text-muted mb-1 fs-12 text-uppercase">
												Patent Status
											</p>
											<h6 className="mb-0">Patent Pending</h6>
										</div>
									</Col>
									<Col md={6}>
										<div>
											<p className="text-muted mb-1 fs-12 text-uppercase">
												Development Stage
											</p>
											<h6 className="mb-0">Prototype Ready</h6>
										</div>
									</Col>
								</Row>
								<p className="text-muted mt-3 mb-0">
									Detailed technical documentation including engineering
									specifications, materials analysis, performance metrics, and
									testing results are available to registered investors.
								</p>
							</CardBody>
						</Card>

						{/* Available Documents */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Available Documents</h5>
								<div className="bg-light rounded p-3">
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<h6 className="mb-1">Clinical Data</h6>
											<p className="text-muted mb-0 fs-12">Technical brief</p>
										</div>
										<Badge color="warning" className="badge-soft-warning">
											Login required
										</Badge>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>

					{/* Right - Project Details */}
					<Col lg={4}>
						{/* Title and Badges */}
						<Card>
							<CardBody>
								<div className="d-flex gap-2 flex-wrap mb-3">
									{item.badges?.map((badge) => (
										<Badge
											key={badge}
											color="success"
											className="badge-soft-success"
										>
											{badge}
										</Badge>
									))}
								</div>
								<h4 className="mb-2">{item.title}</h4>
								{item.subtitle && (
									<p className="text-muted mb-3">{item.subtitle}</p>
								)}

								{/* Like Button */}
								<div className="d-flex justify-content-end mb-3">
									<Button
										color={hasLiked ? "danger" : "light"}
										size="sm"
										onClick={handleLikeClick}
										disabled={isLiking}
										className="btn-icon"
									>
										<i
											className={`${hasLiked ? "mdi mdi-heart" : "mdi mdi-heart-outline"} fs-16`}
										/>
										<span className="ms-1">{item.likes}</span>
									</Button>
								</div>

								{/* Author Info */}
								{item.author && (
									<div className="d-flex align-items-center p-3 bg-light rounded mb-3">
										{item.author.avatarUrl ? (
											<img
												src={item.author.avatarUrl}
												alt={item.author.name}
												className="avatar-sm rounded-circle me-3"
											/>
										) : (
											<div className="avatar-sm me-3">
												<div className="avatar-title rounded-circle bg-primary text-white">
													<i className="ri-user-3-fill" />
												</div>
											</div>
										)}
										<div className="flex-grow-1">
											<h6 className="mb-1">
												{item.author.name}
												{item.author.verified && (
													<i className="ri-verified-badge-fill text-primary ms-1" />
												)}
											</h6>
											<p className="text-muted mb-0 fs-12">
												{item.author.country || item.location}
											</p>
										</div>
									</div>
								)}

								{/* Info Grid */}
								<Row className="g-3 mb-3">
									{item.location && (
										<Col xs={6}>
											<div className="p-3 bg-light rounded">
												<p className="text-muted mb-1 fs-12 text-uppercase">
													Location
												</p>
												<h6 className="mb-0">{item.location}</h6>
											</div>
										</Col>
									)}
									{item.category && (
										<Col xs={6}>
											<div className="p-3 bg-light rounded">
												<p className="text-muted mb-1 fs-12 text-uppercase">
													Category
												</p>
												<Badge color="primary" className="badge-soft-primary">
													{item.category}
												</Badge>
											</div>
										</Col>
									)}
								</Row>
							</CardBody>
						</Card>

						{/* Auction/Bidding Section */}
						{(bidData.hasBids ||
							user?.user_metadata?.user_type === "Investor") && (
							<Card>
								<CardBody>
									<h5 className="card-title mb-3">Auction Information</h5>
									<Row className="g-3 mb-3">
										<Col xs={6}>
											<p className="text-muted mb-1 fs-12 text-uppercase">
												Current Bid
											</p>
											<h4 className="mb-0 text-primary">
												{bidData.hasBids
													? formatCurrency(bidData.currentBid)
													: "$0"}
											</h4>
										</Col>
										<Col xs={6}>
											<p className="text-muted mb-1 fs-12 text-uppercase">
												Total Bids
											</p>
											<h4 className="mb-0 text-primary">{bidData.totalBids}</h4>
										</Col>
									</Row>
									<Button
										color="primary"
										className="w-100"
										onClick={handleAuctionClick}
										disabled={startingAuction}
									>
										{bidData.hasBids ? (
											<>
												<i className="ri-auction-line me-1" />
												View Auction
											</>
										) : startingAuction ? (
											<>
												<span className="spinner-border spinner-border-sm me-1" />
												Starting...
											</>
										) : (
											<>
												<i className="ri-play-line me-1" />
												Start Auction
											</>
										)}
									</Button>
								</CardBody>
							</Card>
						)}

						{/* Investment Options */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Investment Options</h5>
								<div className="p-3 bg-light rounded mb-3">
									<div className="d-flex justify-content-between align-items-start mb-2">
										<div>
											<h6 className="mb-1">Acquisition Offer</h6>
											<p className="text-muted mb-2 fs-12">
												Complete technology acquisition
											</p>
											<ul className="text-muted mb-0 fs-12 ps-3">
												<li>FDA approval support</li>
												<li>Manufacturing setup</li>
												<li>Market launch partnership</li>
											</ul>
										</div>
										<h5 className="text-primary mb-0">
											{investmentAmount > 0
												? formatCurrency(investmentAmount)
												: "$25.0M"}
										</h5>
									</div>
								</div>
								<p className="text-muted mb-0 fs-12">
									Minimum Investment: USD 10,000,000
								</p>
							</CardBody>
						</Card>

						{/* Register CTA */}
						{!user && (
							<Card>
								<CardBody>
									<Button
										color="success"
										className="w-100"
										onClick={() => navigate("/register")}
									>
										<i className="ri-user-add-line me-1" />
										REGISTER TO INVEST
									</Button>
								</CardBody>
							</Card>
						)}

						{/* Key Facts */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Key Facts</h5>
								<div className="table-responsive">
									<table className="table table-borderless mb-0">
										<tbody>
											<tr>
												<td className="text-muted">Project ID</td>
												<td className="fw-medium text-end">
													PROJ-{String(item.id).slice(0, 8)}
												</td>
											</tr>
											<tr>
												<td className="text-muted">Status</td>
												<td className="text-end">
													<Badge
														color={item.availableStatus ? "success" : "danger"}
														className={
															item.availableStatus
																? "badge-soft-success"
																: "badge-soft-danger"
														}
													>
														{item.availableLabel ||
															(item.availableStatus
																? "Available"
																: "Unavailable")}
													</Badge>
												</td>
											</tr>
											{item.category && (
												<tr>
													<td className="text-muted">Category</td>
													<td className="fw-medium text-end">
														{item.category}
													</td>
												</tr>
											)}
											{item.date && (
												<tr>
													<td className="text-muted">Listed</td>
													<td className="fw-medium text-end">{item.date}</td>
												</tr>
											)}
											<tr>
												<td className="text-muted">Views</td>
												<td className="fw-medium text-end">{item.views}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</CardBody>
						</Card>

						{/* Share Project */}
						<Card>
							<CardBody>
								<h5 className="card-title mb-3">Share Project</h5>
								<div className="d-flex gap-2">
									<Button
										color="light"
										size="sm"
										className="btn-icon"
										onClick={handleShareClick}
									>
										<i className="ri-share-line" />
									</Button>
									<Button color="light" size="sm" className="btn-icon">
										<i className="ri-twitter-fill text-info" />
									</Button>
									<Button color="light" size="sm" className="btn-icon">
										<i className="ri-facebook-fill text-primary" />
									</Button>
									<Button color="light" size="sm" className="btn-icon">
										<i className="ri-linkedin-fill text-primary" />
									</Button>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>

				{/* Similar Gallery */}
				{relatedItems.length > 0 && (
					<Row>
						<Col lg={12}>
							<div className="d-flex align-items-center mb-4">
								<div className="flex-grow-1">
									<h5 className="card-title mb-0 fw-bold fs-17">
										Similar Gallery
									</h5>
									<p className="text-muted mb-0">
										Explore related items you might be interested in.
									</p>
								</div>
							</div>
						</Col>
					</Row>
				)}

				<Row className="row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1">
					{relatedItems.map((relatedItem) => (
						<Col key={relatedItem.id}>
							<GalleryCard
								{...relatedItem}
								onClick={() => navigate(`/gallery/${relatedItem.id}`)}
							/>
						</Col>
					))}
				</Row>
			</Container>
		</div>
	);
};

export default GalleryDetail;
