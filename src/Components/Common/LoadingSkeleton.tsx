import { Card, CardBody, Col, Row } from "reactstrap";

interface SkeletonProps {
	count?: number;
	height?: string;
	width?: string;
	className?: string;
}

export const Skeleton = ({ count = 1, height = "20px", width = "100%", className = "" }: SkeletonProps) => {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className={`skeleton ${className}`}
					style={{
						height,
						width,
						background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
						backgroundSize: "200% 100%",
						animation: "skeleton-loading 1.5s ease-in-out infinite",
						borderRadius: "4px",
						marginBottom: "8px",
					}}
				/>
			))}
			<style>
				{`
					@keyframes skeleton-loading {
						0% {
							background-position: 200% 0;
						}
						100% {
							background-position: -200% 0;
						}
					}
				`}
			</style>
		</>
	);
};

export const CardSkeleton = () => {
	return (
		<Card>
			<CardBody>
				<Skeleton count={1} height="24px" width="60%" />
				<Skeleton count={1} height="16px" width="40%" className="mt-3" />
				<Skeleton count={3} height="12px" width="100%" className="mt-2" />
			</CardBody>
		</Card>
	);
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
	return (
		<div className="table-responsive">
			<table className="table table-nowrap">
				<thead>
					<tr>
						<th><Skeleton height="20px" width="100px" /></th>
						<th><Skeleton height="20px" width="150px" /></th>
						<th><Skeleton height="20px" width="120px" /></th>
						<th><Skeleton height="20px" width="100px" /></th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }).map((_, index) => (
						<tr key={index}>
							<td><Skeleton height="16px" width="80px" /></td>
							<td><Skeleton height="16px" width="120px" /></td>
							<td><Skeleton height="16px" width="100px" /></td>
							<td><Skeleton height="16px" width="80px" /></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export const DashboardSkeleton = () => {
	return (
		<Row>
			{Array.from({ length: 6 }).map((_, index) => (
				<Col xl={4} md={6} key={index} className="mb-4">
					<CardSkeleton />
				</Col>
			))}
		</Row>
	);
};

// KPI Cards Skeleton for Dashboard
export const KPICardsSkeleton = () => {
	return (
		<Row>
			{Array.from({ length: 6 }).map((_, index) => (
				<Col md={6} xl={4} key={index} className="mb-4">
					<Card className="card-animate">
						<CardBody>
							<div className="d-flex justify-content-between">
								<div style={{ flex: 1 }}>
									<Skeleton height="16px" width="60%" className="mb-3" />
									<Skeleton height="32px" width="80%" />
								</div>
								<div>
									<Skeleton height="48px" width="48px" style={{ borderRadius: "50%" }} />
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			))}
		</Row>
	);
};

// Table Page Skeleton (for Users, Projects, Invoices, etc.)
export const TablePageSkeleton = ({ columns = 7, rows = 8 }: { columns?: number; rows?: number }) => {
	return (
		<Card>
			<CardBody>
				{/* Header with search/filters */}
				<div className="d-flex justify-content-between align-items-center mb-4">
					<Skeleton height="28px" width="200px" />
					<div className="d-flex gap-2">
						<Skeleton height="38px" width="250px" />
						<Skeleton height="38px" width="150px" />
						<Skeleton height="38px" width="150px" />
					</div>
				</div>
				{/* Table */}
				<div className="table-responsive">
					<table className="table table-nowrap align-middle mb-0">
						<thead className="table-light">
							<tr>
								{Array.from({ length: columns }).map((_, index) => (
									<th key={index}>
										<Skeleton height="20px" width={index === 0 ? "120px" : index === columns - 1 ? "80px" : "100px"} />
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: rows }).map((_, rowIndex) => (
								<tr key={rowIndex}>
									{Array.from({ length: columns }).map((_, colIndex) => (
										<td key={colIndex}>
											{colIndex === 0 ? (
												// First column with avatar
												<div className="d-flex align-items-center">
													<Skeleton height="40px" width="40px" style={{ borderRadius: "50%" }} className="me-2" />
													<div>
														<Skeleton height="16px" width="120px" className="mb-1" />
														<Skeleton height="12px" width="80px" />
													</div>
												</div>
											) : colIndex === columns - 1 ? (
												// Last column with action button
												<Skeleton height="32px" width="32px" style={{ borderRadius: "4px" }} />
											) : (
												<Skeleton height="16px" width={colIndex === 1 ? "150px" : "100px"} />
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardBody>
		</Card>
	);
};

// Chart Skeleton for Analytics page
export const ChartSkeleton = ({ height = 350 }: { height?: number }) => {
	return (
		<Card>
			<CardBody>
				<Skeleton height="24px" width="200px" className="mb-4" />
				<Skeleton height={`${height}px`} width="100%" style={{ borderRadius: "8px" }} />
			</CardBody>
		</Card>
	);
};

// Analytics Page Skeleton
export const AnalyticsPageSkeleton = () => {
	return (
		<>
			{/* Filter bar */}
			<Row className="mb-3">
				<Col md={3}>
					<Skeleton height="38px" width="150px" />
				</Col>
			</Row>
			{/* Charts grid */}
			<Row>
				<Col xl={6} className="mb-4">
					<ChartSkeleton />
				</Col>
				<Col xl={6} className="mb-4">
					<ChartSkeleton />
				</Col>
			</Row>
			<Row>
				<Col xs={12} className="mb-4">
					<ChartSkeleton height={400} />
				</Col>
			</Row>
			<Row>
				<Col xl={6} className="mb-4">
					<ChartSkeleton />
				</Col>
				<Col xl={6} className="mb-4">
					<ChartSkeleton />
				</Col>
			</Row>
		</>
	);
};
