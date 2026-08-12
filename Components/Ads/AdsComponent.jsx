import React, { useEffect } from "react";

const isProduction = process.env.NODE_ENV === "production";

const AdsComponent = ({ dataAdSlot = "8496258064" }) => {
  useEffect(() => {
    if (!isProduction) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("ad error", e.message);
    }
  }, []);

  return isProduction ? (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
      }}
      data-ad-client="ca-pub-8243682046974984"
      data-ad-slot={dataAdSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  ) : null;
};

export default AdsComponent;
