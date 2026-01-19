import { Container, Row } from "reactstrap";

import Section from "./Section";
import TicketDescription from "./TicketDescription";
import TicketDetails from "./TicketDetails";

const TicketsDetaiks = () => {
	document.title = "Ticket Details | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<Row>
					<Section />
				</Row>
				<Row>
					<TicketDescription />
					<TicketDetails />
				</Row>
			</Container>
		</div>
	);
};

export default TicketsDetaiks;
