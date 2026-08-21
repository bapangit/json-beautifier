
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
import { LuMoveHorizontal } from "react-icons/lu";
import Menu from "../../Components/Menu";
import { useBookmarkStatus } from "@/Components/CustomStates/CheckBookmark";

const XML_TO_JSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "XML to JSON Converter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires modern web browser",
  description:
    "Free online XML to JSON converter that transforms XML data into formatted JSON with a split editor and instant conversion results.",
  url: "https://www.json-beautifier.net/xml-to-json",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Convert XML to JSON",
    "Paste XML and generate JSON instantly",
    "Copy and download converted JSON",
    "Validate and inspect converted output",
    "Works in any browser",
  ],
};

const headerContainerHeight = 70;
const footerContainerHeight = 110;

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ---------- XML -> JSON helpers ---------- */

const xmlElementToObject = (element) => {
  const result = {};

  // Add XML attributes
  if (element.attributes && element.attributes.length > 0) {
    Array.from(element.attributes).forEach((attribute) => {
      result[`@${attribute.name}`] = attribute.value;
    });
  }

  const childElements = Array.from(element.children);

  // Get direct text nodes only
  const textContent = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue.trim())
    .filter(Boolean)
    .join(" ");

  // Element has no child elements
  if (childElements.length === 0) {
    // No attributes, return text directly
    if (Object.keys(result).length === 0) {
      return textContent;
    }

    // Attributes + text content
    if (textContent) {
      result["#text"] = textContent;
    }

    return result;
  }

  // Group child elements by tag name
  childElements.forEach((child) => {
    const childName = child.tagName;
    const childValue = xmlElementToObject(child);

    if (Object.prototype.hasOwnProperty.call(result, childName)) {
      if (!Array.isArray(result[childName])) {
        result[childName] = [result[childName]];
      }

      result[childName].push(childValue);
    } else {
      result[childName] = childValue;
    }
  });

  // Preserve mixed text content
  if (textContent) {
    result["#text"] = textContent;
  }

  return result;
};

const formatJsonData = (data) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(data, "application/xml");

  const parserError =
    xmlDocument.querySelector("parsererror") ||
    xmlDocument.getElementsByTagName("parsererror")[0];

  if (parserError) {
    throw new Error("Invalid XML");
  }

  const root = xmlDocument.documentElement;

  if (!root || root.nodeName === "parsererror") {
    throw new Error("Invalid XML");
  }

  const result = {
    [root.tagName]: xmlElementToObject(root),
  };

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
  border-bottom: 1px solid grey;
  background-color: darkgrey;
  color: #000000;
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
    white-space: nowrap;
  }

  .bookmark-message {
    flex: 1;
    min-width: 180px;
    text-align: center;
    font-size: 15px;
    font-weight: 500;
  }

  .menu-toggle {
    cursor: pointer;
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

  ${(p) => {
    return p.mode === "H"
      ? css`
          height: calc(
            100vh - ${headerContainerHeight + footerContainerHeight - 20}px
          );
        `
      : css`
          height: calc(
            100vh - ${footerContainerHeight + headerContainerHeight - 20}px
          );
        `;
  }}
`;

const BottomContainer = styled.div`
  width: 100%;
  height: ${footerContainerHeight}px;
  display: ${(p) => (p.$show || true ? "flex" : "none")};
  flex-direction: column;
  background-color: #252525;
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

  input {
    width: 40px;
    margin-left: 2px;
    border: none;
    background-color: lightblue;
    font-size: large;
    padding: 0px 4px;

    &:focus {
      outline: none;
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

    :active {
      color: #963d32;
    }

    &:hover {
      border-color: #963d32;
      background-color: #8b4238;
    }
  }

  .icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid grey;

    :hover {
      color: red;
    }
  }
`;

function App() {
  const { sId } = useParams();
const [isBookmarked, bookmark] = useBookmarkStatus();
  const { tabData, save, getTabData, deleteTab } = SavedTabData();

  const [editorData, setEditorData] = useState("");

  /* Timestamp */

  const [timestampHovered, setTimestampHovered] = useState();

  const tempEditorData = useMemo(() => {
    if (timestampHovered) {
      return getTabData(timestampHovered);
    }

    return "";
  }, [timestampHovered, getTabData]);

  const [resultData, setResultData] = useState("");

  const [editor, setEditor] = useState();
  const [monaco, setMonaco] = useState();

  const [trimValue, setTrimValue] = TrimValueState();
  const [findValue, setFindValue] = useState("");

  const [containerViewMode, setContainerViewMode] = useState("B");
  const [isContainerViewModeReady, setIsContainerViewModeReady] =
    useState(false);

  const [darkTheme, setDarkTheme] = useState(false);

  useBrowserLayoutEffect(() => {
    setEditorData("");
    setResultData("");

    const savedContainerMode = getContainerMode();

    setContainerViewMode(savedContainerMode === "B" ? "B" : "H");
    setDarkTheme(getMode());
    setIsContainerViewModeReady(true);
  }, [sId]);

  const updateContainerMode = (mode) => {
    setContainerViewMode(mode);
    saveContainerMode(mode);
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handler = () => {
      setTimeout(() => {
        editor.getAction("actions.find").run();
      }, 500);
    };

    return () => {
      clearTimeout(handler);
    };
  }, [findValue, editor]);

  const [isPasting, setIsPasting] = useState(false);

  const onMountResultEditor = (editorInstance, monacoInstance) => {
    editorInstance.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;

      if (keyCode === 52 && (metaKey || ctrlKey)) {
        event.preventDefault();
      }
    });

    monacoInstance.editor.defineTheme("myThemeDark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {},
    });

    monacoInstance.editor.defineTheme("myThemeLight", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {},
    });

    const mode = getMode();

    monacoInstance.editor.setTheme(
      mode ? "myThemeDark" : "myThemeLight",
    );

    setEditor(editorInstance);
    setMonaco(monacoInstance);
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    const output = resultData || "";

    if (editor.getValue() !== output) {
      editor.setValue(output);
    }

    editor.layout();
  }, [editor, resultData]);

  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark ? "myThemeDark" : "myThemeLight",
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

  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        setNewData(text);
      }
    } catch {
      // Clipboard access failed
    }
  };

  const [newData, setNewData] = useState("");

  useEffect(() => {
    if (!newData) {
      return;
    }

    const handler = setTimeout(() => {
      const tabArr = Object.keys(tabData);

      if (tabArr.length) {
        if (getTabData(tabArr[0]) !== newData) {
          save(newData);
        }
      } else {
        save(newData);
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [newData, tabData, getTabData, save]);

  const findWord = () => {
    if (editor) {
      editor.getAction("actions.find").run();
    }
  };

  const trim = () => {
    return trimEditorData(editorData, trimValue);
  };

  useEffect(() => {
    if (isContainerViewModeReady && !sId) {
      saveHistory(editorData);
    }
  }, [editorData, isContainerViewModeReady, sId]);

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
  }, [editorData, isContainerViewModeReady]);

  const onClickTrim = () => {
    convertOnChange(trim());
  };

  useEffect(() => {
    if (!isContainerViewModeReady) {
      return;
    }

    const handler = setTimeout(() => {
      onClickTrim();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [trimValue, isContainerViewModeReady]);

  const clear = () => {
    setEditorData("");
    setResultData("");
  };

  const [copyResButtonTitle, setCopyResButtonTitle] =
    useState("Copy");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (copyResButtonTitle !== "Copy") {
        setTimeout(() => {
          setCopyResButtonTitle("Copy");
        }, 1000);
      }
    }, 4000);

    return () => {
      clearTimeout(handler);
    };
  }, [copyResButtonTitle]);

  function resetFindToolbarPosition(width) {
    if (editor) {
      editor.layout({ width });
    }
  }

  function download(filename, text) {
    const element = document.createElement("a");

    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(text),
    );

    element.setAttribute("download", filename);

    element.style.display = "none";

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const [fontSize, setFontSize] = useState(14);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(HOME_JSON_LD),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(XML_TO_JSON_SCHEMA),
        }}
      />

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          visibility: isContainerViewModeReady
            ? "visible"
            : "hidden",
        }}
      >
        <HeaderContainer $show={containerViewMode === "H"}>
          <div className="brand-nav">
            <h1 className="brand-title">
              XML to JSON Converter
            </h1>
          </div>

          {Object.keys(tabData).length ? null : (
            <>
              <div className="bookmark-message">
                {/* Paste raw XML in left panel, Kindly save to bookmarks
                bar for future access to this tool. */}
              </div>

              {!isBookmarked && <button
                  onClick={() => {
                    const isMac = navigator.platform
                      .toUpperCase()
                      .includes("MAC");
                    alert(
                      `To bookmark this page, press ${isMac ? "⌘ + D" : "Ctrl + D"}`,
                    );
                    bookmark()
                  }}
                >
                  ⭐ Bookmark this Tool
                </button>}
            </>
          )}

          <div>
            <Menu />
          </div>
        </HeaderContainer>

        <TopContainer mode={containerViewMode}>
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
            }}
            onDragFinished={(e) => {
              resetFindToolbarPosition(
                window.screen.width - e,
              );
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
                path="file:///xml-to-json/input.xml"
                value={tempEditorData || editorData || ""}
                onMount={(editorInstance) => {
                  editorInstance.focus();

                  editorInstance.onKeyDown((event) => {
                    const { keyCode, ctrlKey, metaKey } = event;

                    if (
                      keyCode === 52 &&
                      (metaKey || ctrlKey)
                    ) {
                      setIsPasting(true);
                    }
                  });
                }}
                language="xml"
                onChange={(data) => {
                  setEditorData(data || "");
                }}
                options={{
                  minimap: { enabled: false },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    handleMouseWheel: true,
                    alwaysConsumeMouseWheel: true,
                  },
                  renderLineHighlight: "none",
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
                path="file:///xml-to-json/result.json"
                value={resultData || ""}
                onMount={onMountResultEditor}
                language="json"
                options={{
                  minimap: { enabled: false },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    handleMouseWheel: true,
                    alwaysConsumeMouseWheel: true,
                  },
                  renderLineHighlight: "none",
                  isWholeLine: true,
                }}
              />
            </div>
          </SplitPane>
        </TopContainer>

        <BottomContainer $show={containerViewMode === "B"}>
          <div
            style={{
              display: "flex",
              position: "relative",
              height: `calc(100vh - ${
                containerViewMode === "H"
                  ? headerContainerHeight
                  : footerContainerHeight
              }px)`,
              borderTop: "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#5e5e5e9b",
              }}
            >
              <div
                style={{
                  padding: "0px 5px",
                  display: "flex",
                  gap: "5px",
                  justifyContent: "left",
                }}
              >
                {!sId && (
                  <>
                    <div
                      style={{
                        margin: "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Paste"
                        onClick={onClickPaste}
                        icon={
                          <MdOutlineContentPaste size={40} />
                        }
                      />
                    </div>

                    <div
                      style={{
                        margin: "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Clear"
                        onClick={clear}
                        icon={<AiOutlineDelete size={10} />}
                      />
                    </div>
                  </>
                )}

                <div
                  style={{
                    margin: "4px 4px 2px 4px",
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
                    setCopyResButtonTitle("Copied");
                  }}
                >
                  <div
                    style={{
                      margin: "4px 4px 2px 4px",
                    }}
                  >
                    <Button
                      title={copyResButtonTitle}
                      icon={<IoCopyOutline />}
                    />
                  </div>
                </CopyToClipboard>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "24px",
                    marginTop: "5px",
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
                    onClick={() => {
                      setTheme(false);
                    }}
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
                      onChange={(e) => {
                        setTheme(e);
                      }}
                      checked={darkTheme}
                    />
                  </div>

                  <IoMdMoon
                    color={
                      darkTheme ? "#FDB813" : "grey"
                    }
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setTheme(true);
                    }}
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
                    margin: "4px 4px 2px 8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    title="Download"
                    onClick={() => {
                      download(
                        "result.json",
                        resultData || editorData,
                      );
                    }}
                    icon={<IoMdDownload />}
                  />
                </div>

                <div>
                  <Button
                    title="Paste Result"
                    onClick={() => {
                      if (resultData) {
                        setEditorData(resultData);
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
                  }}
                >
                  Font Size :
                </span>

                <div
                  style={{
                    marginLeft: "5px",
                    display: "flex",
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
                      setFontSize(
                        fontSize > 5
                          ? fontSize - 1
                          : 5,
                      )
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
                    onClick={() =>
                      setFontSize(fontSize + 1)
                    }
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
                      &#10006;
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
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "5px 8px",
                      backgroundColor: "#1b1b1bb7",
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
                        border: "1px solid grey",
                        padding: "2px",
                        borderRadius: "4px",
                        position: "relative",
                      }}
                      id="myDivId"
                    >
                      {Object.keys(tabData).length < 1 && (
                        <div
                          style={{
                            color: "lightgray",
                          }}
                        >
                          Empty
                        </div>
                      )}

                      {getTimeDiff(Object.keys(tabData))
                        .reverse()
                        .map(
                          (
                            { timestamp, diffStr },
                            i,
                          ) => {
                            const date = new Date(
                              Number(timestamp),
                            );

                            const time =
                              date.toLocaleString();

                            return (
                              <div
                                className="saved-tab"
                                title={time}
                                key={i}
                                onMouseEnter={() => {
                                  setTimestampHovered(
                                    timestamp,
                                  );
                                }}
                                onMouseLeave={() => {
                                  setTimestampHovered(
                                    null,
                                  );
                                }}
                              >
                                <div
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setEditorData(
                                      getTabData(
                                        timestamp,
                                      ),
                                    );

                                    setNewData(
                                      getTabData(
                                        timestamp,
                                      ),
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
                                  onClick={() => {
                                    deleteTab(timestamp);
                                  }}
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
              <h2>Online XML to JSON Converter</h2>

              <p>
                XML to JSON Converter transforms XML data into readable,
                formatted JSON in a browser-based split editor. Paste XML
                on the left and review the generated JSON on the right.
              </p>

              <p>
                The tool is useful for converting XML API responses,
                migrating legacy XML data, inspecting nested XML
                structures, and preparing XML data for modern JavaScript
                applications.
              </p>

              <div className="link-row">
                {HOME_NAV_LINKS.map(
                  ({ href, label }) => (
                    <Link href={href} key={href}>
                      {label}
                    </Link>
                  ),
                )}
              </div>

              <h3>
                Why developers use XML to JSON Converter
              </h3>

              <ul>
                <li>
                  Convert XML elements into structured JSON objects.
                </li>
                <li>
                  Automatically group repeated XML elements into JSON
                  arrays.
                </li>
                <li>
                  Preserve XML attributes using the @ prefix.
                </li>
                <li>
                  Inspect the generated JSON side by side with the
                  original XML.
                </li>
                <li>
                  Copy, paste, search, download, and adjust editor font
                  size.
                </li>
              </ul>

              <h3>Common questions</h3>

              <h4>What does XML to JSON Converter do?</h4>

              <p>
                It parses XML data and converts its structure into
                formatted JSON that you can inspect, copy, and download
                directly in your browser.
              </p>

              <h4>
                How are repeated XML elements converted?
              </h4>

              <p>
                When multiple child elements have the same tag name, the
                converter groups them into a JSON array.
              </p>

              <h4>
                How are XML attributes represented in JSON?
              </h4>

              <p>
                XML attributes are preserved as JSON properties prefixed
                with the @ symbol. For example, an XML attribute named
                id becomes @id in the generated JSON.
              </p>

              <h4>
                Is XML to JSON Converter free to use?
              </h4>

              <p>
                Yes. XML to JSON Converter is a free online XML to JSON
                conversion and formatting tool.
              </p>
            </div>
          </HomeSeoSection>
        )}
      </main>
    </>
  );
}

export default App;
