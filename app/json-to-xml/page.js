"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import SplitPane from "react-split-pane";
import Switch from "react-switch";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdClose, IoMdMoon, IoMdDownload } from "react-icons/io";
import {
  MdHistory,
  MdOutlineContentPaste,
} from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch, IoCopyOutline } from "react-icons/io5";
import { LuMoveHorizontal } from "react-icons/lu";
import Link from "next/link";
import Menu from "@/Components/Menu";
import Button from "@/Components/Buttons/Button";

const headerContainerHeight = 70;
const footerContainerHeight = 80;

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const HeaderContainer = styled.div`
  width: 100%;
  height: 50px;
  padding: 0px 15px;
  display: flex;
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

  @media (max-width: 760px) {
    gap: 10px;
    padding: 0px 10px;

    .brand-title {
      font-size: 20px;
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
    transition: opacity 0.2s ease;
  }

  .link-row a:hover {
    opacity: 0.9;
  }

  a {
    color: #0f4c81;
  }
`;

const TopContainer = styled.div`
  width: 100%;
  height: calc(
    100vh - ${headerContainerHeight + footerContainerHeight - 20}px
  );
`;

const BottomContainer = styled.div`
  width: 100%;
  height: ${footerContainerHeight}px;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  z-index: 100;

  .menu-container {
    position: relative;
    height: 14px;
    color: #12343b;
  }

  .menu-item {
    font-weight: 200;
    font-size: 12px;
    height: 15px;
    padding: 0px 4px;
    cursor: pointer;
    color: #12343b;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  padding: 10px 12px;
  border-radius: 10px;
  flex-wrap: wrap;
`;

const ToolBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid ${(p) =>
    p.$primary ? "#0f9d78" : "#e2e8f0"};
  background: ${(p) =>
    p.$primary ? "#0f9d78" : "#ffffff"};
  color: ${(p) =>
    p.$primary ? "#ffffff" : "#334155"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(p) =>
      p.$primary ? "#0c8a67" : "#f1f5f9"};
    border-color: ${(p) =>
      p.$primary ? "#0c8a67" : "#cbd5e1"};
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 16px;
  }
`;

const ToolDivider = styled.div`
  width: 1px;
  height: 22px;
  background: #e2e8f0;
  margin: 0 4px;
`;

const ToolRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 700px) {
    margin-left: 0;
  }
`;

const HistoryOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 38, 48, 0.6);
`;

const HistoryModal = styled.div`
  width: min(760px, 100%);
  max-height: min(620px, 90vh);
  overflow: hidden;
  border: 1px solid #adddd7;
  border-radius: 12px;
  background: #f8fbfb;
  box-shadow: 0 14px 40px rgba(15, 38, 48, 0.3);
`;

const HistoryModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #dbe5e9;
  color: #12343b;

  h2 {
    margin: 0;
    font-size: 20px;
  }

  button {
    border: 0;
    background: transparent;
    color: #12343b;
    font-size: 24px;
    cursor: pointer;
  }
`;

const HistoryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
  padding: 20px;
`;

const HistoryCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 260px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dbe5e9;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(36, 55, 70, 0.08);

  .card-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    padding: 14px;
    cursor: pointer;
  }

  .timestamp {
    display: block;
    overflow: hidden;
    color: #12343b;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview {
    display: block;
    overflow: hidden;
    margin-top: 6px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
  }

  .card-delete {
    flex-shrink: 0;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    border-top: 1px solid #dbe5e9;
    background: #f8fbfb;
    color: #963d32;
    cursor: pointer;
  }
`;

function App() {
  const [editorData, setEditorData] = useState("");
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [editor, setEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);

  const [copyResButtonTitle, setCopyResButtonTitle] =
    useState("Copy");

  /*
   * Escape XML special characters.
   */
  const escapeXml = (value) => {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  /*
   * Check whether a value is a plain object.
   */
  const isObject = (value) => {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  };

  /*
   * Convert JSON value to XML.
   */
  const jsonValueToXml = (
    key,
    value,
    level = 0
  ) => {
    const indent = "  ".repeat(level);
    const childIndent = "  ".repeat(level + 1);

    /*
     * Arrays become repeated XML elements.
     */
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          jsonValueToXml(
            key,
            item,
            level
          )
        )
        .join("\n");
    }

    /*
     * Primitive values.
     */
    if (
      value === null ||
      typeof value !== "object"
    ) {
      const text =
        value === null
          ? ""
          : escapeXml(value);

      return `${indent}<${key}>${text}</${key}>`;
    }

    /*
     * Object values.
     */
    let attributes = "";
    let children = [];
    let textContent = null;

    Object.entries(value).forEach(
      ([childKey, childValue]) => {
        /*
         * Convert @attributes into XML attributes.
         */
        if (
          childKey === "@attributes" &&
          isObject(childValue)
        ) {
          Object.entries(childValue).forEach(
            ([attributeName, attributeValue]) => {
              attributes += ` ${attributeName}="${escapeXml(
                attributeValue
              )}"`;
            }
          );

          return;
        }

        /*
         * Convert #text into XML text.
         */
        if (childKey === "#text") {
          textContent =
            childValue === null
              ? ""
              : escapeXml(childValue);

          return;
        }

        /*
         * Normal child elements.
         */
        if (Array.isArray(childValue)) {
          childValue.forEach(
            (item) => {
              children.push(
                jsonValueToXml(
                  childKey,
                  item,
                  level + 1
                )
              );
            }
          );
        } else {
          children.push(
            jsonValueToXml(
              childKey,
              childValue,
              level + 1
            )
          );
        }
      }
    );

    /*
     * Empty object.
     */
    if (
      children.length === 0 &&
      textContent === null
    ) {
      return `${indent}<${key}${attributes} />`;
    }

    /*
     * Object containing only text.
     */
    if (
      children.length === 0 &&
      textContent !== null
    ) {
      return `${indent}<${key}${attributes}>${textContent}</${key}>`;
    }

    /*
     * Object containing child elements.
     */
    const openingTag = `${indent}<${key}${attributes}>`;
    const closingTag = `${indent}</${key}>`;

    const content = [];

    if (textContent !== null) {
      content.push(
        `${childIndent}${textContent}`
      );
    }

    content.push(...children);

    return `${openingTag}\n${content.join(
      "\n"
    )}\n${closingTag}`;
  };

  /*
   * Convert JSON string to formatted XML.
   */
  const convertJsonToXml = (jsonString) => {
    if (!jsonString || !jsonString.trim()) {
      setResultData("");
      setError("");
      return;
    }

    try {
      setError("");

      const parsedJson = JSON.parse(
        jsonString
      );

      if (
        parsedJson === null ||
        typeof parsedJson !== "object" ||
        Array.isArray(parsedJson)
      ) {
        throw new Error(
          "JSON must contain a single root object for XML conversion."
        );
      }

      const rootKeys = Object.keys(
        parsedJson
      );

      if (rootKeys.length === 0) {
        throw new Error(
          "JSON must contain at least one root element."
        );
      }

      if (rootKeys.length > 1) {
        throw new Error(
          "JSON must contain a single root element for valid XML."
        );
      }

      const rootKey = rootKeys[0];

      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        jsonValueToXml(
          rootKey,
          parsedJson[rootKey]
        );

      setResultData(xml);

      saveToHistory(
        jsonString,
        xml
      );
    } catch (err) {
      setResultData("");

      setError(
        err?.message ||
          "Unable to convert JSON to XML."
      );
    }
  };

  /*
   * Save history locally.
   */
  const saveToHistory = (
    input,
    output
  ) => {
    if (!input || !output) return;

    const item = {
      id: Date.now(),
      input,
      output,
      time: new Date().toLocaleString(),
    };

    setHistory((previous) => {
      const updated = [
        item,
        ...previous,
      ].slice(0, 20);

      try {
        localStorage.setItem(
          "json-to-xml-history",
          JSON.stringify(updated)
        );
      } catch {}

      return updated;
    });
  };

  /*
   * Load history.
   */
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "json-to-xml-history"
        );

      if (saved) {
        setHistory(
          JSON.parse(saved)
        );
      }
    } catch {}
  }, []);

  /*
   * Paste JSON from clipboard.
   */
  const onClickPaste = async () => {
    try {
      const text =
        await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        convertJsonToXml(text);
      }
    } catch {
      setError(
        "Unable to read clipboard."
      );
    }
  };

  /*
   * Upload JSON file.
   */
  const handleFileUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      const text =
        await file.text();

      if (!text.trim()) {
        throw new Error(
          "The selected JSON file is empty."
        );
      }

      setEditorData(text);
      convertJsonToXml(text);
    } catch (err) {
      setResultData("");

      setError(
        err?.message ||
          "Unable to read the selected JSON file."
      );
    }

    event.target.value = "";
  };

  /*
   * Clear input/output.
   */
  const clear = () => {
    setEditorData("");
    setResultData("");
    setError("");
  };

  /*
   * Download XML result.
   */
  const download = (
    filename,
    text
  ) => {
    if (!text) return;

    const blob = new Blob(
      [text],
      {
        type: "application/xml;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const element =
      document.createElement("a");

    element.href = url;
    element.download =
      filename;

    document.body.appendChild(
      element
    );

    element.click();

    document.body.removeChild(
      element
    );

    URL.revokeObjectURL(url);
  };

  /*
   * Copy button status.
   */
  useEffect(() => {
    if (
      copyResButtonTitle ===
      "Copy"
    ) {
      return;
    }

    const timer = setTimeout(
      () => {
        setCopyResButtonTitle(
          "Copy"
        );
      },
      2000
    );

    return () =>
      clearTimeout(timer);
  }, [copyResButtonTitle]);

  /*
   * Automatically convert JSON.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setResultData("");
      setError("");
      return;
    }

    const timer = setTimeout(
      () => {
        convertJsonToXml(
          editorData
        );
      },
      500
    );

    return () =>
      clearTimeout(timer);
  }, [editorData]);

  /*
   * Theme.
   */
  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark
          ? "myThemeDark"
          : "myThemeLight"
      );
    }

    setDarkTheme(isDark);

    try {
      localStorage.setItem(
        "json-xml-theme",
        isDark
          ? "dark"
          : "light"
      );
    } catch {}
  };

  /*
   * Load theme.
   */
  useEffect(() => {
    try {
      const theme =
        localStorage.getItem(
          "json-xml-theme"
        );

      if (theme === "dark") {
        setDarkTheme(true);
      }
    } catch {}
  }, []);

  /*
   * Monaco mount.
   */
  const onMountResultEditor = (
    editorInstance,
    monacoInstance
  ) => {
    monacoInstance.editor.defineTheme(
      "myThemeDark",
      {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {},
      }
    );

    monacoInstance.editor.defineTheme(
      "myThemeLight",
      {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {},
      }
    );

    monacoInstance.editor.setTheme(
      darkTheme
        ? "myThemeDark"
        : "myThemeLight"
    );

    setEditor(
      editorInstance
    );

    setMonaco(
      monacoInstance
    );
  };

  /*
   * Search.
   */
  const findWord = () => {
    if (editor) {
      editor
        .getAction(
          "actions.find"
        )
        ?.run();
    }
  };

  /*
   * Restore history.
   */
  const restoreHistory = (
    item
  ) => {
    setEditorData(
      item.input
    );

    setResultData(
      item.output
    );

    setError("");
    setIsHistoryOpen(
      false
    );
  };

  /*
   * Delete history item.
   */
  const deleteHistory = (
    id
  ) => {
    setHistory((previous) => {
      const updated =
        previous.filter(
          (item) =>
            item.id !== id
        );

      try {
        localStorage.setItem(
          "json-to-xml-history",
          JSON.stringify(
            updated
          )
        );
      } catch {}

      return updated;
    });
  };

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {/* HEADER */}

        <HeaderContainer>
          <div className="brand-nav">
            <h1 className="brand-title">
              JSON to XML Converter
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* FONT SIZE */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#12343b",
              }}
            >
              <button
                type="button"
                title="Decrease font size"
                style={{
                  width: "28px",
                  height: "24px",
                  padding: 0,
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setFontSize(
                    fontSize > 5
                      ? fontSize - 1
                      : 5
                  )
                }
              >
                -
              </button>

              <Button
                title={fontSize}
              />

              <button
                type="button"
                title="Increase font size"
                style={{
                  width: "28px",
                  height: "24px",
                  padding: 0,
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setFontSize(
                    fontSize + 1
                  )
                }
              >
                +
              </button>
            </div>

            {/* THEME */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "24px",
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
                  height: "24px",
                }}
              >
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={24}
                  onChange={
                    setTheme
                  }
                  checked={
                    darkTheme
                  }
                />
              </div>

              <IoMdMoon
                color={
                  darkTheme
                    ? "#FDB813"
                    : "grey"
                }
                fontSize={20}
                onClick={() =>
                  setTheme(true)
                }
                style={{
                  cursor:
                    "pointer",
                }}
              />
            </div>

            <Menu />
          </div>
        </HeaderContainer>

        {/* EDITORS */}

        <TopContainer>
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
              borderLeft:
                "14px solid #adddd7",
              borderRight:
                "14px solid #adddd7",
              borderBottom:
                "14px solid #adddd7",
              boxShadow:
                "0 0 10px #5eead4",
            }}
          >
            {/* JSON INPUT */}

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Editor
                height={`calc(100vh - ${
                  headerContainerHeight +
                  footerContainerHeight -
                  20
                }px)`}
                theme={
                  darkTheme
                    ? "vs-dark"
                    : "vs"
                }
                path="file:///json-to-xml/input.json"
                value={
                  editorData
                }
                onChange={(
                  value
                ) => {
                  setEditorData(
                    value || ""
                  );
                }}
                language="json"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    handleMouseWheel: true,
                    alwaysConsumeMouseWheel: true,
                  },
                  renderLineHighlight:
                    "none",
                  isWholeLine: true,
                }}
              />
            </div>

            {/* XML OUTPUT */}

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Editor
                height={`calc(100vh - ${
                  headerContainerHeight +
                  footerContainerHeight -
                  20
                }px)`}
                width="100%"
                theme={
                  darkTheme
                    ? "vs-dark"
                    : "vs"
                }
                path="file:///json-to-xml/result.xml"
                value={
                  resultData || ""
                }
                onMount={
                  onMountResultEditor
                }
                language="xml"
                options={{
                  readOnly: false,
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    handleMouseWheel: true,
                    alwaysConsumeMouseWheel: true,
                  },
                  renderLineHighlight:
                    "none",
                  isWholeLine: true,
                }}
              />

              {/* ERROR */}

              {error && (
                <div
                  style={{
                    position:
                      "absolute",
                    left: "12px",
                    right: "12px",
                    bottom: "12px",
                    padding:
                      "10px 12px",
                    background:
                      "#fee2e2",
                    color:
                      "#991b1b",
                    border:
                      "1px solid #fecaca",
                    borderRadius:
                      "6px",
                    fontSize:
                      "13px",
                    zIndex: 5,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </SplitPane>
        </TopContainer>

        {/* TOOLBAR */}

        <BottomContainer>
          <div
            style={{
              display: "flex",
              position:
                "relative",
              height: `calc(100vh - ${footerContainerHeight}px)`,
              borderTop:
                "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                backgroundColor:
                  "#f1f5f9",
                width: "100%",
              }}
            >
              <ToolBar>
                {/* PASTE */}

                <ToolBtn
                  onClick={
                    onClickPaste
                  }
                >
                  <MdOutlineContentPaste />
                  Paste
                </ToolBtn>

                {/* UPLOAD */}

                <label
                  style={{
                    display:
                      "inline-flex",
                  }}
                >
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={
                      handleFileUpload
                    }
                    style={{
                      display:
                        "none",
                    }}
                  />

                  <ToolBtn
                    as="span"
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >
                    <IoMdDownload
                      style={{
                        transform:
                          "rotate(180deg)",
                      }}
                    />
                    Upload JSON
                  </ToolBtn>
                </label>

                {/* CLEAR */}

                <ToolBtn
                  onClick={clear}
                >
                  <AiOutlineDelete />
                  Clear
                </ToolBtn>

                {/* HISTORY */}

                <ToolBtn
                  onClick={() =>
                    setIsHistoryOpen(
                      true
                    )
                  }
                >
                  <MdHistory />
                  History
                </ToolBtn>

                {/* DOWNLOAD */}

                <ToolBtn
                  onClick={() =>
                    download(
                      "converted.xml",
                      resultData
                    )
                  }
                  disabled={
                    !resultData
                  }
                >
                  <IoMdDownload />
                  Download
                </ToolBtn>

                {/* PASTE RESULT */}

                <ToolBtn
                  onClick={() => {
                    if (
                      resultData
                    ) {
                      setEditorData(
                        resultData
                      );
                    }
                  }}
                  disabled={
                    !resultData
                  }
                >
                  <LuMoveHorizontal />
                  Paste Result
                </ToolBtn>

                <ToolRight>
                  {/* DOWNLOAD RESULT */}

                  <ToolBtn
                    onClick={() =>
                      download(
                        "converted.xml",
                        resultData
                      )
                    }
                    disabled={
                      !resultData
                    }
                  >
                    <IoMdDownload />
                    Download Result
                  </ToolBtn>

                  {/* COPY */}

                  <CopyToClipboard
                    text={
                      resultData ||
                      ""
                    }
                    onCopy={() =>
                      setCopyResButtonTitle(
                        "Copied"
                      )
                    }
                  >
                    <ToolBtn
                      disabled={
                        !resultData
                      }
                    >
                      <IoCopyOutline />
                      {
                        copyResButtonTitle
                      }
                    </ToolBtn>
                  </CopyToClipboard>

                  <ToolDivider />

                  {/* SEARCH */}

                  <ToolBtn
                    onClick={
                      findWord
                    }
                  >
                    <IoSearch />
                    Search
                  </ToolBtn>
                </ToolRight>
              </ToolBar>
            </div>
          </div>

          {/* FOOTER NAV */}

          <div className="menu-container">
            <div
              style={{
                position:
                  "absolute",
                right: "10px",
                bottom: "2px",
                display:
                  "flex",
                fontSize:
                  "10px",
              }}
            >
              {HOME_NAV_LINKS.map(
                ({
                  href,
                  label,
                }) => (
                  <Link
                    className="menu-item"
                    href={
                      href
                    }
                    key={
                      href
                    }
                  >
                    {label}
                  </Link>
                )
              )}
            </div>
          </div>
        </BottomContainer>

        {/* HISTORY */}

        {isHistoryOpen && (
          <HistoryOverlay
            role="presentation"
            onClick={() =>
              setIsHistoryOpen(
                false
              )
            }
          >
            <HistoryModal
              role="dialog"
              aria-modal="true"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <HistoryModalHeader>
                <h2>
                  JSON to XML Conversion History
                </h2>

                <button
                  type="button"
                  aria-label="Close history"
                  onClick={() =>
                    setIsHistoryOpen(
                      false
                    )
                  }
                >
                  <IoMdClose />
                </button>
              </HistoryModalHeader>

              <HistoryCards>
                {history.length ===
                  0 && (
                  <div
                    style={{
                      color:
                        "#94a3b8",
                    }}
                  >
                    No saved history
                  </div>
                )}

                {history.map(
                  (
                    item
                  ) => (
                    <HistoryCard
                      key={
                        item.id
                      }
                    >
                      <div
                        className="card-content"
                        title={
                          item.input
                        }
                        onClick={() =>
                          restoreHistory(
                            item
                          )
                        }
                      >
                        <span className="timestamp">
                          {
                            item.time
                          }
                        </span>

                        <span className="preview">
                          JSON:{" "}
                          {item.input.substring(
                            0,
                            120
                          )}
                        </span>

                        <span className="preview">
                          XML:{" "}
                          {item.output.substring(
                            0,
                            300
                          )}
                        </span>
                      </div>

                      <button
                        className="card-delete"
                        type="button"
                        onClick={() =>
                          deleteHistory(
                            item.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </HistoryCard>
                  )
                )}
              </HistoryCards>
            </HistoryModal>
          </HistoryOverlay>
        )}

        {/* SEO CONTENT */}

        <HomeSeoSection>
          <div className="content">
            <h2>
              Free Online JSON to XML Converter
            </h2>

            <p>
              JSON to XML Converter is a free
              online tool that converts JSON data
              into clean and properly formatted XML
              directly in your browser.
            </p>

            <p>
              Paste JSON into the input editor or
              upload a JSON file to instantly convert
              JSON objects, arrays, attributes, and
              text into XML format.
            </p>

            <div className="link-row">
              {HOME_NAV_LINKS.map(
                ({
                  href,
                  label,
                }) => (
                  <Link
                    href={href}
                    key={href}
                  >
                    {label}
                  </Link>
                )
              )}
            </div>

            <h3>
              Why use this JSON to XML Converter?
            </h3>

            <ul>
              <li>
                Convert JSON to XML instantly
                in your browser.
              </li>

              <li>
                Upload JSON files directly from
                your computer.
              </li>

              <li>
                Automatically format the
                converted XML.
              </li>

              <li>
                Convert JSON arrays into repeated
                XML elements.
              </li>

              <li>
                Convert JSON attributes using
                the @attributes property.
              </li>

              <li>
                Convert JSON text using the
                #text property.
              </li>

              <li>
                Copy or download the converted
                XML.
              </li>

              <li>
                No server-side processing is
                required.
              </li>
            </ul>

            <h3>
              Common Questions
            </h3>

            <h4>
              What is JSON to XML conversion?
            </h4>

            <p>
              JSON to XML conversion transforms
              structured JSON data into XML format.
              XML is commonly used for data exchange,
              configuration files, enterprise systems,
              and applications that require XML-based
              APIs.
            </p>

            <h4>
              How do I convert JSON to XML?
            </h4>

            <p>
              Paste your JSON into the input editor
              or upload a JSON file. The converter
              automatically parses the JSON and
              displays the resulting XML in the
              output editor.
            </p>

            <h4>
              How are JSON arrays converted to XML?
            </h4>

            <p>
              JSON arrays are converted into repeated
              XML elements. For example, an array
              containing multiple products can become
              multiple product elements in the XML.
            </p>

            <h4>
              How can I create XML attributes from JSON?
            </h4>

            <p>
              Use the{" "}
              <strong>
                @attributes
              </strong>{" "}
              property inside a JSON object. Each
              property inside @attributes becomes an
              XML attribute.
            </p>

            <h4>
              Is this JSON to XML converter free?
            </h4>

            <p>
              Yes. This JSON to XML converter is
              free to use online and processes the
              conversion directly in your browser.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;