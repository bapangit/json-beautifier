import { useEffect, useRef } from "react";

const Banner468x60 = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Prevent duplicate script insertion
    if (!adRef.current || adRef.current.childNodes.length > 0) return;

    window.atOptions = {
      key: "4e20fbb5d3d8a33392761a5b5355b035",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/4e20fbb5d3d8a33392761a5b5355b035/invoke.js";
    script.async = true;

    adRef.current.appendChild(script);

    return () => {
      if (adRef.current?.contains(script)) {
        adRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={adRef}
      style={{
        width: "468px",
        height: "60px",
        overflow: "hidden",
      }}
    />
  );
};

export default Banner468x60;