import { useEffect, useRef } from "react";

const BannerAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Prevent duplicate script insertion
    if (!adRef.current || adRef.current.childNodes.length > 0) return;

    window.atOptions = {
      key: "81fb3a67bd25350578a9e622412e515b",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highrevenueformat.com/81fb3a67bd25350578a9e622412e515b/invoke.js";
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
        marginLeft:"40px",
        marginTop:"10px"
      }}
    />
  );
};

export default BannerAd;