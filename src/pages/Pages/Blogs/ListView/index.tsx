import BreadCrumb from "Components/Common/BreadCrumb";
import { Container, Row } from "reactstrap";
import MainList from "./MainList";
import Sidepanel from "./Sidepanel";

const BlogListView = () => {
	document.title = "List View | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="List View" pageTitle="Blogs" />
				<Row>
					<Sidepanel />

					<MainList />
				</Row>
			</Container>
		</div>
	);
};

export default BlogListView;
