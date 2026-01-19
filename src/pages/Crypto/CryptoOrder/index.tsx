import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row } from "reactstrap";
import { createSelector } from "reselect";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getOrderList } from "../../../slices/thunks";
import AllOrders from "./AllOrders";

const CryproOrder = () => {
	const dispatch = useDispatch();

	const cryptoorderData = createSelector(
		(state) => state.Crypto,
		(orderList) => orderList.orderList,
	);
	// Inside your component
	const orderList = useSelector(cryptoorderData);

	useEffect(() => {
		dispatch(getOrderList());
	}, [dispatch]);

	document.title = "Orders | Velzon - React Admin & Dashboard Template";

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Orders" pageTitle="Crypto" />
				<Row>
					<AllOrders orderList={orderList} />
				</Row>
			</Container>
		</div>
	);
};

export default CryproOrder;
