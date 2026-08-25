"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { css, styled } from "styled-components";
import SplitPane from "react-split-pane";
import {
  TrimValueState,
  decompress,
  getContainerMode,
  getMode,
  getTimeDiff,
  saveContainerMode,
  saveHistory,
  setMode,
} from "../utils";
import { useParams } from "next/navigation";

import Switch from "react-switch";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdClose } from "react-icons/io";
import SavedTabData from "../Components/CustomStates/SavedTabData";
// import { LuMenu } from "react-icons/lu";
// import { MdClose } from "react-icons/md";
import { IoMdMoon } from "react-icons/io";
import { HOME_JSON_LD } from "./seo";
import Link from "next/link";
// import BookmarkButton from "@/Components/BookmarkButton";
import { MdHistory, MdOutlineContentPaste } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { LuMoveHorizontal } from "react-icons/lu";
import Button from "@/Components/Buttons/Button";
import Menu from "@/Components/Menu";
import { useBookmarkStatus } from "@/Components/CustomStates/CheckBookmark";
// import BannerAdC from "@/Components/Ads/BannerAdC";

const headerContainerHeight = 70;
const footerContainerHeight = 110;
const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const formatJsonData = (data) => JSON.stringify(JSON.parse(data), null, 2);

const trimEditorData = (data, trimValue) => {
  const trimmedData = data?.trim() || "";
  if (
    trimValue &&
    trimmedData.substring(
      trimmedData.length - trimValue.length,
      trimmedData.length,
    ) === trimValue
  ) {
    return trimmedData.substring(0, trimmedData.length - trimValue.length);
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
  height: calc(100vh - ${headerContainerHeight + footerContainerHeight - 20}px);
`;

const BottomContainer = styled.div`
  width: 100%;
  height: ${footerContainerHeight}px;
  display: ${(p) => (p.$show || true ? "flex" : "none")};
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
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    margin: 0px 5px;
    color: #334155;
    background-color: #ffffff;
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
      background-color: #fbeae7;
    }
  }
  .icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    :hover {
      color: red;
    }
  }
`;

/* Redesigned bottom toolbar — pill buttons, white surface, icon + label */
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
  border: 1px solid ${(p) => (p.$primary ? "#0f9d78" : "#e2e8f0")};
  background: ${(p) => (p.$primary ? "#0f9d78" : "#ffffff")};
  color: ${(p) => (p.$primary ? "#ffffff" : "#334155")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(p) => (p.$primary ? "#0c8a67" : "#f1f5f9")};
    border-color: ${(p) => (p.$primary ? "#0c8a67" : "#cbd5e1")};
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
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dbe5e9;
  border-radius: 0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(36, 55, 70, 0.08);

  .card-content {
    flex: 1;
    min-width: 0;
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
  const [isBookmarked, bookmark] = useBookmarkStatus();
  const { sId } = useParams();
  const {
    tabData,
    save,
    getTabData,
    deleteTab,
    moveTabToFirst,
  } = SavedTabData();

  const [editorData, setEditorData] = useState("");

  /* Timestamp */
  const [timestampHovered, setTimestampHovered] = useState();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const tempEditorData = useMemo(() => {
    if (timestampHovered) {
      return getTabData(timestampHovered);
    } else {
      return "";
    }
  }, [timestampHovered]);

  const [resultData, setResultData] = useState("");

  const [compressionType, setCompressionType] = useState("text");

  const [editor, setEditor] = useState();
  const [monaco, setMonaco] = useState();

  const [trimValue, setTrimValue] = TrimValueState();
  const [findValue, setFindValue] = useState("");
  const [inputLanguage, setInputLanguage] = useState("");

  const [containerViewMode, setContainerViewMode] = useState("B");
  const [isContainerViewModeReady, setIsContainerViewModeReady] =
    useState(false);

  const updateContainerMode = (mode) => {
    setContainerViewMode(mode);
    saveContainerMode(mode);
  };

  const [darkTheme, setDarkTheme] = useState(false);

  useBrowserLayoutEffect(() => {
    if (!sId) {
      setEditorData("");
      setResultData("");
    }
    const savedContainerMode = getContainerMode();
    setContainerViewMode(savedContainerMode === "B" ? "B" : "H");
    setDarkTheme(getMode());
    setIsContainerViewModeReady(true);
  }, [sId]);

  useEffect(() => {
    const handler = () => {
      setTimeout(() => {
        editor.getAction("actions.find").run();
      }, 500);
    };
    return () => {
      clearTimeout(handler);
    };
  }, [findValue]);

  const [isPasting, setIsPasting] = useState(false);

  const onMountResultEditor = (editor, monaco) => {
    editor.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;
      if (keyCode === 52 && (metaKey || ctrlKey)) {
        event.preventDefault();
      }
    });

    monaco.editor.defineTheme("myThemeDark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {},
    });
    monaco.editor.defineTheme("myThemeLight", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {},
    });
    const mode = getMode();

    monaco.editor.setTheme(mode ? "myThemeDark" : "myThemeLight");
    setEditor(editor);
    setMonaco(monaco);
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
      if (isDark) {
        monaco.editor.setTheme("myThemeDark");
      } else {
        monaco.editor.setTheme("myThemeLight");
      }
      setDarkTheme(isDark);
      setMode(isDark);
    }
  };

  const handleEval = (input) => {
    try {
      const evaluatedResult = Function(`"use strict"; return (${input});`)();
      setResultData(JSON.stringify(evaluatedResult, null, 2));
    } catch (error) {
      throw new Error();
    }
  };

  const prettifyOnChange = (data, isDecompressed) => {
    try {
      setResultData(formatJsonData(data));

      if (!isDecompressed) {
        setInputLanguage("json");
        setCompressionType("json");
      }
    } catch {
      if (isDecompressed) {
        setCompressionType("text");
        setResultData(data);
      } else {
        decompressTest(data);
      }
    }
  };

  const onClickPaste = async (e) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setEditorData(text);
        setNewData(text);
      }
    } catch {
      // console.log("failed paste");
    }
  };

  const [newData, setNewData] = useState("");

  useEffect(() => {
    if (newData) {
      const handler = setTimeout(() => {
        const tabArr = Object.keys(tabData);
        if (tabArr.length) {
          if (getTabData(tabArr[0]) !== newData) {
            save(newData);
          }
        } else {
          save(newData);
        }
      }, [2000]);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [newData]);

  const decompressTest = async (compressedData) => {
    try {
      const res = await decompress(compressedData);
      prettifyOnChange(res.result, true);
      if (res.type) {
        setCompressionType(res.type);
      } else {
        handleEval(compressedData);
      }
    } catch {
      // console.log("failed decompress");
    }
  };

  // const prettyfyOnClick = () => {
  //   if (editor) {
  //     editor.getAction("editor.action.formatDocument").run();
  //   }
  // };
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
      prettifyOnChange(trim(), false);
      if (editorData && isPasting) {
        setNewData(editorData);
        setIsPasting(false);
      }
    }, [500]);

    return () => {
      clearTimeout(handler);
    };
  }, [editorData, isContainerViewModeReady]);

  const onClickTrim = () => {
    prettifyOnChange(trim(), false);
  };

  useEffect(() => {
    if (!isContainerViewModeReady) {
      return;
    }

    const handler = setTimeout(() => {
      onClickTrim();
    }, [500]);

    return () => {
      clearTimeout(handler);
    };
  }, [trimValue, isContainerViewModeReady]);

  const clear = () => {
    setEditorData("");
    // setResultData("");
  };

  const [copyButtonTitle, setCopyButtonTitle] = useState("Copy");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (copyButtonTitle !== "Copy") {
        setTimeout(() => {
          setCopyButtonTitle("Copy");
        }, 4000);
      }
      return clearTimeout(handler);
    }, 5000);
  }, [copyButtonTitle]);

  function resetFindToolbarPosition(width) {
    editor.layout({ width: width });
  }

  // Copy Result

  const [copyResButtonTitle, setCopyResButtonTitle] = useState("Copy");

  /* Container View Mode */

  useEffect(() => {
    const handler = setTimeout(() => {
      if (copyResButtonTitle !== "Copy") {
        setTimeout(() => {
          setCopyResButtonTitle("Copy");
        }, 1000);
      }
      return clearTimeout(handler);
    }, 4000);
  }, [copyResButtonTitle]);

  function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          visibility: isContainerViewModeReady ? "visible" : "hidden",
        }}
      >
        {
          <HeaderContainer $show={containerViewMode === "H"}>
            <div className="brand-nav">
              <h1 className="brand-title">JSON Beautifier </h1>
            </div>
            {/* {Object.keys(tabData).length ? null : (
              <>
                <div className="bookmark-message">
           Paste raw data in left panel , Kindly save to bookmarks bar for future access to this tool.
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
                  ⭐ To visit again, Bookmark this tool
                </button>}
              </>
            )} */}

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
                <button
                  type="button"
                  title="Decrease font size"
                  style={{
                    width: "28px",
                    height: "24px",
                    padding: 0,
                    fontSize: "16px",
                  }}
                  onClick={() => setFontSize(fontSize > 5 ? fontSize - 1 : 5)}
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
                  }}
                  onClick={() => setFontSize(fontSize + 1)}
                >
                  +
                </button>
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
        }
        <TopContainer mode={containerViewMode}>
          <SplitPane
            minSize={100}
            maxSize={800}
            defaultSize="50%"
            split="vertical"
            style={{
              // height: `calc(100vh - ${
              //   containerViewMode === "H"
              //     ? headerContainerHeight
              //     : footerContainerHeight
              // }px)`,
              height: `calc(100vh - ${
                headerContainerHeight + footerContainerHeight - 20
              }px)`,
              width: "100%",
              borderLeft: "14px solid #adddd7",
              borderRight: "14px solid #adddd7",
              borderBottom: "14px solid #adddd7",
              boxShadow: "0 0 10px #5eead4",
            }}
            onDragFinished={(e) => {
              resetFindToolbarPosition(window.screen.width - e);
            }}
          >
            <div>
              <Editor
                // height={`calc(100vh - ${
                //   containerViewMode === "H"
                //     ? headerContainerHeight
                //     : footerContainerHeight
                // }px)`}
                height={`calc(100vh - ${
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                theme="vs-dark"
                path="file:///json-beautifier/input.json"
                value={tempEditorData || editorData || ""}
                onMount={(editor) => {
                  editor.focus();
                  editor.onKeyDown((event) => {
                    const { keyCode, ctrlKey, metaKey } = event;
                    if (keyCode === 52 && (metaKey || ctrlKey)) {
                      setIsPasting(true);
                    }
                  });
                }}
                language={inputLanguage}
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
                // height={`calc(100vh - ${
                //   containerViewMode === "H"
                //     ? headerContainerHeight
                //     : footerContainerHeight
                // }px)`}
                height={`calc(100vh - ${
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                width="100%"
                theme="vs-dark"
                path="file:///json-beautifier/result.json"
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

        {
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
              {/* <div
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "5px",
                  display: "flex",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => updateContainerMode("H")}
              >
                <MdClose
                  style={{
                    color: "white",
                    backgroundColor: "#88888889",
                  }}
                />
              </div> */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#f1f5f9",
                  width: "100%",
                }}
              >
                <ToolBar>
                  <ToolBtn onClick={(e) => onClickPaste(e)}>
                    <MdOutlineContentPaste />
                    Paste
                  </ToolBtn>

                  <ToolBtn onClick={clear}>
                    <AiOutlineDelete />
                    Clear
                  </ToolBtn>

                  <ToolBtn
                    $primary
                    onClick={() => setIsHistoryOpen(true)}
                  >
                    <MdHistory />
                    History
                  </ToolBtn>

                  <CopyToClipboard
                    text={resultData}
                    onCopy={() => {
                      setCopyResButtonTitle("Copied");
                    }}
                  >
                    <ToolBtn>
                      <IoCopyOutline />
                      {copyResButtonTitle}
                    </ToolBtn>
                  </CopyToClipboard>

                  <ToolDivider />

                  <ToolBtn onClick={findWord}>
                    <IoSearch />
                    Search
                  </ToolBtn>

                  <ToolBtn
                    onClick={() => {
                      download("result.txt", tempEditorData || editorData);
                    }}
                  >
                    <IoMdDownload />
                    Download
                  </ToolBtn>

                  <ToolBtn
                    onClick={() => {
                      if (resultData) {
                        setEditorData(() => resultData);
                        setNewData(resultData);
                      }
                    }}
                  >
                    <LuMoveHorizontal />
                    Paste Result
                  </ToolBtn>
                </ToolBar>

                {!sId && (
                  <div
                    className="tool-row"
                    style={{
                      display: "flex",
                      marginTop: "2px",
                      gap: "15px",
                      order: 3,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "5px 8px",
                        backgroundColor: "#ffffff",
                        marginLeft: "8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ color: "#334155", fontSize: "14px" }}>
                        <span style={{ fontSize: "12px" }}>HISTORY</span> :
                        &nbsp;
                      </div>

                      <div
                        style={{
                          display: "flex",
                          minWidth: "370px",
                          maxWidth: "370px",
                          overflowX: "scroll",
                          border: "1px solid #e2e8f0",
                          padding: "2px",
                          borderRadius: "4px",
                          position: "relative",
                        }}
                        id="myDivId"
                      >
                        {Object.keys(tabData).length < 1 && (
                          <div style={{ color: "#94a3b8" }}>Empty</div>
                        )}
                        {getTimeDiff(Object.keys(tabData))
                          .reverse()
                          .map(({ timestamp, diffStr }, i) => {
                            const date = new Date(Number(timestamp));
                            const time = date.toLocaleString();

                            return (
                              <div
                                className="saved-tab"
                                title={time}
                                key={i}
                                onMouseEnter={() => {
                                  setTimestampHovered(timestamp);
                                }}
                                onMouseLeave={() => {
                                  setTimestampHovered(null);
                                }}
                              >
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setEditorData(getTabData(timestamp));
                                    setNewData(getTabData(timestamp));
                                    deleteTab(timestamp);
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
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* ADS */}
              {/* <BannerAdC/> */}
              {/* <AdsComponent dataAdSlot="8496258064" /> */}
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
                  {HOME_NAV_LINKS.map(({ href, label }) => (
                    <Link className="menu-item" href={href} key={href}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </BottomContainer>
        }

        {isHistoryOpen && (
          <HistoryOverlay
            role="presentation"
            onClick={() => setIsHistoryOpen(false)}
          >
            <HistoryModal
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <HistoryModalHeader>
                <h2 id="history-modal-title">History</h2>
                <button
                  type="button"
                  aria-label="Close history"
                  onClick={() => setIsHistoryOpen(false)}
                >
                  <IoMdClose />
                </button>
              </HistoryModalHeader>
              <HistoryCards>
                {Object.keys(tabData).length < 1 && (
                  <div style={{ color: "#94a3b8" }}>No saved history</div>
                )}
                {getTimeDiff(Object.keys(tabData))
                  .reverse()
                  .map(({ timestamp, diffStr }) => {
                    const savedData = getTabData(timestamp);
                    const time = new Date(Number(timestamp)).toLocaleString();

                    return (
                      <HistoryCard key={timestamp}>
                        <div
                          className="card-content"
                          title={savedData}
                          onClick={() => {
                            setEditorData(savedData);
                            moveTabToFirst(timestamp);
                            setIsHistoryOpen(false);
                          }}
                        >
                          <span className="timestamp">{diffStr}</span>
                          <span className="preview">{time}</span>
                          <span className="preview">{savedData}</span>
                        </div>
                        <button
                          className="card-delete"
                          type="button"
                          onClick={() => deleteTab(timestamp)}
                        >
                          Delete
                        </button>
                      </HistoryCard>
                    );
                  })}
              </HistoryCards>
            </HistoryModal>
          </HistoryOverlay>
        )}

        {/* {containerViewMode === "H" && (
          <div style={{ height: "20px", backgroundColor: "#505050" }}></div>
        )} */}
        {!sId && (
          <HomeSeoSection>
            <div className="content">
              <h2>Online JSON beautifier, formatter, viewer, and validator</h2>
              <p>
                JSON Beautifier helps you format JSON, inspect nested objects,
                and clean up API payloads in a browser-based split editor. Paste
                minified JSON on the left and review readable output on the
                right.
              </p>
              <p>
                The tool is useful for debugging API responses, checking JSON
                structure before storing data, and turning compressed payloads
                into readable text during development.
              </p>
              <div className="link-row">
                {HOME_NAV_LINKS.map(({ href, label }) => (
                  <Link href={href} key={href}>
                    {label}
                  </Link>
                ))}
              </div>

              <h3>Why developers use JSON Beautifier</h3>
              <ul>
                <li>Pretty print raw JSON into a readable structure.</li>
                <li>Inspect nested arrays and objects side by side.</li>
                <li>
                  Copy, paste, search, download, and adjust editor font size.
                </li>
                <li>Work with formatted JSON directly in the browser.</li>
              </ul>

              <h3>Common questions</h3>
              <h4>What does JSON Beautifier do?</h4>
              <p>
                JSON Beautifier formats raw JSON into readable, indented output
                and lets you inspect it in a split-view editor.
              </p>
              <h4>Can I validate JSON before using it in an API or app?</h4>
              <p>
                Yes. Invalid JSON fails to parse, which makes malformed payloads
                easier to catch before you use them elsewhere.
              </p>
              <h4>Is JSON Beautifier free to use?</h4>
              <p>
                Yes. JSON Beautifier is a free online JSON formatter,
                beautifier, validator, and viewer.
              </p>
            </div>
          </HomeSeoSection>
        )}
      </main>
    </>
  );
}

export default App;
