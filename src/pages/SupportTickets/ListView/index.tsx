import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TicketsData from "./TicketsData";
import Widgets from "./Widgets";

const ListView = () => {
	document.title = "Tickets List | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Tickets List" pageTitle="Tickets" />
				<Row>
					<Widgets />
				</Row>
				<TicketsData />
			</Container>
		</div>
	);
};

export default ListView;
