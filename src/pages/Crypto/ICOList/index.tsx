import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import ICO from "./ICO";
import Widgets from "./Widgets";

const ICOList = () => {
	document.title = "ICO LIST | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="ICO LIST" pageTitle="Crypto" />
				<Row>
					<Widgets />
				</Row>
				<ICO />
			</Container>
		</div>
	);
};

export default ICOList;
