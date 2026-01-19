import { useEffect } from "react";
import { Spinner } from "reactstrap";

interface SpinnersProps {
	setLoading: (loading: boolean) => void;
}

const Spinners = ({ setLoading }: SpinnersProps) => {
	useEffect(() => {
		setTimeout(() => {
			setLoading(false);
		}, 1000);
	}, [setLoading]);

	return (
		<Spinner
			className="position-absolute top-50 start-50"
			animation="border"
			color="primary"
		/>
	);
};

export default Spinners;
