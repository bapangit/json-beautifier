"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { css, styled } from "styled-components";
import SplitPane from "react-split-pane";
import Button from "../../Components/Buttons/Button";
import {
  TrimValueState,
  getContainerMode,
  getMode,
  getTimeDiff,
  saveContainerMode,
  saveHistory,
  setMode,
} from "../../utils";
import { useParams } from "next/navigation";

import Switch from "react-switch";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdClose, IoMdMoon, IoMdDownload } from "react-icons/io";
import SavedTabData from "../../Components/CustomStates/SavedTabData";
import { HOME_JSON_LD } from "../seo";
import Link from "next/link";
import { MdOutlineContentPaste } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch, IoCopyOutline } from "react-icons/io5";
import Menu from "../../Components/Menu";
import { useBookmarkStatus } from "@/Components/CustomStates/CheckBookmark";
import { LuMoveHorizontal } from "react-icons/lu";

const CSV_TO_JSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CSV to JSON Converter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires modern web browser",
  description:
    "Free online CSV to JSON converter that transforms CSV data into formatted JSON instantly.",
  url: "https://www.json-beautifier.net/csv-to-json",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Convert CSV to JSON",
    "Parse CSV headers automatically",
    "Support quoted CSV values",
    "Copy and download JSON output",
    "Works in any modern browser",
  ],
};

const headerContainerHeight = 70;
const footerContainerHeight = 110;

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
//   { href: "/json-to-xml", label: "JSON to XML" },
//   { href: "/xml-to-json", label: "XML to JSON" },
//   { href: "/json-to-csv", label: "JSON to CSV" },
//   { href: "/csv-to-json", label: "CSV to JSON" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ---------- CSV -> JSON helpers ---------- */

const parseCsv = (csvText) => {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }

      currentRow.push(currentValue);

      if (
        currentRow.some((value) => value.trim() !== "")
      ) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (
    currentValue.length > 0 ||
    currentRow.length > 0
  ) {
    currentRow.push(currentValue);

    if (
      currentRow.some((value) => value.trim() !== "")
    ) {
      rows.push(currentRow);
    }
  }

  if (insideQuotes) {
    throw new Error("Invalid CSV: unclosed quote");
  }

  return rows;
};

const convertValue = (value) => {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return "";
  }

  if (trimmedValue === "true") {
    return true;
  }

  if (trimmedValue === "false") {
    return false;
  }

  if (trimmedValue === "null") {
    return null;
  }

  if (
    trimmedValue !== "" &&
    !Number.isNaN(Number(trimmedValue))
  ) {
    return Number(trimmedValue);
  }

  return value;
};

const formatJsonData = (data) => {
  const rows = parseCsv(data);

  if (!rows.length) {
    return "";
  }

  const headers = rows[0].map((header) =>
    header.trim(),
  );

  if (!headers.length) {
    return "";
  }

  const result = rows.slice(1).map((row) => {
    const object = {};

    headers.forEach((header, index) => {
      if (header) {
        object[header] = convertValue(
          row[index] ?? "",
        );
      }
    });

    return object;
  });

  return JSON.stringify(result, null, 2);
};

const trimEditorData = (data, trimValue) => {
  const trimmedData = data?.trim() || "";

  if (
    trimValue &&
    trimmedData.substring(
      trimmedData.length - trimValue.length,
      trimmedData.length,
    ) === trimValue
  ) {
    return trimmedData.substring(
      0,
      trimmedData.length - trimValue.length,
    );
  }

  return trimmedData;
};

const HeaderContainer = styled.div`
  width: 100%;
  height: 50px;
  padding: 0px 15px;
  display: ${(p) => (p.$show || true ? "flex" : "none")};
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid #94a3b8;
  background-color: #e8f3f2;
  color: #12343b;
  z-index: 100;

  .brand-nav {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
  }

  .brand-title {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #0f766e;
    white-space: nowrap;
  }

  .bookmark-message {
    flex: 1;
    min-width: 180px;
    text-align: center;
    font-size: 15px;
    font-weight: 500;
  }

  @media (max-width: 760px) {
    gap: 10px;
    padding: 0px 10px;

    .brand-title {
      font-size: 20px;
    }

    .bookmark-message {
      display: none;
    }
  }

  @media (max-width: 460px) {
    .brand-nav {
      gap: 8px;
    }

    .brand-title {
      font-size: 18px;
    }
  }
`;

const HomeSeoSection = styled.section`
  padding: 28px 18px 48px;
  background: white;
  color: #111827;

  .content {
    max-width: 960px;
    margin: 0 auto;
  }

  h2 {
    margin: 0 0 12px;
    font-size: 28px;
  }

  h3 {
    margin: 24px 0 8px;
    font-size: 20px;
  }

  h4 {
    margin: 18px 0 6px;
    font-size: 18px;
  }

  p,
  li {
    line-height: 1.65;
    font-size: 16px;
  }

  ul {
    padding-left: 20px;
    margin: 12px 0 0;
  }

  .link-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 18px;
  }

  .link-row a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 8px;
    background: #0f172a;
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
  }

  .link-row a:hover {
    opacity: 0.9;
  }
`;

const TopContainer = styled.div`
  width: 100%;

  ${(p) =>
    p.mode === "H"
      ? css`
          height: calc(
            100vh - ${headerContainerHeight +
            footerContainerHeight -
            20}px
          );
        `
      : css`
          height: calc(
            100vh - ${footerContainerHeight +
            headerContainerHeight -
            20}px
          );
        `}
`;

const BottomContainer = styled.div`
  width: 100%;
  height: ${footerContainerHeight}px;
  display: ${(p) => (p.$show || true ? "flex" : "none")};
  flex-direction: column;
  background-color: #0f2630;
  z-index: 100;

  .menu-container {
    position: relative;
    height: 14px;
    color: white;
  }

  .menu-item {
    font-weight: 200;
    font-size: 12px;
    height: 15px;
    padding: 0px 4px;
    cursor: pointer;
    color: white;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .saved-tab {
    border: 1px solid grey;
    border-radius: 4px;
    margin: 0px 5px;
    color: lightgray;
    display: flex;
    justify-content: space-between;
    gap: 5px;
    align-items: center;
    padding: 2px 7px;
    font-size: 12px;
    white-space: nowrap;

    &:hover {
      border-color: #963d32;
      background-color: #8b4238;
    }
  }

  .history-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #963d32 #1b1b1b;

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #1b1b1b;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: #963d32;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #b84d40;
    }
  }

  .icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid grey;

    &:hover {
      color: red;
    }
  }
`;

function App() {
  const { sId } = useParams();
const [isBookmarked, bookmark] = useBookmarkStatus();
  const { tabData, save, getTabData, deleteTab } =
    SavedTabData();

  const [editorData, setEditorData] = useState("");
  const [resultData, setResultData] = useState("");

  const [timestampHovered, setTimestampHovered] =
    useState();

  const tempEditorData = useMemo(() => {
    if (timestampHovered) {
      return getTabData(timestampHovered);
    }

    return "";
  }, [timestampHovered, getTabData]);

  const [editor, setEditor] = useState();
  const [monaco, setMonaco] = useState();

  const [trimValue] = TrimValueState();

  const [containerViewMode, setContainerViewMode] =
    useState("B");

  const [isContainerViewModeReady, setIsContainerViewModeReady] =
    useState(false);

  const [darkTheme, setDarkTheme] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [newData, setNewData] = useState("");

  const [copyResButtonTitle, setCopyResButtonTitle] =
    useState("Copy");

  const [fontSize, setFontSize] = useState(14);

  useBrowserLayoutEffect(() => {
    if (!sId) {
      setEditorData("");
      setResultData("");
    }

    const savedContainerMode =
      getContainerMode();

    setContainerViewMode(
      savedContainerMode === "B" ? "B" : "H",
    );

    setDarkTheme(getMode());
    setIsContainerViewModeReady(true);
  }, [sId, trimValue]);

  const onMountResultEditor = (
    editorInstance,
    monacoInstance,
  ) => {
    editorInstance.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;

      if (
        keyCode === 52 &&
        (metaKey || ctrlKey)
      ) {
        event.preventDefault();
      }
    });

    monacoInstance.editor.defineTheme(
      "myThemeDark",
      {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {},
      },
    );

    monacoInstance.editor.defineTheme(
      "myThemeLight",
      {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {},
      },
    );

    monacoInstance.editor.setTheme(
      getMode()
        ? "myThemeDark"
        : "myThemeLight",
    );

    setEditor(editorInstance);
    setMonaco(monacoInstance);
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (
      editor.getValue() !==
      (resultData || "")
    ) {
      editor.setValue(resultData || "");
    }

    editor.layout();
  }, [editor, resultData]);

  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark
          ? "myThemeDark"
          : "myThemeLight",
      );
    }

    setDarkTheme(isDark);
    setMode(isDark);
  };

  const convertOnChange = (data) => {
    try {
      setResultData(formatJsonData(data));
    } catch {
      setResultData("");
    }
  };

  const trim = () =>
    trimEditorData(editorData, trimValue);

  useEffect(() => {
    if (
      isContainerViewModeReady &&
      !sId
    ) {
      saveHistory(editorData);
    }
  }, [
    editorData,
    isContainerViewModeReady,
    sId,
  ]);

  useEffect(() => {
    if (!isContainerViewModeReady) {
      return;
    }

    const handler = setTimeout(() => {
      convertOnChange(trim());

      if (editorData && isPasting) {
        setNewData(editorData);
        setIsPasting(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [
    editorData,
    isContainerViewModeReady,
  ]);

  useEffect(() => {
    if (!newData) {
      return;
    }

    const handler = setTimeout(() => {
      const tabArr = Object.keys(tabData);

      if (tabArr.length) {
        if (
          getTabData(tabArr[0]) !==
          newData
        ) {
          save(newData);
        }
      } else {
        save(newData);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [
    newData,
    tabData,
    getTabData,
    save,
  ]);

  const onClickPaste = async () => {
    try {
      const text =
        await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        setNewData(text);
      }
    } catch {
      // Clipboard access failed
    }
  };

  const clear = () => {
    setEditorData("");
    setResultData("");
  };

  const findWord = () => {
    if (editor) {
      editor
        .getAction("actions.find")
        .run();
    }
  };

  function download(filename, text) {
    const element =
      document.createElement("a");

    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," +
        encodeURIComponent(text),
    );

    element.setAttribute(
      "download",
      filename,
    );

    element.style.display = "none";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        copyResButtonTitle !== "Copy"
      ) {
        setCopyResButtonTitle("Copy");
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [copyResButtonTitle]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            HOME_JSON_LD,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            CSV_TO_JSON_SCHEMA,
          ),
        }}
      />

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          visibility:
            isContainerViewModeReady
              ? "visible"
              : "hidden",
        }}
      >
        <HeaderContainer
          $show={
            containerViewMode === "H"
          }
        >
          <div className="brand-nav">
            <h1 className="brand-title">
              CSV to JSON Converter
            </h1>
          </div>

          <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {!isBookmarked && (
                <button
                  style={{ padding: "2px 8px" }}
                  onClick={() => {
                    const isMac = navigator.platform
                      .toUpperCase()
                      .includes("MAC");

                    alert(
                      `To bookmark this page, press ${
                        isMac ? "⌘ + D" : "Ctrl + D"
                      }`,
                    );

                    bookmark();
                  }}
                >
                  ⭐ To visit again, Bookmark this tool
                </button>
              )}
            </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#12343b",
              }}
            >
              <button type="button" title="Decrease font size" style={{ width: "28px", height: "24px", padding: 0, fontSize: "16px" }} onClick={() => setFontSize(fontSize > 5 ? fontSize - 1 : 5)}>-</button>
              <Button title={fontSize} />
              <button type="button" title="Increase font size" style={{ width: "28px", height: "24px", padding: 0, fontSize: "16px" }} onClick={() => setFontSize(fontSize + 1)}>+</button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "24px",
              }}
            >
              <div
                className="tool-row"
                style={{
                  color: darkTheme ? "grey" : "#FDB813",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
                onClick={() => setTheme(false)}
              >
                &#9728;
              </div>
              <div style={{ margin: "0px 5px", height: "24px" }}>
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={24}
                  onChange={setTheme}
                  checked={darkTheme}
                />
              </div>
              <IoMdMoon
                color={darkTheme ? "#FDB813" : "grey"}
                fontSize={20}
                onClick={() => setTheme(true)}
              />
            </div>
            <Menu />
          </div>
        </HeaderContainer>

        <TopContainer
          mode={containerViewMode}
        >
          <SplitPane
            minSize={100}
            maxSize={800}
            defaultSize="50%"
            split="vertical"
            style={{
              height: `calc(100vh - ${
                headerContainerHeight +
                footerContainerHeight -
                20
              }px)`,
              width: "100%",
              borderLeft: "14px solid #adddd7",
              borderRight: "14px solid #adddd7",
              borderBottom: "14px solid #adddd7",
              boxShadow: "0 0 10px #5eead4",
            }}
          >
            <div>
              <Editor
                height={`calc(100vh - ${
                  headerContainerHeight +
                  footerContainerHeight -
                  20
                }px)`}
                theme="vs-dark"
                path="file:///csv-to-json/input.csv"
                value={
                  tempEditorData ||
                  editorData ||
                  ""
                }
                onMount={(editorInstance) => {
                  editorInstance.focus();

                  editorInstance.onKeyDown(
                    (event) => {
                      const {
                        keyCode,
                        ctrlKey,
                        metaKey,
                      } = event;

                      if (
                        keyCode === 52 &&
                        (metaKey || ctrlKey)
                      ) {
                        setIsPasting(true);
                      }
                    },
                  );
                }}
                language="plaintext"
                onChange={(data) => {
                  setEditorData(data || "");
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  renderLineHighlight:
                    "none",
                  isWholeLine: true,
                }}
              />
            </div>

            <div>
              <Editor
                height={`calc(100vh - ${
                  headerContainerHeight +
                  footerContainerHeight -
                  20
                }px)`}
                width="100%"
                theme="vs-dark"
                path="file:///csv-to-json/result.json"
                value={resultData || ""}
                onMount={
                  onMountResultEditor
                }
                language="json"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  renderLineHighlight:
                    "none",
                  isWholeLine: true,
                }}
              />
            </div>
          </SplitPane>
        </TopContainer>

        <BottomContainer
          $show={
            containerViewMode === "B"
          }
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              borderTop:
                "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor:
                  "#5e5e5e9b",
              }}
            >
              <div
                className="tool-row"
                style={{
                  padding: "0px 5px",
                  display: "flex",
                  gap: "5px",
                }}
              >
                {!sId && (
                  <>
                    <div
                      style={{
                        margin:
                          "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Paste"
                        onClick={
                          onClickPaste
                        }
                        icon={
                          <MdOutlineContentPaste
                            size={40}
                          />
                        }
                      />
                    </div>

                    <div
                      style={{
                        margin:
                          "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Clear"
                        onClick={clear}
                        icon={
                          <AiOutlineDelete
                            size={10}
                          />
                        }
                      />
                    </div>
                  </>
                )}

                <div
                  style={{
                    margin:
                      "4px 4px 2px 4px",
                  }}
                >
                  <Button
                    title="Search"
                    onClick={findWord}
                    icon={<IoSearch />}
                  />
                </div>

                <CopyToClipboard
                  text={resultData}
                  onCopy={() => {
                    setCopyResButtonTitle(
                      "Copied",
                    );
                  }}
                >
                  <div
                    style={{
                      margin:
                        "4px 4px 2px 4px",
                    }}
                  >
                    <Button
                      title={
                        copyResButtonTitle
                      }
                      icon={
                        <IoCopyOutline />
                      }
                    />
                  </div>
                </CopyToClipboard>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "24px",
                    marginTop: "5px",
                    display: "none",
                  }}
                >
                  <div
                    style={{
                      color: darkTheme
                        ? "grey"
                        : "#FDB813",
                      fontSize: "22px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setTheme(false)
                    }
                  >
                    &#9728;
                  </div>

                  <div
                    style={{
                      margin: "0px 5px",
                    }}
                  >
                    <Switch
                      checkedIcon={false}
                      uncheckedIcon={false}
                      height={24}
                      onChange={(e) =>
                        setTheme(e)
                      }
                      checked={darkTheme}
                    />
                  </div>

                  <IoMdMoon
                    color={
                      darkTheme
                        ? "#FDB813"
                        : "grey"
                    }
                    fontSize={20}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setTheme(true)
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: "2px",
                  gap: "10px",
                  height: "28px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    margin:
                      "4px 4px 2px 8px",
                  }}
                >
                  <Button
                    title="Download"
                    onClick={() =>
                      download(
                        "result.json",
                        resultData,
                      )
                    }
                    icon={
                      <IoMdDownload />
                    }
                  />
                </div>

                <div>
                      <Button
                        title="Paste Result"
                        onClick={() => {
                          if (resultData) {
                            setEditorData(() => resultData);
                            setNewData(resultData);
                          }
                        }}
                        icon={<LuMoveHorizontal />}
                      />
                    </div>

                <span
                      style={{
                        color: "lightgray",
                        fontSize: "14px",
                        marginLeft: "48px",
                        display: "none",
                      }}
                    >
                      Font Size :
                    </span>

                <div
                      style={{
                        marginLeft: "5px",
                        display: "none",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <div
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setFontSize(fontSize > 5 ? fontSize - 1 : 5)
                        }
                      >
                        <div
                          style={{
                            marginTop: "4px",
                            marginLeft: "7px",

                            color: "lightgray",
                            transform:
                              "rotate(90deg) translateX(-1px) translateY(5px) scaleY(1.2)",
                          }}
                        >
                          &#10073;
                        </div>
                      </div>
                      <div>
                        <Button
                          title={fontSize}
                          style={{
                            backgroundColor: "white",
                            height: "20px",
                            width: "28px",
                            padding: "0px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => setFontSize(fontSize + 1)}
                      >
                        <div
                          style={{
                            marginTop: "-5px",
                            marginLeft: "7px",

                            color: "lightgray",
                            transform:
                              "rotate(45deg) translateX(-1px) translateY(5px)",
                          }}
                        >
                          {" "}
                          &#10006;{" "}
                        </div>
                      </div>
                    </div>
              </div>

              {!sId && (
                <div
                  style={{
                    display: "flex",
                    marginTop: "2px",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px 8px",
                      backgroundColor:
                        "#1b1b1bb7",
                      marginLeft: "8px",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        fontSize: "14px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        HISTORY
                      </span>
                      : &nbsp;
                    </div>

                    <div
                      style={{
                        display: "flex",
                        minWidth: "370px",
                        maxWidth: "370px",
                        overflowX: "scroll",
                        border:
                          "1px solid grey",
                        padding: "2px",
                        borderRadius: "4px",
                        position: "relative",
                      }}
                      className="history-scrollbar"
                      id="myDivId"
                    >
                      {Object.keys(tabData).length <
                        1 && (
                        <div
                          style={{
                            color: "lightgray",
                          }}
                        >
                          Empty
                        </div>
                      )}

                      {getTimeDiff(
                        Object.keys(tabData),
                      )
                        .reverse()
                        .map(
                          (
                            {
                              timestamp,
                              diffStr,
                            },
                            i,
                          ) => {
                            const date =
                              new Date(
                                Number(timestamp),
                              );

                            const time =
                              date.toLocaleString();

                            return (
                              <div
                                className="saved-tab"
                                title={time}
                                key={i}
                                onMouseEnter={() =>
                                  setTimestampHovered(
                                    timestamp,
                                  )
                                }
                                onMouseLeave={() =>
                                  setTimestampHovered(
                                    null,
                                  )
                                }
                              >
                                <div
                                  style={{
                                    cursor:
                                      "pointer",
                                  }}
                                  onClick={() => {
                                    const savedData =
                                      getTabData(
                                        timestamp,
                                      );

                                    setEditorData(
                                      savedData,
                                    );

                                    setNewData(
                                      savedData,
                                    );

                                    deleteTab(
                                      timestamp,
                                    );
                                  }}
                                >
                                  {diffStr}
                                </div>

                                <div
                                  className="icon"
                                  onClick={() =>
                                    deleteTab(
                                      timestamp,
                                    )
                                  }
                                >
                                  <IoMdClose />
                                </div>
                              </div>
                            );
                          },
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!sId && (
            <div className="menu-container">
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  bottom: "2px",
                  display: "flex",
                  fontSize: "10px",
                }}
              >
                {HOME_NAV_LINKS.map(
                  ({ href, label }) => (
                    <Link
                      className="menu-item"
                      href={href}
                      key={href}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
        </BottomContainer>

        {!sId && (
          <HomeSeoSection>
            <div className="content">
              <h2>
                Online CSV to JSON Converter
              </h2>

              <p>
                CSV to JSON Converter transforms
                comma-separated values into clean,
                formatted JSON. Paste your CSV data
                into the left editor and get the JSON
                result instantly.
              </p>

              <p>
                The first row of the CSV is used as the
                JSON property names, while every
                following row becomes a JSON object.
              </p>

              <div className="link-row">
                {HOME_NAV_LINKS.map(
                  ({ href, label }) => (
                    <Link
                      href={href}
                      key={href}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>

              <h3>
                Why use CSV to JSON Converter?
              </h3>

              <ul>
                <li>
                  Convert CSV rows into JSON objects.
                </li>
                <li>
                  Automatically use CSV headers as JSON
                  property names.
                </li>
                <li>
                  Support commas inside quoted CSV
                  values.
                </li>
                <li>
                  Support escaped quotes inside CSV
                  data.
                </li>
                <li>
                  Automatically detect numbers,
                  booleans, and null values.
                </li>
                <li>
                  Copy or download the formatted JSON.
                </li>
              </ul>

              <h3>Common questions</h3>

              <h4>
                How does CSV to JSON conversion work?
              </h4>

              <p>
                The first row is treated as column
                headers. Each following row is converted
                into a JSON object using those headers
                as property names.
              </p>

              <h4>
                Does the converter support quoted CSV
                values?
              </h4>

              <p>
                Yes. CSV values wrapped in double
                quotes can contain commas and line
                breaks without being split incorrectly.
              </p>

              <h4>
                Are numbers automatically converted?
              </h4>

              <p>
                Yes. Numeric values are converted to
                JSON numbers. The values true, false,
                and null are also converted to their
                corresponding JSON data types.
              </p>

              <h4>
                Is CSV to JSON Converter free?
              </h4>

              <p>
                Yes. This CSV to JSON Converter is free
                to use and runs directly in your web
                browser.
              </p>
            </div>
          </HomeSeoSection>
        )}
      </main>
    </>
  );
}

export default App;