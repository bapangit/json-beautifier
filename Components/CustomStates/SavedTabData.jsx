import { useEffect, useState } from "react";
const KEY = "tab-data";
const hasLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export default function SavedTabData() {
  const setToLS = (d) => {
    if (!hasLocalStorage()) return;
    localStorage.setItem(KEY, JSON.stringify(d));
  };
  const getFromLS = () => {
    if (!hasLocalStorage()) return {};
    const data = localStorage.getItem(KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  };

  const addTabData = (key, data) => {
    if (!hasLocalStorage()) return;
    localStorage.setItem(key, data);
  };
  const getTabData = (key) => {
    if (!hasLocalStorage()) return null;
    return localStorage.getItem(key);
  };

  const [tabData, setTabData] = useState({});

  useEffect(() => {
    setTabData(getFromLS());
  }, []);

  const save = async (data) => {
    console.log("saving", data);

    const initialTabData = getFromLS();
    const maxTabs = 50;
    if (Object.keys(initialTabData).length >= maxTabs) {
      const count = Object.keys(initialTabData).length - maxTabs + 1;
      const minKeys = findMin(Object.keys(initialTabData), count);
      minKeys.forEach((key) => {
        deleteTab(key);
      });
    }

    const tabData = getFromLS();
    const timestamp = Date.now();
    tabData[timestamp] = "1";
    setToLS(tabData);
    addTabData(`${timestamp}`, data);
    setTabData(tabData);
  };

  const deleteTab = (timestamp) => {
    const keys = getFromLS();
    delete keys[`${timestamp}`];
    setToLS(keys);
    localStorage.removeItem(`${timestamp}`);
    setTabData(keys);
  };

  const moveTabToFirst = (timestamp) => {
    const keys = getFromLS();
    if (!Object.prototype.hasOwnProperty.call(keys, `${timestamp}`)) return;

    const reorderedKeys = Object.keys(keys).filter(
      (key) => key !== `${timestamp}`,
    );
    const reorderedTabs = {};
    reorderedKeys.forEach((key) => {
      reorderedTabs[key] = keys[key];
    });
    reorderedTabs[timestamp] = keys[timestamp];
    setToLS(reorderedTabs);
    setTabData(reorderedTabs);
  };

  return { tabData, save, getTabData, deleteTab, moveTabToFirst };
}

function findMin(arr, count) {
  if (arr.length < count) {
    return `Array must have at least ${count} elements`;
  }
  arr.sort((a, b) => a - b); // Sort the array in ascending order
  return arr.slice(0, count); // Return the first 4 elements
}
