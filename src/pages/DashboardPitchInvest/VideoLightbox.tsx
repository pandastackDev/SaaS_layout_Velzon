import React from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import { Startup } from "./types";

interface VideoLightboxProps {
	isOpen: boolean;
	toggle: () => void;
	startup: Startup | null;
}

const VideoLightbox: React.FC<VideoLightboxProps> = ({
	isOpen,
	toggle,
	startup,
}) => {
	if (!startup) return null;

	return (
		<Modal
			isOpen={isOpen}
			toggle={toggle}
			centered
			size="lg"
			className="video-lightbox-modal"
		>
			<ModalBody className="p-0 position-relative">
				<Button
					close
					onClick={toggle}
					className="position-absolute btn-close-video"
				/>
				<div className="ratio ratio-16x9">
					<iframe
						src={`${startup.video}?autoplay=1`}
						title={`${startup.name} Pitch Video`}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
				<div className="p-3 text-center video-info">
					<h5 className="text-white mb-1">{startup.name}</h5>
					<p className="text-white-50 mb-0">{startup.shortDescription}</p>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default VideoLightbox;
