import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import BuySellCoin from "./BuySellCoin";
import Market from "./Market";
import MarketGraph from "./MarketGraph";
import Widgets from "./Widgets";

const BuySell = () => {
	document.title = "Buy & Sell | Velzon - React Admin & Dashboard Template";
	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Buy & Sell" pageTitle="Crypto" />
				<Row>
					<Widgets />
				</Row>
				<Row>
					<MarketGraph dataColors='["--vz-success", "--vz-danger"]' />
					<BuySellCoin />
				</Row>
				<Market />
			</Container>
		</div>
	);
};

export default BuySell;
