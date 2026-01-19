import { Container } from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import BasicAction from "./BasicAction";
import EmailVerifyAction from "./EmailVerifyAction";
import PasswordChangeAction from "./PasswordChangeAction";
import SubscribeAction from "./SubscribeAction";
import "./font.css";
const index = () => {
	document.title = "Basic Action | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Basic Action" pageTitle="Basic Action" />
				<BasicAction />
				<SubscribeAction />
				<EmailVerifyAction />
				<PasswordChangeAction />
			</Container>
		</div>
	);
};

export default index;
