import React from "react";

const BookmarkButton = () => {
  const handleBookmark = () => {
    // Chrome, Edge, Firefox, etc.
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const shortcut = isMac ? "⌘ + D" : "Ctrl + D";

    alert(`Press ${shortcut} to bookmark this page.`);
  };

  return (
    <button
      onClick={handleBookmark}
      style={{
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
      }}
    >
      ⭐ Add to Bookmarks
    </button>
  );
};

export default BookmarkButton;