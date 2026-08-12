"use client"
import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
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
import Seo, { SITE_NAME, SITE_URL } from "../Components/Seo";

const headerContainerHeight = 70;
const footerContainerHeight = 104;

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
  const seoTitle = sId
    ? "Shared JSON Viewer | JSON Prettier"
    : "JSON Formatter & Pretty Print Online | JSON Viewer";
  const seoDescription = sId
    ? "View a shared JSON payload in a clean formatter and editor."
    : "Format, prettify, validate, and inspect JSON online with a split-view JSON editor and viewer.";
  const seoKeywords =
    "json formatter, json pretty print, json viewer, json beautifier, json parser, format json online, validate json";
  const seoPath = sId ? `/${sId}` : "/";
  const seoStructuredData = sId
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seoTitle,
        description: seoDescription,
        url: `${SITE_URL}${seoPath}`,
      }
    : [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: seoDescription,
        },
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          url: SITE_URL,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          description: seoDescription,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What does JSON Prettier do?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It formats raw JSON into readable, indented output and lets you inspect the result in a split-view editor.",
              },
            },
            {
              "@type": "Question",
              name: "Can I validate JSON before using it in an API or app?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Invalid JSON will fail to parse, which makes it easier to catch malformed payloads before you use them elsewhere.",
              },
            },
            {
              "@type": "Question",
              name: "Is the JSON formatter free to use?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. JSON Prettier is available as a free online JSON formatter and viewer.",
              },
            },
          ],
        },
      ];

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

  const [resultData, setResultData] = useState();

  const [compressionType, setCompressionType] = useState("text");

  const [editor, setEditor] = useState();
  const [monaco, setMonaco] = useState();

  const [trimValue, setTrimValue] = TrimValueState();
  const [findValue, setFindValue] = useState("");

  const [shareId, setShareId] = useState("");

  const [containerViewMode, setContainerViewMode] = useState("H");

  const updateContainerMode = (mode) => {
    setContainerViewMode(mode);
    saveContainerMode(mode);
  };

  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    if (!sId) {
      setEditorData(getHistory());
    }
    setContainerViewMode(getContainerMode());
    setDarkTheme(getMode());
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

  const [result, setResult] = useState();

  const handleEval = (input) => {
    try {
      const evaluatedResult = eval(input);
    } catch (error) {
      throw new Error();
    }
  };

  useEffect(() => {
    if (result) {
      setResultData(() => JSON.stringify(result, null, 2));
    }
  }, [result]);

  const [inputLanguage, setInputLanguage] = useState("");

  const prettifyOnChange = (data, isDecompressed) => {
    try {
      setResultData(JSON.stringify(JSON.parse(data), null, 2));

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
        handleEval("setResult(" + compressedData + ")");
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

  useEffect(() => {
    const handler = setTimeout(() => {
      prettifyOnChange(trim(editorData), false);
      if (editorData && isPasting) {
        setNewData(editorData);
        setIsPasting(false);
      }

      if (!sId) {
        saveHistory(editorData);
      }
    }, [500]);

    return () => {
      clearTimeout(handler);
    };
  }, [editorData]);

  const trim = () => {
    editorData?.trim();
    if (trimValue) {
      if (
        editorData?.substring(
          editorData.length - trimValue.length,
          editorData.length,
        ) === trimValue
      ) {
        let str =
          editorData?.substring(0, editorData.length - trimValue.length) || "";
        return str;
      }
    }
    return editorData;
  };

  const onClickTrim = () => {
    prettifyOnChange(trim(editorData), false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      onClickTrim();
    }, [500]);

    return () => {
      clearTimeout(handler);
    };
  }, [trimValue]);

  const clear = () => {
    setEditorData("");
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
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        path={seoPath}
        noindex={Boolean(sId)}
        structuredData={seoStructuredData}
      />
      <main style={{ minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
        {
          <HeaderContainer $show={containerViewMode === "H"}>
            <h1 style={{ fontSize: "24px", fontWeight: "500" }}>
              JSON Viewer{" "}
            </h1>
            {Object.keys(tabData).length ? null : (
              <div
                style={{
                  marginLeft: "-310px",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                Kindly save to bookmarks bar for future access to this tool.
              </div>
            )}
            <div>
              <span
                style={{ cursor: "pointer" }}
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
                value={tempEditorData || editorData}
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
                  setEditorData(data);
                }}
                options={{
                  minimap: { enabled: false },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    // vertical: "hidden",
                    handleMouseWheel: true,
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
                value={resultData}
                onMount={onMountResultEditor}
                language="json"
                options={{
                  minimap: { enabled: false },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    // vertical: "hidden",
                    handleMouseWheel: true,
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
                        />
                      </div>
                      <div style={{ margin: "4px 4px 2px 4px" }}>
                        <Button title="Clear" onClick={clear} />
                      </div>
                    </>
                  )}

                  <div style={{ margin: "4px 4px 2px 4px" }}>
                    <Button title="Search" onClick={findWord} />
                  </div>

                  <CopyToClipboard
                    text={resultData}
                    onCopy={() => {
                      setCopyResButtonTitle("Copied");
                    }}
                  >
                    <div style={{ margin: "4px 4px 2px 4px" }}>
                      <Button title={copyResButtonTitle} />
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
                        SAVED : &nbsp;
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
              <h2>Online JSON formatter, viewer, and pretty printer</h2>
              <p>
                JSON Prettier helps you format JSON, inspect nested objects, and
                clean up API payloads in a browser-based split editor. Paste
                minified JSON on the left and review readable output on the
                right.
              </p>
              <p>
                The tool is useful for debugging API responses, checking JSON
                structure before storing data, and turning compressed payloads
                into readable text during development.
              </p>

              <h3>Why developers use this JSON viewer</h3>
              <ul>
                <li>Pretty print raw JSON into a readable structure.</li>
                <li>Inspect nested arrays and objects side by side.</li>
                <li>
                  Copy, paste, search, download, and adjust editor font size.
                </li>
                <li>Work with formatted JSON directly in the browser.</li>
              </ul>

              <h3>Common questions</h3>
              <p>
                Use this tool when you need a fast JSON formatter for API
                testing, debugging, or quick validation before moving data into
                your application. For more context about the format itself, see{" "}
                
              </p>

              
            </div>
          </HomeSeoSection>
        )}
      </main>
    </>
  );
}

export default App;
