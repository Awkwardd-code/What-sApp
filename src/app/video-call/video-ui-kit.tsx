import { randomID } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export function getUrlParams(url = window.location.href) {
	const urlStr = url.split("?")[1];
	return new URLSearchParams(urlStr);
}

export default function VideoUIKit() {
	const roomID = getUrlParams().get("roomID") || randomID(5);
	const { user } = useClerk();

	const myMeeting = (element: HTMLDivElement) => {
		const initMeeting = async () => {
			if (!user?.id) {
				console.error("User not loaded yet.");
				return;
			}

			try {
				const res = await fetch(`/api/zegocloud?userID=${user.id}`);
				const text = await res.text();

				if (!res.ok) {
					console.error("Failed to fetch ZegoCloud token:", res.status, text);
					return;
				}

				let tokenData;
				try {
					tokenData = JSON.parse(text);
				} catch (err) {
					console.error("Error parsing JSON from /api/zegocloud:", err, text);
					return;
				}

				const { token, appID } = tokenData;
				const username =
					user.fullName || user.emailAddresses[0].emailAddress.split("@")[0];

				const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
					appID,
					token,
					roomID,
					user.id,
					username
				);

				const zp = ZegoUIKitPrebuilt.create(kitToken);
				zp.joinRoom({
					container: element,
					sharedLinks: [
						{
							name: "Personal link",
							url:
								window.location.protocol +
								"//" +
								window.location.host +
								window.location.pathname +
								"?roomID=" +
								roomID,
						},
					],
					scenario: {
						mode: ZegoUIKitPrebuilt.GroupCall,
					},
				});
			} catch (error) {
				console.error("Unexpected error in initMeeting:", error);
			}
		};

		initMeeting();
	};

	return (
		<div
			className="myCallContainer"
			ref={myMeeting}
			style={{ width: "100vw", height: "100vh" }}
		></div>
	);
}
