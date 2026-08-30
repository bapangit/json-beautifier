"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { css, styled } from "styled-components";
import SplitPane from "react-split-pane";
import Button from "../../Components/Buttons/Button";
import {
  TrimValueState,
  decompress,
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
import { IoMdClose } from "react-icons/io";
import SavedTabData from "../../Components/CustomStates/SavedTabData";
import { IoMdMoon } from "react-icons/io";
import { HOME_JSON_LD } from "../seo";

const JSON_TO_XML_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON to XML Converter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires modern web browser",
  description:
    "Free online JSON to XML converter that transforms JSON data into XML markup with a split editor and instant conversion results.",
  url: "https://www.json-beautifier.net/json-to-xml",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Convert JSON to XML",
    "Paste JSON and generate XML instantly",
    "Copy and download converted XML",
    "Validate and inspect converted output",
    "Works in any browser",
  ],
};
import Link from "next/link";
import { MdOutlineContentPaste,MdHistory  } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { LuMoveHorizontal } from "react-icons/lu";
import Menu from "../../Components/Menu";
import { useBookmarkStatus } from "@/Components/CustomStates/CheckBookmark";

const headerContainerHeight = 70;
const footerContainerHeight = 80  ;
const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  // { href: "/json-to-xml", label: "JSON to XML" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ---------- JSON -> XML helpers ---------- */

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Sanitize a JS object key so it becomes a valid XML tag name
const sanitizeTagName = (name) => {
  const cleaned = String(name).replace(/[^a-zA-Z0-9_\-.]/g, "_");
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
};

const jsonNodeToXml = (value, nodeName, indent) => {
  const pad = "  ".repeat(indent);
  const tag = sanitizeTagName(nodeName);

  if (value === null || value === undefined) {
    return `${pad}<${tag}/>`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${pad}<${tag}/>`;
    }
    return value.map((item) => jsonNodeToXml(item, tag, indent)).join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${pad}<${tag}/>`;
    }
    const inner = entries
      .map(([key, val]) => {
        if (Array.isArray(val)) {
          if (val.length === 0) {
            return `${pad}  <${sanitizeTagName(key)}/>`;
          }
          return val
            .map((item) => jsonNodeToXml(item, key, indent + 1))
            .join("\n");
        }
        return jsonNodeToXml(val, key, indent + 1);
      })
      .join("\n");
    return `${pad}<${tag}>\n${inner}\n${pad}</${tag}>`;
  }

  // primitive: string / number / boolean
  return `${pad}<${tag}>${escapeXml(value)}</${tag}>`;
};

const formatXmlData = (data) => {
  const parsed = JSON.parse(data);
  const rootName = Array.isArray(parsed)
    ? "root"
    : parsed && typeof parsed === "object"
      ? "root"
      : "root";
  const body = jsonNodeToXml(parsed, rootName, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
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
  display: flex;
  flex-direction: column;
  background: #eef4f8;
  border-top: 1px solid #d6e0e8;
  z-index: 100;
  box-sizing: border-box;

  .footer-toolbar {
    height: 68px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    box-sizing: border-box;
    gap: 10px;
  }

  .footer-left,
  .footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .footer-right {
    margin-left: auto;
  }

  .footer-divider {
    width: 1px;
    height: 30px;
    background: #d3dce5;
    margin: 0 3px;
  }

  .footer-nav {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 16px;
    box-sizing: border-box;
    background: #e6edf2;
    border-top: 1px solid #d3dce5;
  }

  .menu-item {
    color: #183b56;
    font-size: 16px;
    font-weight: 400;
    text-decoration: none;
    padding: 0 8px;
    white-space: nowrap;
    cursor: pointer;
  }

  .menu-item:hover {
    text-decoration: underline;
    color: #0f766e;
  }

  @media (max-width: 900px) {
    .footer-toolbar {
      overflow-x: auto;
      justify-content: flex-start;
    }

    .footer-right {
      margin-left: 0;
    }

    .footer-nav {
      overflow-x: auto;
      justify-content: flex-start;
    }
  }

  @media (max-width: 600px) {
    .footer-toolbar {
      padding: 5px 8px;
      gap: 6px;
    }

    .footer-left,
    .footer-right {
      gap: 6px;
    }

    .menu-item {
      font-size: 13px;
      padding: 0 5px;
    }
  }
`;

const FooterButton = styled.button`
  height: 52px;
  min-width: 110px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 0 16px;

  border: 1px solid #d7e1eb;
  border-radius: 10px;

  background: #ffffff;
  color: #183b56;

  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
  white-space: nowrap;

  box-sizing: border-box;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.1s ease;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #c3d0dc;
    box-shadow: 0 2px 5px rgba(15, 38, 48, 0.06);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #f4f6f8;
    color: #9aa7b7;
    border-color: #e0e6ec;
    cursor: not-allowed;
  }

  svg {
    font-size: 20px;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    min-width: auto;
    height: 46px;
    padding: 0 13px;
    font-size: 16px;

    svg {
      font-size: 18px;
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
      setResultData(formatXmlData(JSON.stringify(evaluatedResult)));
    } catch (error) {
      throw new Error();
    }
  };

  const prettifyOnChange = (data, isDecompressed) => {
    try {
      setResultData(formatXmlData(data));

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_TO_XML_SCHEMA),
        }}
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
              <h1 className="brand-title">JSON to XML Converter</h1>
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
        }
        <TopContainer mode={containerViewMode}>
          <SplitPane
            minSize={100}
            maxSize={800}
            defaultSize="50%"
            split="vertical"
            style={{
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
                height={`calc(100vh - ${
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                theme="vs-dark"
                path="file:///json-to-xml/input.json"
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
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                width="100%"
                theme="vs-dark"
                path="file:///json-to-xml/result.xml"
                value={resultData || ""}
                onMount={onMountResultEditor}
                language="xml"
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

        <BottomContainer>
          <div className="footer-toolbar">
            {/* LEFT BUTTONS */}
            <div className="footer-left">
              {!sId && (
                <>
                  {/* Paste */}
                  <FooterButton
                    type="button"
                    onClick={onClickPaste}
                    title="Paste"
                  >
                    <MdOutlineContentPaste />
                    Paste
                  </FooterButton>

                  {/* Clear */}
                  <FooterButton type="button" onClick={clear} title="Clear">
                    <AiOutlineDelete />
                    Clear
                  </FooterButton>

                  {/* History */}
                  <FooterButton
                    type="button"
                    onClick={() => {
                      // Your existing history functionality
                      // should remain here.
                    }}
                    title="History"
                  >
                    <MdHistory />
                    History
                  </FooterButton>
                </>
              )}

              {/* Download */}
              <FooterButton
                type="button"
                onClick={() => {
                  download("result.txt", tempEditorData || editorData);
                }}
                disabled={!editorData && !tempEditorData}
                title="Download"
              >
                <IoMdDownload />
                Download
              </FooterButton>

              {/* Paste Result */}
              <FooterButton
                type="button"
                onClick={() => {
                  if (resultData) {
                    setEditorData(resultData);
                    setNewData(resultData);
                  }
                }}
                disabled={!resultData}
                title="Paste Result"
              >
                <LuMoveHorizontal />
                Paste Result
              </FooterButton>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="footer-right">
              {/* Download Result */}
              <FooterButton
                type="button"
                onClick={() => {
                  download("result.txt", resultData);
                }}
                disabled={!resultData}
                title="Download Result"
              >
                <IoMdDownload />
                Download Result
              </FooterButton>

              {/* Copy */}
              <CopyToClipboard
                text={resultData || ""}
                onCopy={() => {
                  setCopyResButtonTitle("Copied");
                }}
              >
                <FooterButton type="button" disabled={!resultData} title="Copy">
                  <IoCopyOutline />
                  {copyResButtonTitle}
                </FooterButton>
              </CopyToClipboard>

              {/* Divider */}
              <div className="footer-divider" />

              {/* Search */}
              <FooterButton type="button" onClick={findWord} title="Search">
                <IoSearch />
                Search
              </FooterButton>
            </div>
          </div>

          {/* FOOTER NAVIGATION */}
          {!sId && (
            <div className="footer-nav">
              {HOME_NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="menu-item">
                  {label}
                </Link>
              ))}
            </div>
          )}
        </BottomContainer>

        {!sId && (
          <HomeSeoSection>
            <div className="content">
              <h2>Online JSON to XML converter</h2>
              <p>
                JSON to XML Converter turns raw JSON into readable, nested XML
                markup in a browser-based split editor. Paste JSON on the left
                and review the generated XML on the right.
              </p>
              <p>
                The tool is useful for converting API payloads for legacy
                systems, generating XML feeds from JSON data, and checking JSON
                structure before it gets consumed downstream.
              </p>
              <div className="link-row">
                {HOME_NAV_LINKS.map(({ href, label }) => (
                  <Link href={href} key={href}>
                    {label}
                  </Link>
                ))}
              </div>

              <h3>Why developers use JSON to XML Converter</h3>
              <ul>
                <li>Convert JSON objects and arrays into nested XML.</li>
                <li>Inspect the generated XML tree side by side.</li>
                <li>
                  Copy, paste, search, download, and adjust editor font size.
                </li>
                <li>Work with the converted XML directly in the browser.</li>
              </ul>

              <h3>Common questions</h3>
              <h4>What does JSON to XML Converter do?</h4>
              <p>
                It parses raw JSON and generates well-formed, indented XML
                markup that you can inspect in a split-view editor.
              </p>
              <h4>How are JSON arrays converted to XML?</h4>
              <p>
                Each item in an array is repeated as a sibling element using the
                same tag name as its parent key.
              </p>
              <h4>Is JSON to XML Converter free to use?</h4>
              <p>
                Yes. JSON to XML Converter is a free online JSON to XML
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
