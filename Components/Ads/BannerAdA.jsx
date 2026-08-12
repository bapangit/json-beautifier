import { useEffect, useRef } from "react";

const BannerAd = () => {
  const adContainerRef = useRef(null);

  useEffect(() => {
    // Set the global options
    window.atOptions = {
      key: "b47338f1b34709882b31fbc3404edc1b",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    // Create and append the script
    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/b47338f1b34709882b31fbc3404edc1b/invoke.js";
    script.async = true;

    adContainerRef.current.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (adContainerRef.current?.contains(script)) {
        adContainerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={adContainerRef}
      style={{
        width: "320px",
        height: "50px",
      }}
    />
  );
};

export default BannerAd;