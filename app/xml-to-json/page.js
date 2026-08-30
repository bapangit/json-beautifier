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
   * Convert an XML DOM node into a JSON-compatible object.
   */
  const xmlNodeToJson = (node) => {
    const obj = {};

    // Attributes
    if (node.attributes && node.attributes.length > 0) {
      const attributes = {};

      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];

        attributes[attribute.name] = attribute.value;
      }

      obj["@attributes"] = attributes;
    }

    const childElements = [];
    let textContent = "";

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.ELEMENT_NODE) {
        childElements.push(child);
      } else if (
        child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.CDATA_SECTION_NODE
      ) {
        const text = child.nodeValue?.trim();

        if (text) {
          textContent += text;
        }
      }
    }

    // No child elements
    if (childElements.length === 0) {
      if (Object.keys(obj).length > 0) {
        if (textContent) {
          obj["#text"] = textContent;
        }

        return obj;
      }

      return textContent;
    }

    // Group repeated elements
    childElements.forEach((child) => {
      const name = child.nodeName;
      const value = xmlNodeToJson(child);

      if (Object.prototype.hasOwnProperty.call(obj, name)) {
        if (!Array.isArray(obj[name])) {
          obj[name] = [obj[name]];
        }

        obj[name].push(value);
      } else {
        obj[name] = value;
      }
    });

    if (textContent) {
      obj["#text"] = textContent;
    }

    return obj;
  };

  /*
   * Convert XML string into formatted JSON.
   */
  const convertXmlToJson = (xmlString) => {
    if (!xmlString || !xmlString.trim()) {
      setResultData("");
      setError("");
      return;
    }

    try {
      setError("");

      if (typeof DOMParser === "undefined") {
        throw new Error(
          "XML parsing is not supported by this browser."
        );
      }

      const parser = new DOMParser();

      const xmlDocument = parser.parseFromString(
        xmlString,
        "application/xml"
      );

      const parserError =
        xmlDocument.querySelector("parsererror");

      if (parserError) {
        throw new Error(
          parserError.textContent ||
            "Invalid XML. Please check your XML syntax."
        );
      }

      const root = xmlDocument.documentElement;

      if (!root) {
        throw new Error(
          "No XML root element was found."
        );
      }

      const jsonObject = {
        [root.nodeName]: xmlNodeToJson(root),
      };

      const formattedJson = JSON.stringify(
        jsonObject,
        null,
        2
      );

      setResultData(formattedJson);

      saveToHistory(xmlString, formattedJson);
    } catch (err) {
      setResultData("");

      setError(
        err?.message ||
          "Unable to convert XML to JSON."
      );
    }
  };

  /*
   * Save history locally.
   */
  const saveToHistory = (input, output) => {
    if (!input || !output) return;

    const item = {
      id: Date.now(),
      input,
      output,
      time: new Date().toLocaleString(),
    };

    setHistory((previous) => {
      const updated = [item, ...previous].slice(0, 20);

      try {
        localStorage.setItem(
          "xml-to-json-history",
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
      const saved = localStorage.getItem(
        "xml-to-json-history"
      );

      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  /*
   * Paste XML from clipboard.
   */
  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        convertXmlToJson(text);
      }
    } catch {
      setError("Unable to read clipboard.");
    }
  };

  /*
   * Upload XML file.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      const text = await file.text();

      if (!text.trim()) {
        throw new Error(
          "The selected XML file is empty."
        );
      }

      setEditorData(text);
      convertXmlToJson(text);
    } catch (err) {
      setResultData("");

      setError(
        err?.message ||
          "Unable to read the selected XML file."
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
   * Download result.
   */
  const download = (filename, text) => {
    if (!text) return;

    const blob = new Blob([text], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");

    element.href = url;
    element.download = filename;

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    URL.revokeObjectURL(url);
  };

  /*
   * Copy button status.
   */
  useEffect(() => {
    if (copyResButtonTitle === "Copy") return;

    const timer = setTimeout(() => {
      setCopyResButtonTitle("Copy");
    }, 2000);

    return () => clearTimeout(timer);
  }, [copyResButtonTitle]);

  /*
   * Automatically convert XML when input changes.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setResultData("");
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      convertXmlToJson(editorData);
    }, 500);

    return () => clearTimeout(timer);
  }, [editorData]);

  /*
   * Theme.
   */
  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark ? "myThemeDark" : "myThemeLight"
      );
    }

    setDarkTheme(isDark);

    try {
      localStorage.setItem(
        "xml-json-theme",
        isDark ? "dark" : "light"
      );
    } catch {}
  };

  /*
   * Load theme.
   */
  useEffect(() => {
    try {
      const theme = localStorage.getItem(
        "xml-json-theme"
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

    setEditor(editorInstance);
    setMonaco(monacoInstance);
  };

  /*
   * Search.
   */
  const findWord = () => {
    if (editor) {
      editor.getAction("actions.find")?.run();
    }
  };

  /*
   * Restore history.
   */
  const restoreHistory = (item) => {
    setEditorData(item.input);
    setResultData(item.output);
    setError("");
    setIsHistoryOpen(false);
  };

  /*
   * Delete history item.
   */
  const deleteHistory = (id) => {
    setHistory((previous) => {
      const updated = previous.filter(
        (item) => item.id !== id
      );

      try {
        localStorage.setItem(
          "xml-to-json-history",
          JSON.stringify(updated)
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
              XML to JSON Converter
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

              <Button title={fontSize} />

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
                  setFontSize(fontSize + 1)
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
                onClick={() => setTheme(false)}
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
                  onChange={setTheme}
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
                onClick={() => setTheme(true)}
                style={{
                  cursor: "pointer",
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
            {/* XML INPUT */}

            <div
              style={{
                position: "relative",
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
                path="file:///xml-to-json/input.xml"
                value={editorData}
                onChange={(value) => {
                  setEditorData(value || "");
                }}
                language="xml"
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

            {/* JSON OUTPUT */}

            <div
              style={{
                position: "relative",
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
                path="file:///xml-to-json/result.json"
                value={resultData || ""}
                onMount={
                  onMountResultEditor
                }
                language="json"
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
                    position: "absolute",
                    left: "12px",
                    right: "12px",
                    bottom: "12px",
                    padding:
                      "10px 12px",
                    background:
                      "#fee2e2",
                    color: "#991b1b",
                    border:
                      "1px solid #fecaca",
                    borderRadius: "6px",
                    fontSize: "13px",
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
              position: "relative",
              height: `calc(100vh - ${footerContainerHeight}px)`,
              borderTop:
                "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display: "flex",
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
                  onClick={onClickPaste}
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
                    accept=".xml,text/xml,application/xml"
                    onChange={
                      handleFileUpload
                    }
                    style={{
                      display: "none",
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
                    Upload XML
                  </ToolBtn>
                </label>

                {/* CLEAR */}

                <ToolBtn onClick={clear}>
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
                      "converted.json",
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

                {/* MOVE RESULT TO INPUT */}

                <ToolBtn
                  onClick={() => {
                    if (resultData) {
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
                        "converted.json",
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
                      resultData || ""
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
                display: "flex",
                fontSize: "10px",
              }}
            >
              {HOME_NAV_LINKS.map(
                ({
                  href,
                  label,
                }) => (
                  <Link
                    className="menu-item"
                    href={href}
                    key={href}
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
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <HistoryModalHeader>
                <h2>
                  XML to JSON Conversion History
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
                  (item) => (
                    <HistoryCard
                      key={item.id}
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
                          XML:{" "}
                          {item.input.substring(
                            0,
                            120
                          )}
                        </span>

                        <span className="preview">
                          JSON:{" "}
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
              Free Online XML to JSON Converter
            </h2>

            <p>
              XML to JSON Converter is a free
              online tool that converts XML data
              into clean and properly formatted JSON
              directly in your browser.
            </p>

            <p>
              Paste XML into the input editor or
              upload an XML file to instantly
              convert XML elements, attributes, text,
              and repeated elements into JSON.
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
              Why use this XML to JSON Converter?
            </h3>

            <ul>
              <li>
                Convert XML to JSON instantly
                in your browser.
              </li>

              <li>
                Upload XML files directly from
                your computer.
              </li>

              <li>
                Automatically format the
                converted JSON.
              </li>

              <li>
                Convert XML attributes into
                JSON properties.
              </li>

              <li>
                Handle repeated XML elements
                as JSON arrays.
              </li>

              <li>
                Copy or download the converted
                JSON.
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
              What is XML to JSON conversion?
            </h4>

            <p>
              XML to JSON conversion transforms
              structured XML data into JSON format.
              JSON is commonly used for APIs,
              web applications, JavaScript
              applications, and data exchange.
            </p>

            <h4>
              How do I convert XML to JSON?
            </h4>

            <p>
              Paste your XML into the input editor
              or upload an XML file. The converter
              automatically parses the XML and
              displays the resulting JSON in the
              output editor.
            </p>

            <h4>
              Does this converter support XML attributes?
            </h4>

            <p>
              Yes. XML attributes are converted
              into an{" "}
              <strong>
                @attributes
              </strong>{" "}
              object in the resulting JSON.
            </p>

            <h4>
              How are repeated XML elements converted?
            </h4>

            <p>
              When an XML element occurs multiple
              times under the same parent, the
              converter represents those elements
              as a JSON array.
            </p>

            <h4>
              Is this XML to JSON converter free?
            </h4>

            <p>
              Yes. This XML to JSON converter is
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