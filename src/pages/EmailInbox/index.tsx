import { Container } from "reactstrap";
import EmailToolbar from "./EmailToolbar";

const MailInbox = () => {
	document.title = "Mailbox | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<div className="email-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
					<EmailToolbar />
				</div>
			</Container>
		</div>
	);
};

export default MailInbox;
