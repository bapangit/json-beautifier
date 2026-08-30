"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import SplitPane from "react-split-pane";
import Switch from "react-switch";
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

const ResultPanel = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  background: ${(p) =>
    p.$dark ? "#1e1e1e" : "#ffffff"};
  color: ${(p) =>
    p.$dark ? "#d4d4d4" : "#1f2937"};
  font-family:
    Arial, Helvetica, sans-serif;
`;

const ResultInner = styled.div`
  padding: 28px;
  max-width: 700px;
`;

const ResultTitle = styled.h2`
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 600;
`;

const StatCard = styled.div`
  padding: 18px;
  margin-bottom: 14px;
  border: 1px solid
    ${(p) =>
      p.$dark ? "#3f3f46" : "#e2e8f0"};
  border-radius: 10px;
  background: ${(p) =>
    p.$dark ? "#252526" : "#f8fafc"};

  .label {
    font-size: 13px;
    color: ${(p) =>
      p.$dark ? "#a1a1aa" : "#64748b"};
    margin-bottom: 6px;
  }

  .value {
    font-size: 22px;
    font-weight: 600;
    color: ${(p) =>
      p.$dark ? "#f1f5f9" : "#12343b"};
  }
`;

const SuccessMessage = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: ${(p) =>
    p.$dark ? "#123b32" : "#ecfdf5"};
  border: 1px solid
    ${(p) =>
      p.$dark ? "#17634f" : "#a7f3d0"};
  color: ${(p) =>
    p.$dark ? "#a7f3d0" : "#065f46"};
  margin-bottom: 18px;
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(180px, 1fr)
  );
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
  padding: 20px;
`;

const HistoryCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 240px;
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
    margin-top: 8px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 8;
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
  const [editorData, setEditorData] =
    useState("");

  const [compressedData, setCompressedData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [darkTheme, setDarkTheme] =
    useState(false);

  const [fontSize, setFontSize] =
    useState(14);

  const [history, setHistory] =
    useState([]);

  const [isHistoryOpen, setIsHistoryOpen] =
    useState(false);

  const [editor, setEditor] =
    useState(null);

  const [monaco, setMonaco] =
    useState(null);

  /*
   * Convert ArrayBuffer to Blob
   * and create a downloadable GZIP file.
   */
  const compressGzip = async (
    text
  ) => {
    if (
      !text ||
      !text.trim()
    ) {
      setCompressedData(null);
      setError("");
      return;
    }

    try {
      setError("");

      /*
       * TextEncoder converts the input
       * string into UTF-8 bytes.
       */
      const encoder =
        new TextEncoder();

      const inputBytes =
        encoder.encode(text);

      /*
       * CompressionStream is supported
       * by modern browsers.
       */
      if (
        typeof CompressionStream ===
        "undefined"
      ) {
        throw new Error(
          "GZIP compression is not supported by this browser."
        );
      }

      const stream =
        new CompressionStream(
          "gzip"
        );

      const writer =
        stream.writable.getWriter();

      await writer.write(
        inputBytes
      );

      await writer.close();

      const compressedBuffer =
        await new Response(
          stream.readable
        ).arrayBuffer();

      const compressedBlob =
        new Blob(
          [compressedBuffer],
          {
            type:
              "application/gzip",
          }
        );

      const originalSize =
        inputBytes.byteLength;

      const compressedSize =
        compressedBuffer.byteLength;

      const savedBytes =
        originalSize -
        compressedSize;

      const compressionRatio =
        originalSize > 0
          ? (
              (1 -
                compressedSize /
                  originalSize) *
              100
            )
          : 0;

      const result = {
        blob: compressedBlob,
        originalSize,
        compressedSize,
        savedBytes,
        compressionRatio,
        time: new Date().toLocaleString(),
      };

      setCompressedData(
        result
      );

      saveToHistory(
        text,
        result
      );
    } catch (err) {
      setCompressedData(
        null
      );

      setError(
        err?.message ||
          "Unable to compress the data using GZIP."
      );
    }
  };

  /*
   * Save history.
   *
   * Blob itself is not stored in localStorage.
   * Only the original input and compression
   * statistics are stored.
   */
  const saveToHistory = (
    input,
    result
  ) => {
    if (!input || !result) {
      return;
    }

    const item = {
      id: Date.now(),
      input,
      originalSize:
        result.originalSize,
      compressedSize:
        result.compressedSize,
      compressionRatio:
        result.compressionRatio,
      time:
        result.time,
    };

    setHistory(
      (previous) => {
        const updated = [
          item,
          ...previous,
        ].slice(0, 20);

        try {
          localStorage.setItem(
            "gzip-compressor-history",
            JSON.stringify(
              updated
            )
          );
        } catch {}

        return updated;
      }
    );
  };

  /*
   * Load history.
   */
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "gzip-compressor-history"
        );

      if (saved) {
        setHistory(
          JSON.parse(saved)
        );
      }
    } catch {}
  }, []);

  /*
   * Paste text.
   */
  const onClickPaste =
    async () => {
      try {
        const text =
          await navigator.clipboard.readText();

        if (text) {
          setEditorData(text);
          compressGzip(text);
        }
      } catch {
        setError(
          "Unable to read clipboard."
        );
      }
    };

  /*
   * Upload a text/JSON file.
   */
  const handleFileUpload =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        setError("");

        const text =
          await file.text();

        if (!text.trim()) {
          throw new Error(
            "The selected file is empty."
          );
        }

        setEditorData(text);

        compressGzip(
          text
        );
      } catch (err) {
        setCompressedData(
          null
        );

        setError(
          err?.message ||
            "Unable to read the selected file."
        );
      }

      event.target.value = "";
    };

  /*
   * Clear.
   */
  const clear = () => {
    setEditorData("");
    setCompressedData(null);
    setError("");
  };

  /*
   * Download GZIP file.
   */
  const downloadGzip =
    () => {
      if (
        !compressedData?.blob
      ) {
        return;
      }

      const url =
        URL.createObjectURL(
          compressedData.blob
        );

      const element =
        document.createElement(
          "a"
        );

      element.href = url;
      element.download =
        "compressed.gz";

      document.body.appendChild(
        element
      );

      element.click();

      document.body.removeChild(
        element
      );

      URL.revokeObjectURL(
        url
      );
    };

  /*
   * Automatically compress.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setCompressedData(
        null
      );
      setError("");
      return;
    }

    const timer =
      setTimeout(() => {
        compressGzip(
          editorData
        );
      }, 500);

    return () =>
      clearTimeout(timer);
  }, [editorData]);

  /*
   * Theme.
   */
  const setTheme = (
    isDark
  ) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark
          ? "myThemeDark"
          : "myThemeLight"
      );
    }

    setDarkTheme(
      isDark
    );

    try {
      localStorage.setItem(
        "gzip-compressor-theme",
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
          "gzip-compressor-theme"
        );

      if (theme === "dark") {
        setDarkTheme(true);
      }
    } catch {}
  }, []);

  /*
   * Monaco mount.
   */
  const onMountEditor = (
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

    setError("");

    setIsHistoryOpen(
      false
    );
  };

  /*
   * Delete history.
   */
  const deleteHistory = (
    id
  ) => {
    setHistory(
      (previous) => {
        const updated =
          previous.filter(
            (item) =>
              item.id !== id
          );

        try {
          localStorage.setItem(
            "gzip-compressor-history",
            JSON.stringify(
              updated
            )
          );
        } catch {}

        return updated;
      }
    );
  };

  /*
   * Format bytes.
   */
  const formatBytes = (
    bytes
  ) => {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(
      index === 0 ? 0 : 2
    )} ${units[index]}`;
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
              GZIP Compressor
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
                title={
                  fontSize
                }
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
                  color:
                    darkTheme
                      ? "grey"
                      : "#FDB813",
                  fontSize: "22px",
                  cursor:
                    "pointer",
                }}
                onClick={() =>
                  setTheme(false)
                }
              >
                &#9728;
              </div>

              <div
                style={{
                  margin:
                    "0px 5px",
                  height: "24px",
                }}
              >
                <Switch
                  checkedIcon={
                    false
                  }
                  uncheckedIcon={
                    false
                  }
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
            {/* INPUT */}

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
                path="file:///gzip-compressor/input.txt"
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
                language="plaintext"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap:
                    "on",
                  fontSize: `${fontSize}px`,
                  scrollbar: {
                    handleMouseWheel:
                      true,
                    alwaysConsumeMouseWheel:
                      true,
                  },
                  renderLineHighlight:
                    "none",
                  isWholeLine:
                    true,
                }}
              />
            </div>

            {/* RESULT */}

            <ResultPanel
              $dark={darkTheme}
            >
              <ResultInner>
                <ResultTitle>
                  GZIP Compression Result
                </ResultTitle>

                {error && (
                  <div
                    style={{
                      padding:
                        "12px 14px",
                      marginBottom:
                        "18px",
                      background:
                        darkTheme
                          ? "#451a1a"
                          : "#fee2e2",
                      color:
                        darkTheme
                          ? "#fecaca"
                          : "#991b1b",
                      border:
                        "1px solid",
                      borderColor:
                        darkTheme
                          ? "#7f1d1d"
                          : "#fecaca",
                      borderRadius:
                        "8px",
                      fontSize:
                        "14px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {compressedData &&
                  !error && (
                    <>
                      <SuccessMessage
                        $dark={
                          darkTheme
                        }
                      >
                        GZIP compression
                        completed successfully.
                        Your compressed file is
                        ready to download.
                      </SuccessMessage>

                      <StatCard
                        $dark={
                          darkTheme
                        }
                      >
                        <div className="label">
                          Original Size
                        </div>

                        <div className="value">
                          {formatBytes(
                            compressedData.originalSize
                          )}
                        </div>
                      </StatCard>

                      <StatCard
                        $dark={
                          darkTheme
                        }
                      >
                        <div className="label">
                          Compressed Size
                        </div>

                        <div className="value">
                          {formatBytes(
                            compressedData.compressedSize
                          )}
                        </div>
                      </StatCard>

                      <StatCard
                        $dark={
                          darkTheme
                        }
                      >
                        <div className="label">
                          Space Saved
                        </div>

                        <div className="value">
                          {formatBytes(
                            Math.max(
                              0,
                              compressedData.savedBytes
                            )
                          )}
                        </div>
                      </StatCard>

                      <StatCard
                        $dark={
                          darkTheme
                        }
                      >
                        <div className="label">
                          Compression
                        </div>

                        <div className="value">
                          {compressedData.compressionRatio.toFixed(
                            2
                          )}
                          %
                        </div>
                      </StatCard>

                      <button
                        type="button"
                        onClick={
                          downloadGzip
                        }
                        style={{
                          width:
                            "100%",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: "8px",
                          padding:
                            "12px 16px",
                          border:
                            "none",
                          borderRadius:
                            "8px",
                          background:
                            "#0f9d78",
                          color:
                            "#ffffff",
                          fontSize:
                            "15px",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                        }}
                      >
                        <IoMdDownload />
                        Download GZIP
                      </button>
                    </>
                  )}

                {!compressedData &&
                  !error && (
                    <div
                      style={{
                        color:
                          darkTheme
                            ? "#a1a1aa"
                            : "#64748b",
                        lineHeight:
                          1.7,
                      }}
                    >
                      Enter text in the
                      left editor to
                      compress it using
                      GZIP.
                    </div>
                  )}
              </ResultInner>
            </ResultPanel>
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
                width:
                  "100%",
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
                    accept=".txt,.json,.csv,.xml,.html,.css,.js"
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
                    Upload File
                  </ToolBtn>
                </label>

                {/* CLEAR */}

                <ToolBtn
                  onClick={
                    clear
                  }
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
                  onClick={
                    downloadGzip
                  }
                  disabled={
                    !compressedData
                  }
                >
                  <IoMdDownload />
                  Download
                </ToolBtn>

                {/* COMPRESS */}

                <ToolBtn
                  $primary
                  onClick={() =>
                    compressGzip(
                      editorData
                    )
                  }
                  disabled={
                    !editorData.trim()
                  }
                >
                  Compress
                </ToolBtn>

                <ToolRight>
                  <ToolBtn
                    onClick={
                      downloadGzip
                    }
                    disabled={
                      !compressedData
                    }
                  >
                    <IoMdDownload />
                    Download GZIP
                  </ToolBtn>

                  <ToolDivider />

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
                  GZIP Compression History
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
                          Original:{" "}
                          {formatBytes(
                            item.originalSize
                          )}
                        </span>

                        <span className="preview">
                          Compressed:{" "}
                          {formatBytes(
                            item.compressedSize
                          )}
                        </span>

                        <span className="preview">
                          Saved:{" "}
                          {item.compressionRatio.toFixed(
                            2
                          )}
                          %
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
              Free Online GZIP Compressor
            </h2>

            <p>
              GZIP Compressor is a free online
              tool that compresses text, JSON,
              CSV, XML, HTML, JavaScript, CSS,
              and other text-based data into a
              GZIP file.
            </p>

            <p>
              Paste your data into the editor or
              upload a file to compress it directly
              in your browser and download the
              resulting .gz file.
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
              Why use this GZIP Compressor?
            </h3>

            <ul>
              <li>
                Compress text and files instantly
                in your browser.
              </li>

              <li>
                Compress JSON, CSV, XML, HTML,
                CSS, and JavaScript.
              </li>

              <li>
                Download compressed data as a
                GZIP file.
              </li>

              <li>
                View original and compressed file
                sizes.
              </li>

              <li>
                Calculate the percentage of space
                saved.
              </li>

              <li>
                Upload files directly from your
                computer.
              </li>

              <li>
                Keep your data processing in the
                browser.
              </li>

              <li>
                No server-side upload is required.
              </li>
            </ul>

            <h3>
              Common Questions
            </h3>

            <h4>
              What is GZIP compression?
            </h4>

            <p>
              GZIP is a lossless compression format
              commonly used to reduce the size of
              files and data transferred over the
              internet. The original data can be
              recovered after decompression.
            </p>

            <h4>
              How do I compress a file with GZIP?
            </h4>

            <p>
              Upload a supported text-based file
              or paste your data into the editor.
              The GZIP Compressor creates a
              compressed GZIP file that you can
              download.
            </p>

            <h4>
              Can I compress JSON with GZIP?
            </h4>

            <p>
              Yes. JSON is text-based data and can
              be compressed using GZIP. GZIP can
              significantly reduce the size of
              repetitive text data.
            </p>

            <h4>
              Does GZIP compression reduce data quality?
            </h4>

            <p>
              No. GZIP uses lossless compression.
              Decompressing a GZIP file restores
              the original data.
            </p>

            <h4>
              Is this GZIP Compressor free?
            </h4>

            <p>
              Yes. This GZIP Compressor is free
              to use online and performs compression
              directly in your browser.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;