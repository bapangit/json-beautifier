"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useState } from "react";
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

import brotliPromise from "brotli-wasm";

const headerContainerHeight = 70;
const footerContainerHeight = 80;

const THEME_STORAGE_KEY = "brotli-decompressor-theme";
const HISTORY_STORAGE_KEY = "brotli-decompressor-history";

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

/*
 * Read the saved theme synchronously (client only).
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
 * Define both Monaco themes once, before either editor
 * mounts, so the `theme` prop is correct on first paint
 * instead of being switched right after mount.
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
   * Starts false (SSR-safe); the useLayoutEffect below
   * corrects it before the browser paints, avoiding the
   * visible flash you were seeing.
   */
  const [darkTheme, setDarkTheme] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [editor, setEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);

  const [copyResButtonTitle, setCopyResButtonTitle] = useState("Copy");

  /*
   * Apply the saved theme before the browser paints —
   * useLayoutEffect (not useEffect) is what removes the
   * extra visible frame at the wrong theme.
   */
  useLayoutEffect(() => {
    setDarkTheme(getStoredIsDark());
  }, []);

  /*
   * Convert a Uint8Array to a readable text string.
   */
  const decodeText = (data) => {
    try {
      return new TextDecoder("utf-8", {
        fatal: false,
      }).decode(data);
    } catch {
      return new TextDecoder().decode(data);
    }
  };

  /*
   * Brotli decompression.
   *
   * The input is expected to be Base64 encoded Brotli data.
   */
  const decompressBrotli = async (base64Data) => {
    if (!base64Data || !base64Data.trim()) {
      setResultData("");
      setError("");
      return;
    }

    try {
      setError("");

      const brotli = await brotliPromise;

      /*
       * Remove whitespace/newlines from Base64.
       */
      const cleanBase64 = base64Data.replace(/\s+/g, "").trim();

      /*
       * Decode Base64 into binary data.
       */
      const binaryString = window.atob(cleanBase64);

      const compressedData = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        compressedData[i] = binaryString.charCodeAt(i);
      }

      /*
       * Brotli decompression.
       */
      const decompressedData = brotli.decompress(compressedData);

      /*
       * Convert decompressed bytes to UTF-8 text.
       */
      const text = decodeText(decompressedData);

      if (!text.trim()) {
        throw new Error(
          "The Brotli data was decompressed successfully, but the result is empty.",
        );
      }

      setResultData(text);

      saveToHistory(base64Data, text);
    } catch (err) {
      setResultData("");

      setError(
        err?.message ||
          "Unable to decompress the Brotli data. Make sure the input is valid Base64-encoded Brotli data.",
      );
    }
  };

  /*
   * Save decompression history.
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
   * Paste Brotli Base64 data.
   */
  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        await decompressBrotli(text);
      }
    } catch {
      setError("Unable to read clipboard.");
    }
  };

  /*
   * Upload a Brotli file.
   *
   * Binary files are converted to Base64 so
   * they can be safely placed into the editor.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      const buffer = await file.arrayBuffer();

      const bytes = new Uint8Array(buffer);

      let binary = "";

      const chunkSize = 0x8000;

      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(
          ...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)),
        );
      }

      const base64 = window.btoa(binary);

      setEditorData(base64);

      await decompressBrotli(base64);
    } catch (err) {
      setResultData("");

      setError(err?.message || "Unable to read or decompress the selected Brotli file.");
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
   * Download decompressed result.
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
   * Automatically decompress input.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setResultData("");
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      decompressBrotli(editorData);
    }, 500);

    return () => clearTimeout(timer);
  }, [editorData]);

  /*
   * Theme toggle. Themes are already defined via
   * `beforeMount`, so this just flips which is active.
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
   * Monaco mount — themes are already defined by
   * `beforeMount` and the correct one is already active
   * via the `theme` prop, so this only captures instances.
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
   * Placeholder shown while Monaco's script/worker loads,
   * matching the current theme's background instead of
   * being left blank.
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
            <h1 className="brand-title">Brotli Decompressor</h1>
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
            {/* BROTLI INPUT */}

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
                path="file:///brotli-decompressor/input.txt"
                value={editorData}
                onChange={(value) => {
                  setEditorData(value || "");
                }}
                language="plaintext"
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

            {/* DECOMPRESSED OUTPUT */}

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
                path="file:///brotli-decompressor/result.txt"
                value={resultData || ""}
                onMount={onMountResultEditor}
                language="plaintext"
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
                    accept=".br,application/octet-stream"
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
                    Upload Brotli
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
                  onClick={() => download("decompressed.txt", resultData)}
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
                    onClick={() => download("decompressed.txt", resultData)}
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
                <h2>Brotli Decompressor History</h2>

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
                        Decompressed: {item.output.substring(0, 300)}
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
            <h2>Free Online Brotli Decompressor</h2>

            <p>
              Brotli Decompressor is a free online tool that decompresses
              Brotli-compressed data directly in your browser.
            </p>

            <p>
              Paste Base64-encoded Brotli data into the input editor or
              upload a Brotli file to instantly extract the original
              content.
            </p>

            <div className="link-row">
              {HOME_NAV_LINKS.map(({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>

            <h3>Why use this Brotli Decompressor?</h3>

            <ul>
              <li>Decompress Brotli data instantly in your browser.</li>

              <li>Supports Base64-encoded Brotli input.</li>

              <li>Upload Brotli compressed files directly.</li>

              <li>View decompressed data in a powerful code editor.</li>

              <li>Copy decompressed content with one click.</li>

              <li>Download decompressed content as a text file.</li>

              <li>Keep recent decompression history in your browser.</li>

              <li>Process data locally in the browser.</li>
            </ul>

            <h3>Common Questions</h3>

            <h4>What is a Brotli Decompressor?</h4>

            <p>
              A Brotli Decompressor extracts the original data from data
              compressed using the Brotli compression algorithm.
            </p>

            <h4>How do I decompress Brotli data?</h4>

            <p>
              Paste Base64-encoded Brotli data into the input editor or
              upload a Brotli file. The tool automatically decompresses the
              data.
            </p>

            <h4>Can I upload a Brotli file?</h4>

            <p>
              Yes. You can upload a Brotli compressed file and the tool will
              attempt to decompress it directly in your browser.
            </p>

            <h4>Is this Brotli Decompressor free?</h4>

            <p>
              Yes. The tool is free to use and performs the decompression
              directly in your browser.
            </p>

            <h4>Is my data uploaded to a server?</h4>

            <p>
              The decompression is performed locally in your browser. Your
              Brotli data does not need to be sent to a server for
              decompression.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;
