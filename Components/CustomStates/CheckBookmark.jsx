"use client";

// useToggle.js
import { useState } from "react";
const KEY = "bookmark-key";
// Custom state hook that defaults to 'false' if no value is given
export function useBookmarkStatus() {
  const [isBookmarked, setBookmarked] = useState(() =>
    typeof window !== "undefined" &&
    window.localStorage.getItem(KEY) === "bookmarked"
  );

  // Reusable function to reverse the current state
  const bookmark = () => {
    localStorage.setItem(KEY, "bookmarked");
    setBookmarked(true);
  };

  // Return the state and the custom bookmark function
  return [isBookmarked, bookmark];
}
