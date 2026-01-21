import { Link, useNavigate } from "react-router-dom";
import { Col, Row, Button } from "reactstrap";

interface BreadCrumbProps {
	title: string;
	pageTitle: string;
	showBackButton?: boolean;
	backPath?: string;
}

const BreadCrumb = ({ title, pageTitle, showBackButton = false, backPath }: BreadCrumbProps) => {
	const navigate = useNavigate();
	
	return (
		<Row>
			<Col xs={12}>
				<div className="page-title-box d-sm-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center gap-2">
						{showBackButton && (
							<Button
								color="light"
								size="sm"
								className="btn-icon"
								onClick={() => backPath ? navigate(backPath) : navigate(-1)}
							>
								<i className="ri-arrow-left-line"></i>
							</Button>
						)}
						<h4 className="mb-0">{title}</h4>
					</div>

					<div className="page-title-right">
						<ol className="breadcrumb m-0">
							<li className="breadcrumb-item">
								<Link to="#">{pageTitle}</Link>
							</li>
							<li className="breadcrumb-item active">{title}</li>
						</ol>
					</div>
				</div>
			</Col>
		</Row>
	);
};

export default BreadCrumb;
