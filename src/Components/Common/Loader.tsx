import React from "react";
import { toast } from "react-toastify";
import { Spinner } from "reactstrap";
import "react-toastify/dist/ReactToastify.css";

interface LoaderProps {
	error?: string;
}

const Loader = (props: LoaderProps) => {
	return (
		<React.Fragment>
			<div className="d-flex justify-content-center mx-2 mt-2">
				<Spinner color="primary"> Loading... </Spinner>
			</div>
			{toast.error(props.error, {
				position: "top-right",
				hideProgressBar: false,
				progress: undefined,
				toastId: "",
			})}
		</React.Fragment>
	);
};

export default Loader;
