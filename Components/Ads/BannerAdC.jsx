import { useEffect, useRef } from "react";

const BannerAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Prevent duplicate script insertion
    if (!adRef.current || adRef.current.childNodes.length > 0) return;

    window.atOptions = {
      key: "b463f71e76128a38edbc4c0bfcdf28c0",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/b463f71e76128a38edbc4c0bfcdf28c0/invoke.js";
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
        width: "728px",
        height: "90px",
        overflow: "hidden",
      }}
    />
  );
};

export default BannerAd;