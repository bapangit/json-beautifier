"use client";
import { useEffect, useState } from "react";

const hasLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const base64ToUint8Array = (base64) => {
  const binary = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const decompressWithStream = async (compressedInput, format) => {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream is not available in this browser.");
  }
  const compressedData = base64ToUint8Array(compressedInput);
  const stream = new DecompressionStream(format);
  const decompressed = await new Response(
    new Blob([compressedData]).stream().pipeThrough(stream)
  ).arrayBuffer();
  return new TextDecoder().decode(decompressed);
};

/* Decompression Utils */
const decompressGzip = async (compressedInput, resolve, rejectCounter) => {
  try {
    const inflated = await decompressWithStream(compressedInput, "gzip");
    resolve({ type: "gzip", result: inflated });
  } catch {
    rejectCounter.up();
  }
};
const decompressDeflate = async (compressedInput, resolve, rejectCounter) => {
  try {
    const inflated = await decompressWithStream(compressedInput, "deflate");
    resolve({ type: "deflate", result: inflated });
  } catch {
    rejectCounter.up();
  }
};
const decompressBrotli = async (compressedInput, resolve, rejectCounter) => {
  try {
    const inflated = await decompressWithStream(compressedInput, "brotli");
    resolve({ type: "brotli", result: inflated });
  } catch {
    rejectCounter.up();
  }
};

export const decompress = async (compressedData) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const decompressOptions = [
        decompressGzip,
        decompressDeflate,
        decompressBrotli,
      ];

      const rejectCounter = new RejectCounter(reject, decompressOptions.length);
      decompressOptions.forEach((decompressMethod) =>
        decompressMethod(compressedData, resolve, rejectCounter)
      );
    });
    return result;
  } catch {
    return { type: "", result: "" };
  }
};

function RejectCounter(mainReject, max) {
  var counter = 0;
  this.up = () => {
    counter++;
    if (counter >= max) {
      mainReject();
    }
  };
}

export const TrimValueState = () => {
  const [value, setValue] = useState('"');

  useEffect(() => {
    if (!hasLocalStorage()) return;
    const stored = localStorage.getItem("trimValue");
    if (stored) {
      setValue(stored);
    }
  }, []);

  const setTrimValue = (value) => {
    setValue(value);
    if (hasLocalStorage()) {
      localStorage.setItem("trimValue", value);
    }
  };
  return [value, setTrimValue];
};

/* History Functionality*/

export const saveHistory = (data) => {
  if (!hasLocalStorage()) return;
  localStorage.setItem("editorData", data || "");
};
export const getHistory = () => {
  if (!hasLocalStorage()) return "";
  return localStorage.getItem("editorData") || "";
};

/* History Functionality*/

export const saveContainerMode = (data) => {
  if (!hasLocalStorage()) return;
  localStorage.setItem("containermode", data || "H");
};
export const getContainerMode = () => {
  if (!hasLocalStorage()) return "H";
  return localStorage.getItem("containermode") || "H";
};

/* Mode */

export const setMode = (isDark) => {
  if (!hasLocalStorage()) return;
  localStorage.setItem("mode", isDark ? "1" : "0");
};
export const getMode = () => {
  if (!hasLocalStorage()) return false;
  return localStorage.getItem("mode") === "1";
};

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
export const getTimeDiff = (timeStamps) => {
  const currentTimestamp = Date.now();
  const diffs = timeStamps.map((timestamp) => {
    const diff = parseInt((currentTimestamp - timestamp) / 1000);
    let diffStr;
    if (diff < MINUTE) {
      diffStr = "Now";
    } else if (diff < HOUR) {
      diffStr = `${parseInt(diff / MINUTE)}m ago`;
    } else if (diff < DAY) {
      diffStr = `${parseInt(diff / HOUR)}h ago`;
    } else {
      diffStr = `${parseInt(diff / DAY)}d ago`;
    }

    return { timestamp, diffStr };
  });
  return diffs;
};
