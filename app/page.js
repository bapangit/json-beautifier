"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { css, styled } from "styled-components";
import SplitPane from "react-split-pane";
import Button from "../Components/Buttons/Button";
import {
  TrimValueState,
  decompress,
  getContainerMode,
  getHistory,
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
import { LuMenu } from "react-icons/lu";
import { MdClose } from "react-icons/md";
import { IoMdMoon } from "react-icons/io";
import { HOME_JSON_LD } from "./seo";
import Link from "next/link";
import BookmarkButton from "@/Components/BookmarkButton";
import { MdOutlineContentPaste } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { LuMoveHorizontal } from "react-icons/lu";

const headerContainerHeight = 70;
const footerContainerHeight = 104;
const HOME_NAV_LINKS = [
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
  display: ${(p) => (p.$show ? "flex" : "none")};
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
  background: #f3f4f6;
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

  a {
    color: #0f4c81;
  }
`;

const TopContainer = styled.div`
  width: 100%;
  ${(p) => {
    return p.mode === "H"
      ? css`
          height: calc(100vh - ${headerContainerHeight}px);
        `
      : css`
          height: calc(100vh - ${footerContainerHeight}px);
        `;
  }}
`;

const BottomContainer = styled.div`
  width: 100%;
  height: ${footerContainerHeight}px;
  display: ${(p) => (p.$show ? "flex" : "none")};
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
  const { tabData, save, getTabData, deleteTab } = SavedTabData();

  const [editorData, setEditorData] = useState("");

  /* Timestamp */
  const [timestampHovered, setTimestampHovered] = useState();
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

  const [containerViewMode, setContainerViewMode] = useState("H");
  const [isContainerViewModeReady, setIsContainerViewModeReady] =
    useState(false);

  const updateContainerMode = (mode) => {
    setContainerViewMode(mode);
    saveContainerMode(mode);
  };

  const [darkTheme, setDarkTheme] = useState(false);

  useBrowserLayoutEffect(() => {
    if (!sId) {
      const savedEditorData = getHistory();
      setEditorData(savedEditorData);
      const trimmedSavedEditorData = trimEditorData(savedEditorData, trimValue);

      if (trimmedSavedEditorData) {
        try {
          setResultData(formatJsonData(trimmedSavedEditorData));
          setInputLanguage("json");
          setCompressionType("json");
        } catch {
          setResultData("");
        }
      } else {
        setResultData("");
      }
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
    setResultData("");
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
            {Object.keys(tabData).length ? null : (
              <>
                <div className="bookmark-message">
                  Kindly save to bookmarks bar for future access to this tool.
                </div>
                <button
                  onClick={() => {
                    const isMac = navigator.platform
                      .toUpperCase()
                      .includes("MAC");
                    alert(
                      `To bookmark this page, press ${isMac ? "⌘ + D" : "Ctrl + D"}`,
                    );
                  }}
                >
                  ⭐ Add to Bookmarks
                </button>
              </>
            )}

            <div>
              <span
                className="menu-toggle"
                onClick={() => updateContainerMode("B")}
              >
                <LuMenu />
              </span>
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
              height: `calc(100vh - ${
                containerViewMode === "H"
                  ? headerContainerHeight
                  : footerContainerHeight
              }px)`,
              width: "100%",
            }}
            onDragFinished={(e) => {
              resetFindToolbarPosition(window.screen.width - e);
            }}
          >
            <div>
              <Editor
                height={`calc(100vh - ${
                  containerViewMode === "H"
                    ? headerContainerHeight
                    : footerContainerHeight
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
                height={`calc(100vh - ${
                  containerViewMode === "H"
                    ? headerContainerHeight
                    : footerContainerHeight
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
              <div
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
              </div>

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
                      <div style={{ margin: "4px 4px 2px 4px" }}>
                        <Button
                          title="Paste"
                          onClick={(e) => onClickPaste(e)}
                          icon={<MdOutlineContentPaste size={40} />}
                        />
                      </div>
                      <div style={{ margin: "4px 4px 2px 4px" }}>
                        <Button
                          title="Clear"
                          onClick={clear}
                          icon={<AiOutlineDelete size={10} />}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ margin: "4px 4px 2px 4px" }}>
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
                    <div style={{ margin: "4px 4px 2px 4px" }}>
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
                        color: darkTheme ? "grey" : "#FDB813",
                        fontSize: "22px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setTheme(false);
                      }}
                    >
                      &#9728;
                    </div>

                    <div style={{ margin: "0px 5px", height: "24px" }}>
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
                      color={darkTheme ? "#FDB813" : "grey"}
                      fontSize={20}
                      onClick={() => {
                        setTheme(true);
                      }}
                    />
                  </div>
                </div>

                {
                  <div
                    style={{
                      display: "flex",
                      marginTop: "2px",
                      gap: "10px",
                      height: "28px",
                      display: "flex",
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
                          download("result.txt", tempEditorData || editorData);
                        }}
                        icon={<IoMdDownload />}
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
                        marginLeft: "2px",
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
                }
                {!sId && (
                  <div
                    style={{ display: "flex", marginTop: "2px", gap: "15px" }}
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
                      <div style={{ color: "white", fontSize: "14px" }}>
                        <span style={{fontSize:"12px"}}>HISTORY</span> : &nbsp;
                      </div>

                      <div
                        style={{
                          display: "flex",
                          minWidth: "300px",
                          maxWidth: "300px",
                          overflowX: "scroll",
                          border: "1px solid grey",
                          padding: "2px",
                          borderRadius: "4px",
                          position: "relative",
                        }}
                        id="myDivId"
                      >
                        {Object.keys(tabData).length < 1 && (
                          <div style={{ color: "lightgray" }}>Empty</div>
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

        {containerViewMode === "H" && (
          <div style={{ height: "20px", backgroundColor: "#505050" }}></div>
        )}
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
