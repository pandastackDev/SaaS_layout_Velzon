import { Container } from "reactstrap";
import Section from "./Section";

const ProjectOverview = () => {
	document.title =
		"Project Overview | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<Section />
			</Container>
		</div>
	);
};

export default ProjectOverview;
