"use client";

// useToggle.js
import { useEffect, useState } from "react";
const KEY = "bookmark-key";
// Custom state hook that defaults to 'false' if no value is given
export function useBookmarkStatus() {
  const [isBookmarked, setBookmarked] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setBookmarked(window.localStorage.getItem(KEY) === "bookmarked");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Reusable function to reverse the current state
  const bookmark = () => {
    localStorage.setItem(KEY, "bookmarked");
    setBookmarked(true);
  };

  // Return the state and the custom bookmark function
  return [isBookmarked, bookmark];
}
