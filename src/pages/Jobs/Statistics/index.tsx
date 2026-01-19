import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import JobSummary from "./JobSummary";
import NatworkSummary from "./NatworkSummary";
import VisitorGraph from "./VisitorGraph";
import Widgets from "./Widgets";

const Statistics = () => {
	document.title = "Statistics | Velzon -  Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="STATISTICS" pageTitle="Jobs" />

				<Row className="row">
					<Widgets
					// dataColors='["--vz-success", "--vz-danger"]'
					/>
				</Row>

				<Row className="row">
					<VisitorGraph dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info","--vz-warning", "--vz-danger"]' />
				</Row>

				<Row className="row">
					<NatworkSummary dataColors='["--vz-primary", "--vz-info"]' />
					<JobSummary dataColors='["--vz-primary", "--vz-success", "--vz-info", "--vz-danger"]' />
				</Row>
			</Container>
		</div>
	);
};

export default Statistics;
