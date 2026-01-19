import { Container } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

import List from "./List";

const ProjectList = () => {
	document.title = "Project List | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Project List" pageTitle="Projects" />
				<List />
			</Container>
		</div>
	);
};

export default ProjectList;
