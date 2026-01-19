import BreadCrumb from "Components/Common/BreadCrumb";
import { Container } from "reactstrap";
import TasksKanban from "./MainPage";

const Kanbanboard = () => {
	document.title = "Kanban Board | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Kanban Board" pageTitle="Tasks" />
				<TasksKanban />
			</Container>
		</div>
	);
};

export default Kanbanboard;
