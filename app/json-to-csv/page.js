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

const JSON_TO_CSV_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON to CSV Converter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires modern web browser",
  description:
    "Free online JSON to CSV converter that transforms JSON data into CSV format with instant conversion results.",
  url: "https://www.json-beautifier.net/json-to-csv",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Convert JSON to CSV",
    "Paste JSON and generate CSV instantly",
    "Copy and download converted CSV",
    "Convert JSON arrays into spreadsheet-friendly rows",
    "Works in any browser",
  ],
};

const headerContainerHeight = 70;
const footerContainerHeight = 110;

const HOME_NAV_LINKS = [
  { href: "/", label: "Home" },
//   { href: "/json-to-xml", label: "JSON to XML" },
//   { href: "/xml-to-json", label: "XML to JSON" },
//   { href: "/json-to-csv", label: "JSON to CSV" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ---------- JSON -> CSV helpers ---------- */

const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      Object.assign(
        flattened,
        flattenObject(value, newKey),
      );
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value);
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const formatCsvData = (data) => {
  const parsed = JSON.parse(data);

  let rows;

  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (
    parsed &&
    typeof parsed === "object"
  ) {
    const arrayProperty = Object.values(parsed).find(
      (value) => Array.isArray(value),
    );

    if (arrayProperty) {
      rows = arrayProperty;
    } else {
      rows = [parsed];
    }
  } else {
    rows = [{ value: parsed }];
  }

  if (!rows.length) {
    return "";
  }

  const flattenedRows = rows.map((row) => {
    if (
      row !== null &&
      typeof row === "object" &&
      !Array.isArray(row)
    ) {
      return flattenObject(row);
    }

    return { value: row };
  });

  const headers = [
    ...new Set(
      flattenedRows.flatMap((row) =>
        Object.keys(row),
      ),
    ),
  ];

  const csvRows = [
    headers.map(escapeCsvValue).join(","),
    ...flattenedRows.map((row) =>
      headers
        .map((header) =>
          escapeCsvValue(row[header]),
        )
        .join(","),
    ),
  ];

  return csvRows.join("\n");
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
  background: darkgray;
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
  }

  .link-row a:hover {
    opacity: 0.9;
  }
`;

const TopContainer = styled.div`
  width: 100%;

  ${(p) =>
    p.mode === "H"
      ? css`
          height: calc(
            100vh - ${headerContainerHeight +
            footerContainerHeight -
            20}px
          );
        `
      : css`
          height: calc(
            100vh - ${footerContainerHeight +
            headerContainerHeight -
            20}px
          );
        `}
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

    &:hover {
      color: red;
    }
  }
`;

function App() {
  const { sId } = useParams();

  const { tabData, save, getTabData, deleteTab } =
    SavedTabData();

  const [editorData, setEditorData] = useState("");
  const [resultData, setResultData] = useState("");

  const [timestampHovered, setTimestampHovered] =
    useState();

  const tempEditorData = useMemo(() => {
    if (timestampHovered) {
      return getTabData(timestampHovered);
    }

    return "";
  }, [timestampHovered]);

  const [editor, setEditor] = useState();
  const [monaco, setMonaco] = useState();

  const [trimValue] = TrimValueState();

  const [containerViewMode, setContainerViewMode] =
    useState("B");

  const [isContainerViewModeReady, setIsContainerViewModeReady] =
    useState(false);

  const [darkTheme, setDarkTheme] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const [newData, setNewData] = useState("");

  const [copyResButtonTitle, setCopyResButtonTitle] =
    useState("Copy");

  const [fontSize, setFontSize] = useState(14);

  useBrowserLayoutEffect(() => {
    if (!sId) {
      setEditorData("");
      setResultData("");
    }

    const savedContainerMode =
      getContainerMode();

    setContainerViewMode(
      savedContainerMode === "B" ? "B" : "H",
    );

    setDarkTheme(getMode());

    setIsContainerViewModeReady(true);
  }, [sId]);

  const onMountResultEditor = (
    editorInstance,
    monacoInstance,
  ) => {
    editorInstance.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;

      if (
        keyCode === 52 &&
        (metaKey || ctrlKey)
      ) {
        event.preventDefault();
      }
    });

    monacoInstance.editor.defineTheme(
      "myThemeDark",
      {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {},
      },
    );

    monacoInstance.editor.defineTheme(
      "myThemeLight",
      {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {},
      },
    );

    monacoInstance.editor.setTheme(
      getMode()
        ? "myThemeDark"
        : "myThemeLight",
    );

    setEditor(editorInstance);
    setMonaco(monacoInstance);
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (
      editor.getValue() !==
      (resultData || "")
    ) {
      editor.setValue(resultData || "");
    }

    editor.layout();
  }, [editor, resultData]);

  const setTheme = (isDark) => {
    if (monaco) {
      monaco.editor.setTheme(
        isDark
          ? "myThemeDark"
          : "myThemeLight",
      );
    }

    setDarkTheme(isDark);
    setMode(isDark);
  };

  const convertOnChange = (data) => {
    try {
      setResultData(formatCsvData(data));
    } catch {
      setResultData("");
    }
  };

  const trim = () =>
    trimEditorData(editorData, trimValue);

  useEffect(() => {
    if (
      isContainerViewModeReady &&
      !sId
    ) {
      saveHistory(editorData);
    }
  }, [
    editorData,
    isContainerViewModeReady,
    sId,
  ]);

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
  }, [
    editorData,
    isContainerViewModeReady,
  ]);

  useEffect(() => {
    if (!newData) {
      return;
    }

    const handler = setTimeout(() => {
      const tabArr = Object.keys(tabData);

      if (tabArr.length) {
        if (
          getTabData(tabArr[0]) !==
          newData
        ) {
          save(newData);
        }
      } else {
        save(newData);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [newData]);

  const onClickPaste = async () => {
    try {
      const text =
        await navigator.clipboard.readText();

      if (text) {
        setEditorData(text);
        setNewData(text);
      }
    } catch {
      // Clipboard access failed
    }
  };

  const clear = () => {
    setEditorData("");
    setResultData("");
  };

  const findWord = () => {
    if (editor) {
      editor
        .getAction("actions.find")
        .run();
    }
  };

  function download(filename, text) {
    const element =
      document.createElement("a");

    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," +
        encodeURIComponent(text),
    );

    element.setAttribute(
      "download",
      filename,
    );

    element.style.display = "none";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        copyResButtonTitle !== "Copy"
      ) {
        setCopyResButtonTitle("Copy");
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [copyResButtonTitle]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            HOME_JSON_LD,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            JSON_TO_CSV_SCHEMA,
          ),
        }}
      />

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          visibility:
            isContainerViewModeReady
              ? "visible"
              : "hidden",
        }}
      >
        <HeaderContainer
          $show={
            containerViewMode === "H"
          }
        >
          <div className="brand-nav">
            <h1 className="brand-title">
              JSON to CSV Converter
            </h1>
          </div>

          {Object.keys(tabData).length ? null : (
            <>
              <div className="bookmark-message">
                Paste raw JSON in left panel and
                convert it to CSV instantly.
              </div>

              <button
                onClick={() => {
                  const isMac =
                    navigator.platform
                      .toUpperCase()
                      .includes("MAC");

                  alert(
                    `To bookmark this page, press ${
                      isMac
                        ? "⌘ + D"
                        : "Ctrl + D"
                    }`,
                  );
                }}
              >
                ⭐ Bookmark this Tool
              </button>
            </>
          )}

          <div>
            <Menu />
          </div>
        </HeaderContainer>

        <TopContainer
          mode={containerViewMode}
        >
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
          >
            <div>
              <Editor
                height={`calc(100vh - ${
                  headerContainerHeight +
                  footerContainerHeight -
                  20
                }px)`}
                theme="vs-dark"
                path="file:///json-to-csv/input.json"
                value={
                  tempEditorData ||
                  editorData ||
                  ""
                }
                onMount={(editorInstance) => {
                  editorInstance.focus();

                  editorInstance.onKeyDown(
                    (event) => {
                      const {
                        keyCode,
                        ctrlKey,
                        metaKey,
                      } = event;

                      if (
                        keyCode === 52 &&
                        (metaKey || ctrlKey)
                      ) {
                        setIsPasting(true);
                      }
                    },
                  );
                }}
                language="json"
                onChange={(data) => {
                  setEditorData(data || "");
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  renderLineHighlight:
                    "none",
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
                path="file:///json-to-csv/result.csv"
                value={resultData || ""}
                onMount={
                  onMountResultEditor
                }
                language="plaintext"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                  fontSize: `${fontSize}px`,
                  renderLineHighlight:
                    "none",
                  isWholeLine: true,
                }}
              />
            </div>
          </SplitPane>
        </TopContainer>

        <BottomContainer
          $show={
            containerViewMode === "B"
          }
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              borderTop:
                "1px solid darkgrey",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor:
                  "#5e5e5e9b",
              }}
            >
              <div
                style={{
                  padding: "0px 5px",
                  display: "flex",
                  gap: "5px",
                }}
              >
                {!sId && (
                  <>
                    <div
                      style={{
                        margin:
                          "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Paste"
                        onClick={
                          onClickPaste
                        }
                        icon={
                          <MdOutlineContentPaste
                            size={40}
                          />
                        }
                      />
                    </div>

                    <div
                      style={{
                        margin:
                          "4px 4px 2px 4px",
                      }}
                    >
                      <Button
                        title="Clear"
                        onClick={clear}
                        icon={
                          <AiOutlineDelete
                            size={10}
                          />
                        }
                      />
                    </div>
                  </>
                )}

                <div
                  style={{
                    margin:
                      "4px 4px 2px 4px",
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
                    setCopyResButtonTitle(
                      "Copied",
                    );
                  }}
                >
                  <div
                    style={{
                      margin:
                        "4px 4px 2px 4px",
                    }}
                  >
                    <Button
                      title={
                        copyResButtonTitle
                      }
                      icon={
                        <IoCopyOutline />
                      }
                    />
                  </div>
                </CopyToClipboard>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
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
                    onClick={() =>
                      setTheme(false)
                    }
                  >
                    &#9728;
                  </div>

                  <div
                    style={{
                      margin: "0px 5px",
                    }}
                  >
                    <Switch
                      checkedIcon={false}
                      uncheckedIcon={false}
                      height={24}
                      onChange={(e) =>
                        setTheme(e)
                      }
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
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setTheme(true)
                    }
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
                    margin:
                      "4px 4px 2px 8px",
                  }}
                >
                  <Button
                    title="Download"
                    onClick={() =>
                      download(
                        "result.csv",
                        resultData,
                      )
                    }
                    icon={
                      <IoMdDownload />
                    }
                  />
                </div>

                <div>
                  <Button
                    title="Paste Result"
                    onClick={() => {
                      if (resultData) {
                        setEditorData(
                          resultData,
                        );
                        setNewData(
                          resultData,
                        );
                      }
                    }}
                    icon={
                      <LuMoveHorizontal />
                    }
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
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      color: "lightgray",
                    }}
                    onClick={() =>
                      setFontSize(
                        fontSize > 5
                          ? fontSize - 1
                          : 5,
                      )
                    }
                  >
                    −
                  </div>

                  <Button
                    title={fontSize}
                    style={{
                      backgroundColor:
                        "white",
                      height: "20px",
                      width: "28px",
                      padding: "0px",
                    }}
                  />

                  <div
                    style={{
                      cursor: "pointer",
                      color: "lightgray",
                    }}
                    onClick={() =>
                      setFontSize(
                        fontSize + 1,
                      )
                    }
                  >
                    +
                  </div>
                </div>
              </div>
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
              <h2>
                Online JSON to CSV Converter
              </h2>

              <p>
                JSON to CSV Converter transforms JSON
                data into CSV format that can be opened
                in spreadsheet applications such as
                Microsoft Excel and Google Sheets.
              </p>

              <p>
                Paste your JSON data into the left editor
                and the CSV output is generated
                automatically on the right.
              </p>

              <div className="link-row">
                {HOME_NAV_LINKS.map(
                  ({ href, label }) => (
                    <Link
                      href={href}
                      key={href}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>

              <h3>
                Why use JSON to CSV Converter?
              </h3>

              <ul>
                <li>
                  Convert JSON arrays into CSV rows.
                </li>
                <li>
                  Automatically generate column headers.
                </li>
                <li>
                  Flatten nested JSON objects using dot
                  notation.
                </li>
                <li>
                  Preserve JSON arrays inside CSV cells.
                </li>
                <li>
                  Copy or download the generated CSV
                  file.
                </li>
                <li>
                  Works directly in your browser.
                </li>
              </ul>

              <h3>Common questions</h3>

              <h4>
                What does JSON to CSV Converter do?
              </h4>

              <p>
                It converts structured JSON data into
                comma-separated values, making the data
                easier to open in spreadsheet software
                and analyze in tabular form.
              </p>

              <h4>
                Can I convert nested JSON to CSV?
              </h4>

              <p>
                Yes. Nested objects are flattened into
                columns using dot notation. For example,
                a JSON property such as user.name becomes
                a CSV column named user.name.
              </p>

              <h4>
                What happens to JSON arrays?
              </h4>

              <p>
                JSON arrays inside an object are
                preserved as JSON text inside the
                corresponding CSV cell.
              </p>

              <h4>
                Is the JSON to CSV Converter free?
              </h4>

              <p>
                Yes. The JSON to CSV Converter is free
                to use and works directly in your web
                browser.
              </p>
            </div>
          </HomeSeoSection>
        )}
      </main>
    </>
  );
}

export default App;