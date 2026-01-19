import { Link } from "react-router-dom";
import { Badge, Button, Card, CardBody, Col, Row } from "reactstrap";

interface GalleryCardProps {
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
	location?: string;
	description?: string;
	onClick?: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
	id,
	title,
	artist,
	imageUrl,
	category,
	views,
	availableStatus,
	availableLabel,
	badges,
	likes,
	author,
	location,
	description,
	onClick,
}) => {
	return (
		<Card className="h-100 border-0 startup-card">
			<CardBody className="p-0">
				{/* Dual Frame Section - Photo + Clickable Area */}
				<Row className="g-0">
					{/* Photo Frame */}
					<Col xs={6}>
						<Link
							to={`/gallery/${id}`}
							onClick={onClick}
							className="text-body d-block"
						>
							<div className="position-relative card-frame-height">
								<img
									src={imageUrl}
									alt={title}
									className="w-100 h-100"
									style={{ objectFit: "cover" }}
									onError={(e) => {
										(e.target as HTMLImageElement).src = "/placeholder.svg";
									}}
								/>
								<div className="position-absolute bottom-0 start-0 end-0 p-2 card-overlay-gradient">
									<div className="d-flex align-items-center gap-1 gap-sm-2">
										{author?.avatarUrl && (
											<img
												src={author.avatarUrl}
												alt={author.name}
												className="card-startup-logo"
												style={{
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													objectFit: "cover",
												}}
											/>
										)}
										<span className="text-white fw-medium card-startup-name">
											{title}
										</span>
									</div>
								</div>
								{/* Badges overlay */}
								{badges && badges.length > 0 && (
									<div className="position-absolute top-0 start-0 p-2 d-flex gap-1 flex-wrap">
										{badges.slice(0, 2).map((badge) => (
											<Badge
												key={badge}
												color="success"
												className="badge-soft-success"
												style={{ fontSize: "0.7rem" }}
											>
												{badge}
											</Badge>
										))}
									</div>
								)}
							</div>
						</Link>
					</Col>

					{/* Right Frame - Clickable Detail Link */}
					<Col xs={6}>
						<Link
							to={`/gallery/${id}`}
							onClick={onClick}
							className="text-body d-block"
						>
							<div className="position-relative cursor-pointer card-frame-height">
								<img
									src={imageUrl}
									alt={title}
									className="w-100 h-100 card-video-overlay"
									style={{ objectFit: "cover" }}
									onError={(e) => {
										(e.target as HTMLImageElement).src = "/placeholder.svg";
									}}
								/>
								<div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center card-play-btn">
									<i
										className="ri-eye-line card-play-icon"
										style={{ fontSize: "1.5rem" }}
									></i>
								</div>
								<div className="position-absolute bottom-0 start-0 end-0 p-2 text-center card-video-overlay-bottom">
									<small className="text-white card-video-label">
										<i className="ri-information-line me-1"></i>
										<span className="d-none d-sm-inline">View </span>Details
									</small>
								</div>
							</div>
						</Link>
					</Col>
				</Row>

				{/* Card Content */}
				<div className="card-content">
					{/* Country & Category Tags */}
					<div className="d-flex justify-content-between align-items-center mb-2">
						<span className="d-flex align-items-center gap-1 card-country-text">
							{location && <span>{location}</span>}
							{author?.country && !location && <span>{author.country}</span>}
						</span>
						{category && (
							<Badge className="card-sector-badge">{category}</Badge>
						)}
					</div>

					{/* Title */}
					<h6 className="mb-1 fw-semibold">{title}</h6>
					{artist && (
						<p
							className="text-muted mb-2 card-description"
							style={{ fontSize: "0.85rem" }}
						>
							by {artist}
						</p>
					)}

					{/* Description */}
					{description && (
						<p
							className="text-muted mb-3 card-description"
							style={{ fontSize: "0.8rem" }}
						>
							{description.length > 80
								? `${description.substring(0, 80)}...`
								: description}
						</p>
					)}

					{/* Stats Row */}
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div className="d-flex align-items-center gap-3">
							<small className="text-muted">
								<i className="ri-eye-line me-1"></i>
								{views.toLocaleString()}
							</small>
							<small className="text-muted">
								<i className="mdi mdi-heart text-danger me-1"></i>
								{likes}
							</small>
						</div>
						{availableStatus ? (
							<Badge color="success" className="badge-soft-success">
								{availableLabel || "Available"}
							</Badge>
						) : (
							<Badge color="danger" className="badge-soft-danger">
								{availableLabel || "Unavailable"}
							</Badge>
						)}
					</div>

					{/* Author Info */}
					{author && (
						<div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded">
							{author.avatarUrl ? (
								<img
									src={author.avatarUrl}
									alt={author.name}
									className="avatar-xs rounded-circle"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/circle cx='12' cy='7' r='4'%3E%3C/svg%3E";
									}}
								/>
							) : (
								<div className="avatar-xs">
									<div className="avatar-title rounded-circle bg-primary text-white">
										<i className="ri-user-3-fill" />
									</div>
								</div>
							)}
							<div className="flex-grow-1">
								<h6 className="mb-0 fs-14">
									{author.name}
									{author.verified && (
										<i className="ri-verified-badge-fill text-primary ms-1" />
									)}
								</h6>
								{author.country && (
									<small className="text-muted">{author.country}</small>
								)}
							</div>
						</div>
					)}

					{/* View Details Button */}
					<Button
						color="primary"
						className="w-100 btn-proposal"
						onClick={onClick}
						tag={Link}
						to={`/gallery/${id}`}
					>
						<i className="ri-eye-line me-1 me-sm-2"></i>
						View Details
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default GalleryCard;
