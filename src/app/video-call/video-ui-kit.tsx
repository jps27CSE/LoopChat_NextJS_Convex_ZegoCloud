import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useClerk } from "@clerk/nextjs";
import { randomID } from "@/lib/utils";

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function VideoUIKit() {
  const roomID = getUrlParams().get("roomID") || randomID(5);
  const { user } = useClerk();
  const isInitialized = useRef(false); // Prevent reinitialization

  useEffect(() => {
    if (isInitialized.current) return; // Skip if already initialized

    const initMeeting = async () => {
      try {
        const res = await fetch(`/api/zegocloud?userID=${user?.id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch token: ${res.statusText}`);
        }

        const { token, appID } = await res.json();
        if (!token || !appID) {
          throw new Error("Invalid API response: Missing token or appID");
        }

        const username =
          user?.fullName || user?.emailAddresses[0].emailAddress.split("@")[0];

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          appID,
          token,
          roomID,
          user?.id!,
          username,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: document.getElementById("myCallContainer"),
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

        isInitialized.current = true; // Mark as initialized
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    initMeeting();
  }, [user, roomID]);

  return (
    <div id="myCallContainer" style={{ width: "100vw", height: "100vh" }}></div>
  );
}
