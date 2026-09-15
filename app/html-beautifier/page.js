"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import SplitPane from "react-split-pane";
import Switch from "react-switch";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdClose, IoMdMoon, IoMdDownload } from "react-icons/io";
import { MdHistory, MdOutlineContentPaste } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch, IoCopyOutline } from "react-icons/io5";
import { LuMoveHorizontal } from "react-icons/lu";
import Link from "next/link";
import Menu from "@/Components/Menu";
import Button from "@/Components/Buttons/Button";

const headerContainerHeight = 70;
const footerContainerHeight = 80;

const THEME_STORAGE_KEY = "html-beautifier-theme";
const HISTORY_STORAGE_KEY = "html-beautifier-history";

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

/*
 * Elements that never get a closing tag / nested content,
 * so they should never increase the indent level.
 */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/*
 * Elements whose inner content should be left untouched
 * (raw text elements) rather than re-indented line by line.
 */
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "pre", "textarea"]);

/*
 * Lightweight, dependency-free HTML beautifier.
 *
 * Tokenizes the markup into tags / comments / text nodes and
 * re-indents them according to nesting depth. It intentionally
 * does not rewrite attribute order or reflow text, it only
 * fixes indentation and line breaks — good enough for making
 * minified or poorly formatted HTML readable.
 */
function beautifyHtmlString(html, indentSize = 2) {
  const indentUnit = " ".repeat(indentSize);

  const tokens =
    html.match(/<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[^>]+>|[^<]+/gi) || [];

  let output = "";
  let level = 0;
  let rawTextTag = null;
  let rawTextBuffer = "";

  const writeLine = (text, depth) => {
    output += `${indentUnit.repeat(Math.max(depth, 0))}${text}\n`;
  };

  tokens.forEach((rawToken) => {
    // While inside <script>/<style>/<pre>/<textarea>, pass content through
    // verbatim until we hit the matching closing tag.
    if (rawTextTag) {
      const closeMatch = rawToken.match(/^<\/([a-zA-Z0-9-]+)\s*>$/);

      if (closeMatch && closeMatch[1].toLowerCase() === rawTextTag) {
        if (rawTextBuffer.trim()) {
          rawTextBuffer
            .replace(/\r\n/g, "\n")
            .split("\n")
            .forEach((line) => {
              if (line.trim()) {
                writeLine(line.trim(), level + 1);
              }
            });
        }

        rawTextTag = null;
        rawTextBuffer = "";

        level = Math.max(level - 1, 0);
        writeLine(rawToken.trim(), level);
        return;
      }

      rawTextBuffer += rawToken;
      return;
    }

    const token = rawToken.trim();
    if (!token) return;

    if (token.startsWith("<!--") || token.startsWith("<!DOCTYPE") || token.startsWith("<!doctype")) {
      writeLine(token, level);
      return;
    }

    if (token.startsWith("</")) {
      level = Math.max(level - 1, 0);
      writeLine(token, level);
      return;
    }

    if (token.startsWith("<")) {
      const tagNameMatch = token.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : "";
      const isSelfClosing =
        token.endsWith("/>") || VOID_ELEMENTS.has(tagName);

      writeLine(token, level);

      if (RAW_TEXT_ELEMENTS.has(tagName) && !isSelfClosing) {
        rawTextTag = tagName;
        rawTextBuffer = "";
        level += 1;
        return;
      }

      if (!isSelfClosing) {
        level += 1;
      }

      return;
    }

    // Plain text node between tags
    writeLine(token, level);
  });

  return output.trim();
}

/*
 * Read the saved theme synchronously (client only).
 * Used as the useState initializer so there is no
 * "light, then flip to dark" render in between.
 */
function getStoredIsDark() {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  } catch {
    return false;
  }
}

/*
 * Define the two Monaco themes once, before either
 * editor mounts, so the `theme` prop is correct on the
 * very first paint instead of being switched afterward.
 */
function defineEditorThemes(monacoInstance) {
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
}

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
  height: calc(100vh - ${headerContainerHeight + footerContainerHeight - 20}px);
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
  border: 1px solid ${(p) => (p.$primary ? "#0f9d78" : "#e2e8f0")};
  background: ${(p) => (p.$primary ? "#0f9d78" : "#ffffff")};
  color: ${(p) => (p.$primary ? "#ffffff" : "#334155")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

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

  /*
   * Lazy initializer runs once, synchronously, before the
   * first paint on the client — this is what prevents the
   * "light theme flashes then flips to dark" flicker.
   * (Server render still returns false; see the note below
   * the component for the hydration tradeoff.)
   */
  const [darkTheme, setDarkTheme] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const skipAutoHistoryForInputRef = useRef(null);

  const [editor, setEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);

  const [copyResButtonTitle, setCopyResButtonTitle] = useState("Copy");

  /*
   * Apply the saved theme in a layout effect, which runs
   * synchronously before the browser paints — unlike a
   * regular effect, this avoids an extra visible frame at
   * the wrong theme.
   */
  useLayoutEffect(() => {
    setDarkTheme(getStoredIsDark());
  }, []);

  /*
   * Beautify / format HTML.
   *
   * Unlike JSON, HTML doesn't have a single strict grammar
   * that either "parses" or throws, so instead of validating
   * with a parser we tokenize the markup ourselves and
   * re-indent it based on tag nesting. A best-effort mismatched
   * tag check is done so obviously broken markup still surfaces
   * an error instead of silently producing garbled output.
   */
  const beautifyHtml = (htmlString, { shouldSaveHistory = true } = {}) => {
    if (!htmlString || !htmlString.trim()) {
      setResultData("");
      setError("");
      return;
    }

    try {
      setError("");

      const openTags = [];
      const tagTokens = htmlString.match(/<\/?[a-zA-Z][a-zA-Z0-9-]*[^>]*>/g) || [];

      tagTokens.forEach((tag) => {
        const isClosing = tag.startsWith("</");
        const isSelfClosing = tag.endsWith("/>");
        const nameMatch = tag.match(/^<\/?([a-zA-Z0-9-]+)/);
        const name = nameMatch ? nameMatch[1].toLowerCase() : "";

        if (!name || isSelfClosing || VOID_ELEMENTS.has(name)) return;

        if (isClosing) {
          const lastOpen = openTags.pop();

          if (lastOpen !== name) {
            throw new Error(
              `Mismatched tag: expected </${lastOpen || "?"}> but found </${name}>.`
            );
          }
        } else {
          openTags.push(name);
        }
      });

      if (openTags.length) {
        throw new Error(`Unclosed tag: <${openTags[openTags.length - 1]}>.`);
      }

      const beautifiedHtml = beautifyHtmlString(htmlString);

      setResultData(beautifiedHtml);

      if (shouldSaveHistory) {
        saveToHistory(htmlString, beautifiedHtml);
      }
    } catch (err) {
      setResultData("");

      setError(err?.message || "Unable to format this HTML. Please check the markup.");
    }
  };

  /*
   * Save conversion history.
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
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  /*
   * Load saved history.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);

      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  /*
   * Paste HTML.
   */
  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        skipAutoHistoryForInputRef.current = text;
        setEditorData(text);
        beautifyHtml(text);
      }
    } catch {
      setError("Unable to read clipboard.");
    }
  };

  /*
   * Upload HTML file.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      const text = await file.text();

      if (!text.trim()) {
        throw new Error("The selected HTML file is empty.");
      }

      skipAutoHistoryForInputRef.current = text;
      setEditorData(text);
      beautifyHtml(text);
    } catch (err) {
      setResultData("");

      setError(err?.message || "Unable to read the selected HTML file.");
    }

    event.target.value = "";
  };

  /*
   * Clear editor.
   */
  const clear = () => {
    setEditorData("");
    setResultData("");
    setError("");
  };

  /*
   * Download formatted HTML.
   */
  const download = (filename, text) => {
    if (!text) return;

    const blob = new Blob([text], {
      type: "text/html;charset=utf-8;",
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
   * Copy status.
   */
  useEffect(() => {
    if (copyResButtonTitle === "Copy") {
      return;
    }

    const timer = setTimeout(() => {
      setCopyResButtonTitle("Copy");
    }, 2000);

    return () => clearTimeout(timer);
  }, [copyResButtonTitle]);

  /*
   * Automatically beautify HTML.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setResultData("");
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      const shouldSaveHistory =
        skipAutoHistoryForInputRef.current !== editorData;

      skipAutoHistoryForInputRef.current = null;

      beautifyHtml(editorData, { shouldSaveHistory });
    }, 500);

    return () => clearTimeout(timer);
  }, [editorData]);

  /*
   * Theme toggle (triggered by the switch/icons in the header).
   * Themes were already defined in `beforeMount`, so this just
   * flips which one is active — same call as before, no change
   * needed here.
   */
  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(isDark ? "myThemeDark" : "myThemeLight");
    }

    setDarkTheme(isDark);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {}
  };

  /*
   * Monaco mount — themes are already defined by `beforeMount`
   * and the correct one is already active via the `theme` prop,
   * so this only needs to capture the instances.
   */
  const onMountResultEditor = (editorInstance, monacoInstance) => {
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
   * Delete history.
   */
  const deleteHistory = (id) => {
    setHistory((previous) => {
      const updated = previous.filter((item) => item.id !== id);

      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  const activeThemeName = darkTheme ? "myThemeDark" : "myThemeLight";

  /*
   * Placeholder shown while Monaco's script/worker is loading.
   * Matching the current theme's background instead of leaving
   * it blank (`loading={null}`) removes the last visible seam.
   */
  const editorLoadingPlaceholder = (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: darkTheme ? "#1e1e1e" : "#ffffff",
      }}
    />
  );

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
            <h1 className="brand-title">HTML Beautifier</h1>
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
                  cursor: "pointer",
                }}
                onClick={() => setFontSize(fontSize + 1)}
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
                  color: darkTheme ? "grey" : "#FDB813",
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
                color={darkTheme ? "#FDB813" : "grey"}
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
                headerContainerHeight + footerContainerHeight - 20
              }px)`,
              width: "100%",
              borderLeft: "14px solid #adddd7",
              borderRight: "14px solid #adddd7",
              borderBottom: "14px solid #adddd7",
              boxShadow: "0 0 10px #5eead4",
            }}
          >
            {/* HTML INPUT */}

            <div
              style={{
                position: "relative",
              }}
            >
              <Editor
                loading={editorLoadingPlaceholder}
                height={`calc(100vh - ${
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                theme={activeThemeName}
                beforeMount={defineEditorThemes}
                path="file:///html-beautifier/input.html"
                value={editorData}
                onChange={(value) => {
                  setEditorData(value || "");
                }}
                language="html"
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
                  renderLineHighlight: "none",
                  isWholeLine: true,
                }}
              />
            </div>

            {/* BEAUTIFIED HTML OUTPUT */}

            <div
              style={{
                position: "relative",
              }}
            >
              <Editor
                loading={editorLoadingPlaceholder}
                height={`calc(100vh - ${
                  headerContainerHeight + footerContainerHeight - 20
                }px)`}
                width="100%"
                theme={activeThemeName}
                beforeMount={defineEditorThemes}
                path="file:///html-beautifier/result.html"
                value={resultData || ""}
                onMount={onMountResultEditor}
                language="html"
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
                  renderLineHighlight: "none",
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
                    padding: "10px 12px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
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
              borderTop: "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f1f5f9",
                width: "100%",
              }}
            >
              <ToolBar>
                {/* PASTE */}

                <ToolBtn onClick={onClickPaste}>
                  <MdOutlineContentPaste />
                  Paste
                </ToolBtn>

                {/* UPLOAD */}

                <label
                  style={{
                    display: "inline-flex",
                  }}
                >
                  <input
                    type="file"
                    accept=".html,.htm,text/html"
                    onChange={handleFileUpload}
                    style={{
                      display: "none",
                    }}
                  />

                  <ToolBtn
                    as="span"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <IoMdDownload
                      style={{
                        transform: "rotate(180deg)",
                      }}
                    />
                    Upload HTML
                  </ToolBtn>
                </label>

                {/* CLEAR */}

                <ToolBtn onClick={clear}>
                  <AiOutlineDelete />
                  Clear
                </ToolBtn>

                {/* HISTORY */}

                <ToolBtn onClick={() => setIsHistoryOpen(true)}>
                  <MdHistory />
                  History
                </ToolBtn>

                {/* DOWNLOAD */}

                <ToolBtn
                  onClick={() => download("beautified.html", resultData)}
                  disabled={!resultData}
                >
                  <IoMdDownload />
                  Download
                </ToolBtn>

                {/* PASTE RESULT */}

                <ToolBtn
                  onClick={() => {
                    if (resultData) {
                      setEditorData(resultData);
                    }
                  }}
                  disabled={!resultData}
                >
                  <LuMoveHorizontal />
                  Paste Result
                </ToolBtn>

                <ToolRight>
                  {/* DOWNLOAD RESULT */}

                  <ToolBtn
                    onClick={() => download("beautified.html", resultData)}
                    disabled={!resultData}
                  >
                    <IoMdDownload />
                    Download Result
                  </ToolBtn>

                  {/* COPY */}

                  <CopyToClipboard
                    text={resultData || ""}
                    onCopy={() => setCopyResButtonTitle("Copied")}
                  >
                    <ToolBtn disabled={!resultData}>
                      <IoCopyOutline />
                      {copyResButtonTitle}
                    </ToolBtn>
                  </CopyToClipboard>

                  <ToolDivider />

                  {/* SEARCH */}

                  <ToolBtn onClick={findWord}>
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
        </BottomContainer>

        {/* HISTORY */}

        {isHistoryOpen && (
          <HistoryOverlay
            role="presentation"
            onClick={() => setIsHistoryOpen(false)}
          >
            <HistoryModal
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <HistoryModalHeader>
                <h2>HTML Beautifier History</h2>

                <button
                  type="button"
                  aria-label="Close history"
                  onClick={() => setIsHistoryOpen(false)}
                >
                  <IoMdClose />
                </button>
              </HistoryModalHeader>

              <HistoryCards>
                {history.length === 0 && (
                  <div
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    No saved history
                  </div>
                )}

                {history.map((item) => (
                  <HistoryCard key={item.id}>
                    <div
                      className="card-content"
                      title={item.input}
                      onClick={() => restoreHistory(item)}
                    >
                      <span className="timestamp">{item.time}</span>

                      <span className="preview">
                        Input: {item.input.substring(0, 150)}
                      </span>

                      <span className="preview">
                        Beautified: {item.output.substring(0, 300)}
                      </span>
                    </div>

                    <button
                      className="card-delete"
                      type="button"
                      onClick={() => deleteHistory(item.id)}
                    >
                      Delete
                    </button>
                  </HistoryCard>
                ))}
              </HistoryCards>
            </HistoryModal>
          </HistoryOverlay>
        )}

        {/* SEO CONTENT */}

        <HomeSeoSection>
          <div className="content">
            <h2>Free Online HTML Beautifier</h2>

            <p>
              HTML Beautifier is a free online tool that formats HTML markup
              into a clean, readable, and properly indented structure.
            </p>

            <p>
              Paste HTML into the input editor or upload an HTML file to
              instantly format and re-indent your markup.
            </p>

            <div className="link-row">
              {HOME_NAV_LINKS.map(({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>

            <h3>Why use this HTML Beautifier?</h3>

            <ul>
              <li>Beautify HTML instantly in your browser.</li>

              <li>Format compact or minified HTML into readable markup.</li>

              <li>Catch obviously mismatched or unclosed tags.</li>

              <li>Upload HTML files directly from your computer.</li>

              <li>Add indentation and line breaks automatically.</li>

              <li>Copy or download formatted HTML.</li>

              <li>View HTML clearly in a powerful code editor.</li>

              <li>Process HTML directly in your browser.</li>
            </ul>

            <h3>Common Questions</h3>

            <h4>What is an HTML Beautifier?</h4>

            <p>
              An HTML Beautifier formats HTML markup with indentation, line
              breaks, and spacing so that the structure of a page is easier to
              read and understand.
            </p>

            <h4>How do I beautify HTML?</h4>

            <p>
              Paste your HTML into the input editor or upload an HTML file.
              The HTML Beautifier automatically re-indents the markup and
              generates a formatted version.
            </p>

            <h4>Can I beautify minified HTML?</h4>

            <p>
              Yes. Minified HTML can be pasted into the input editor and
              automatically converted into properly indented and readable
              markup.
            </p>

            <h4>Does HTML Beautifier check for errors?</h4>

            <p>
              It performs a best-effort check for obviously mismatched or
              unclosed tags. If a problem is found, an error message is shown
              instead of producing broken output.
            </p>

            <h4>Is this HTML Beautifier free?</h4>

            <p>
              Yes. This HTML Beautifier is free to use online and processes
              your HTML directly in your browser.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;
