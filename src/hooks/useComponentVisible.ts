import { useState, useEffect, useRef } from "react";

interface ComponentVisibleHook {
	ref: React.RefObject<HTMLDivElement>;
	isComponentVisible: boolean;
	setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useComponentVisible(initialIsVisible: boolean): ComponentVisibleHook {
	const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
	// Change the ref type to RefObject<HTMLDivElement> since you're working with a <div> element
	const ref = useRef<HTMLDivElement>(null);

	const handleClickOutside = (event: MouseEvent) => {
		// Ensure the click target is not inside the referenced <div> element
		if (ref.current && !ref.current.contains(event.target as Node)) {
			setIsComponentVisible(false);
		}
	};

	useEffect(() => {
		// Add event listener on mount, remove it on unmount
		document.addEventListener("click", handleClickOutside, true);

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener("click", handleClickOutside, true);
		};
	}, []); // Empty dependency array ensures this runs only once after mount

	return { ref, isComponentVisible, setIsComponentVisible };
}
