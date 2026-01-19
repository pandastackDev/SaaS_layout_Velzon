import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const Starter = () => {
	document.title = "Starter | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Starter" pageTitle="Pages" />
				<Row>
					<Col xs={12}></Col>
				</Row>
			</Container>
		</div>
	);
};

export default Starter;
