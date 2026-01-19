import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import KYC from "./KYCVerification";

const KYCVerification = () => {
	document.title =
		"KYC  Application | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="KYC Application" pageTitle="Crypto" />
				<Row>
					<KYC />
				</Row>
			</Container>
		</div>
	);
};

export default KYCVerification;
