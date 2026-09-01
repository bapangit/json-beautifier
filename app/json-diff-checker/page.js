"use client";

import { DiffEditor } from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import Switch from "react-switch";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdClose, IoMdMoon, IoMdDownload } from "react-icons/io";
import { MdHistory, MdOutlineContentPaste } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearch, IoCopyOutline } from "react-icons/io5";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { TbLayoutColumns, TbLayoutRows } from "react-icons/tb";
import Link from "next/link";
import Menu from "@/Components/Menu";
import Button from "@/Components/Buttons/Button";

const headerContainerHeight = 70;
const footerContainerHeight = 80;

const THEME_STORAGE_KEY = "text-diff-checker-theme";
const HISTORY_STORAGE_KEY = "text-diff-checker-history";
const VIEW_STORAGE_KEY = "text-diff-checker-view";

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

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

function getStoredIsSideBySide() {
  if (typeof window === "undefined") return true;

  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === null ? true : saved === "side-by-side";
  } catch {
    return true;
  }
}

/*
 * Define the two Monaco themes once, before the diff
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
  position: relative;
`;

const ColumnLabels = styled.div`
  display: flex;
  width: 100%;
  border-left: 14px solid #adddd7;
  border-right: 14px solid #adddd7;
  background: #e8f3f2;
  color: #12343b;
  font-size: 13px;
  font-weight: 600;

  span {
    flex: 1;
    padding: 6px 12px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span:first-child {
    border-right: 1px solid #adddd7;
  }
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

const DiffStatusPill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: ${(p) => (p.$hasDiff ? "#fef3c7" : "#dcfce7")};
  color: ${(p) => (p.$hasDiff ? "#92400e" : "#166534")};
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

  .diff-count {
    display: inline-block;
    margin-top: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #0f766e;
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
    -webkit-line-clamp: 5;
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
  // Raw text typed/pasted into each side — no parsing or
  // validation is applied, this is a plain text comparison.
  const [originalData, setOriginalData] = useState("");
  const [modifiedData, setModifiedData] = useState("");

  /*
   * Lazy initializer runs once, synchronously, before the
   * first paint on the client — this is what prevents the
   * "light theme flashes then flips to dark" flicker.
   */
  const [darkTheme, setDarkTheme] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [sideBySide, setSideBySide] = useState(true);

  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [diffEditor, setDiffEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);
  const [diffStats, setDiffStats] = useState({ count: 0, computed: false });

  const [copyLeftTitle, setCopyLeftTitle] = useState("Copy Left");
  const [copyRightTitle, setCopyRightTitle] = useState("Copy Right");

  const isSyncingFromCode = useRef(false);

  /*
   * Apply the saved theme / view mode in a layout effect, which
   * runs synchronously before the browser paints — this avoids
   * an extra visible frame at the wrong theme.
   */
  useLayoutEffect(() => {
    setDarkTheme(getStoredIsDark());
    setSideBySide(getStoredIsSideBySide());
  }, []);

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
   * Save a diff session to history.
   */
  const saveToHistory = (original, modified, diffCount) => {
    if (!original || !modified) return;

    const item = {
      id: Date.now(),
      original,
      modified,
      diffCount,
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
   * Debounce recording comparisons to history so we're not
   * writing to storage on every keystroke.
   */
  useEffect(() => {
    if (!originalData || !modifiedData) return;

    const timer = setTimeout(() => {
      saveToHistory(originalData, modifiedData, diffStats.count);
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalData, modifiedData]);

  /*
   * Paste text into a given side.
   */
  const pasteInto = async (side) => {
    try {
      const text = await navigator.clipboard.readText();

      if (!text) return;

      if (side === "left") {
        setOriginalData(text);
      } else {
        setModifiedData(text);
      }
    } catch {
      // Clipboard read can fail (permissions); nothing else to do here.
    }
  };

  /*
   * Upload a text file into a given side.
   */
  const handleFileUpload = async (event, side) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();

      if (side === "left") {
        setOriginalData(text);
      } else {
        setModifiedData(text);
      }
    } catch {
      // Unable to read the file; leave the existing content untouched.
    }

    event.target.value = "";
  };

  /*
   * Swap the two sides.
   */
  const swapSides = () => {
    setOriginalData(modifiedData);
    setModifiedData(originalData);
  };

  /*
   * Clear both sides.
   */
  const clearAll = () => {
    setOriginalData("");
    setModifiedData("");
    setDiffStats({ count: 0, computed: false });
  };

  /*
   * Download a side's text.
   */
  const download = (filename, text) => {
    if (!text) return;

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8;",
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
   * Download a small report describing the comparison.
   */
  const downloadReport = () => {
    if (!originalData && !modifiedData) return;

    const report = [
      "Text Difference Report",
      `Generated: ${new Date().toLocaleString()}`,
      `Differences found: ${diffStats.count}`,
      "",
      "--- Left (Original) ---",
      originalData || "(empty)",
      "",
      "--- Right (Modified) ---",
      modifiedData || "(empty)",
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");

    element.href = url;
    element.download = "text-diff-report.txt";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    URL.revokeObjectURL(url);
  };

  /*
   * Copy status resets.
   */
  useEffect(() => {
    if (copyLeftTitle === "Copy Left") return;

    const timer = setTimeout(() => setCopyLeftTitle("Copy Left"), 2000);
    return () => clearTimeout(timer);
  }, [copyLeftTitle]);

  useEffect(() => {
    if (copyRightTitle === "Copy Right") return;

    const timer = setTimeout(() => setCopyRightTitle("Copy Right"), 2000);
    return () => clearTimeout(timer);
  }, [copyRightTitle]);

  /*
   * Theme toggle.
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
   * Toggle side-by-side vs inline diff rendering.
   */
  const toggleView = () => {
    setSideBySide((previous) => {
      const next = !previous;

      try {
        localStorage.setItem(VIEW_STORAGE_KEY, next ? "side-by-side" : "inline");
      } catch {}

      return next;
    });
  };

  /*
   * Diff editor mount — capture instances, wire the two panes
   * back into React state so typing directly in the editor still
   * drives the same state as Paste/Upload/History/Swap, and
   * subscribe to diff recomputation for the "X differences" pill.
   */
  const onMountDiffEditor = (diffEditorInstance, monacoInstance) => {
    setDiffEditor(diffEditorInstance);
    setMonaco(monacoInstance);

    const originalModelEditor = diffEditorInstance.getOriginalEditor();
    const modifiedModelEditor = diffEditorInstance.getModifiedEditor();

    originalModelEditor.onDidChangeModelContent(() => {
      if (isSyncingFromCode.current) return;
      setOriginalData(originalModelEditor.getValue());
    });

    modifiedModelEditor.onDidChangeModelContent(() => {
      if (isSyncingFromCode.current) return;
      setModifiedData(modifiedModelEditor.getValue());
    });

    diffEditorInstance.onDidUpdateDiff(() => {
      const changes = diffEditorInstance.getLineChanges() || [];
      setDiffStats({ count: changes.length, computed: true });
    });
  };

  /*
   * Search within the active (modified) pane.
   */
  const findWord = () => {
    if (diffEditor) {
      diffEditor.getModifiedEditor().getAction("actions.find")?.run();
    }
  };

  /*
   * Restore a saved comparison from history.
   */
  const restoreHistory = (item) => {
    isSyncingFromCode.current = true;

    setOriginalData(item.original);
    setModifiedData(item.modified);

    setIsHistoryOpen(false);

    setTimeout(() => {
      isSyncingFromCode.current = false;
    }, 0);
  };

  /*
   * Delete a saved comparison.
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
  const hasBothSides = Boolean(originalData) && Boolean(modifiedData);
  const hasDiff = diffStats.computed && diffStats.count > 0;

  /*
   * Placeholder shown while Monaco's script/worker is loading.
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
            <h1 className="brand-title">Text Difference Checker</h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* DIFF STATUS */}

            {hasBothSides && (
              <DiffStatusPill $hasDiff={hasDiff}>
                {diffStats.computed
                  ? hasDiff
                    ? `${diffStats.count} difference${diffStats.count === 1 ? "" : "s"}`
                    : "Identical"
                  : "Comparing…"}
              </DiffStatusPill>
            )}

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

        {/* DIFF EDITOR */}

        <TopContainer>
          <ColumnLabels>
            <span>Left (Original)</span>
            <span>Right (Modified)</span>
          </ColumnLabels>

          <DiffEditor
            loading={editorLoadingPlaceholder}
            height={`calc(100vh - ${
              headerContainerHeight + footerContainerHeight - 20
            }px)`}
            theme={activeThemeName}
            beforeMount={defineEditorThemes}
            original={originalData}
            modified={modifiedData}
            originalLanguage="plaintext"
            modifiedLanguage="plaintext"
            onMount={onMountDiffEditor}
            options={{
              originalEditable: true,
              readOnly: false,
              renderSideBySide: sideBySide,
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
            wrapperProps={{
              style: {
                borderLeft: "14px solid #adddd7",
                borderRight: "14px solid #adddd7",
                borderBottom: "14px solid #adddd7",
                boxShadow: "0 0 10px #5eead4",
              },
            }}
          />
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
                {/* PASTE LEFT */}

                <ToolBtn onClick={() => pasteInto("left")}>
                  <MdOutlineContentPaste />
                  Paste Left
                </ToolBtn>

                {/* UPLOAD LEFT */}

                <label style={{ display: "inline-flex" }}>
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.log,.json,.xml,.yml,.yaml,text/plain"
                    onChange={(event) => handleFileUpload(event, "left")}
                    style={{ display: "none" }}
                  />

                  <ToolBtn as="span" style={{ cursor: "pointer" }}>
                    <IoMdDownload style={{ transform: "rotate(180deg)" }} />
                    Upload Left
                  </ToolBtn>
                </label>

                <ToolDivider />

                {/* PASTE RIGHT */}

                <ToolBtn onClick={() => pasteInto("right")}>
                  <MdOutlineContentPaste />
                  Paste Right
                </ToolBtn>

                {/* UPLOAD RIGHT */}

                <label style={{ display: "inline-flex" }}>
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.log,.json,.xml,.yml,.yaml,text/plain"
                    onChange={(event) => handleFileUpload(event, "right")}
                    style={{ display: "none" }}
                  />

                  <ToolBtn as="span" style={{ cursor: "pointer" }}>
                    <IoMdDownload style={{ transform: "rotate(180deg)" }} />
                    Upload Right
                  </ToolBtn>
                </label>

                <ToolDivider />

                {/* SWAP */}

                <ToolBtn onClick={swapSides} title="Swap left and right">
                  <HiOutlineSwitchHorizontal />
                  Swap
                </ToolBtn>

                {/* CLEAR */}

                <ToolBtn onClick={clearAll}>
                  <AiOutlineDelete />
                  Clear
                </ToolBtn>

                {/* HISTORY */}

                <ToolBtn onClick={() => setIsHistoryOpen(true)}>
                  <MdHistory />
                  History
                </ToolBtn>

                <ToolRight>
                  {/* VIEW TOGGLE */}

                  <ToolBtn
                    onClick={toggleView}
                    title={sideBySide ? "Switch to inline view" : "Switch to side-by-side view"}
                  >
                    {sideBySide ? <TbLayoutRows /> : <TbLayoutColumns />}
                    {sideBySide ? "Inline" : "Side by Side"}
                  </ToolBtn>

                  {/* DOWNLOAD LEFT / RIGHT */}

                  <ToolBtn
                    onClick={() => download("left.txt", originalData)}
                    disabled={!originalData}
                  >
                    <IoMdDownload />
                    Left
                  </ToolBtn>

                  <ToolBtn
                    onClick={() => download("right.txt", modifiedData)}
                    disabled={!modifiedData}
                  >
                    <IoMdDownload />
                    Right
                  </ToolBtn>

                  {/* DOWNLOAD REPORT */}

                  <ToolBtn onClick={downloadReport} disabled={!hasBothSides}>
                    <IoMdDownload />
                    Report
                  </ToolBtn>

                  {/* COPY LEFT / RIGHT */}

                  <CopyToClipboard
                    text={originalData || ""}
                    onCopy={() => setCopyLeftTitle("Copied")}
                  >
                    <ToolBtn disabled={!originalData}>
                      <IoCopyOutline />
                      {copyLeftTitle}
                    </ToolBtn>
                  </CopyToClipboard>

                  <CopyToClipboard
                    text={modifiedData || ""}
                    onCopy={() => setCopyRightTitle("Copied")}
                  >
                    <ToolBtn disabled={!modifiedData}>
                      <IoCopyOutline />
                      {copyRightTitle}
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
                <h2>Text Diff History</h2>

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
                  <div style={{ color: "#94a3b8" }}>No saved history</div>
                )}

                {history.map((item) => (
                  <HistoryCard key={item.id}>
                    <div
                      className="card-content"
                      title={item.original}
                      onClick={() => restoreHistory(item)}
                    >
                      <span className="timestamp">{item.time}</span>

                      <span className="diff-count">
                        {item.diffCount > 0
                          ? `${item.diffCount} difference${item.diffCount === 1 ? "" : "s"}`
                          : "Identical"}
                      </span>

                      <span className="preview">
                        Left: {item.original.substring(0, 120)}
                      </span>

                      <span className="preview">
                        Right: {item.modified.substring(0, 120)}
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
            <h2>Free Online Text Difference Checker</h2>

            <p>
              Text Difference Checker is a free online tool that compares two
              blocks of text side by side and highlights exactly what was
              added, removed, or changed between them.
            </p>

            <p>
              Paste or upload two text files into the left and right editors
              to instantly see a line-by-line comparison.
            </p>

            <div className="link-row">
              {HOME_NAV_LINKS.map(({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>

            <h3>Why use this Text Diff Checker?</h3>

            <ul>
              <li>Compare any two pieces of text instantly in your browser.</li>

              <li>Highlight added, removed, and changed lines.</li>

              <li>Works with plain text, code, logs, CSV, or Markdown.</li>

              <li>Upload text files directly from your computer.</li>

              <li>Switch between side-by-side and inline diff views.</li>

              <li>Swap sides, copy, or download either document.</li>

              <li>Keep a history of recent comparisons.</li>

              <li>Process everything locally — nothing leaves your browser.</li>
            </ul>

            <h3>Common Questions</h3>

            <h4>What is a Text Difference Checker?</h4>

            <p>
              A Text Difference Checker compares two pieces of text and shows
              which lines were added, removed, or modified between them.
            </p>

            <h4>How do I compare two text files?</h4>

            <p>
              Paste or upload the first document into the left editor and the
              second into the right editor. The differences are highlighted
              automatically as you type or edit either side.
            </p>

            <h4>Can I compare code or log files?</h4>

            <p>
              Yes. Any plain text works, including source code, configuration
              files, CSV data, and log output.
            </p>

            <h4>Does it show how many differences were found?</h4>

            <p>
              Yes. A status indicator shows the number of differing line
              blocks, or confirms the two documents are identical.
            </p>

            <h4>Is this Text Diff Checker free?</h4>

            <p>
              Yes. This Text Difference Checker is free to use online and
              compares your text directly in your browser.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;
