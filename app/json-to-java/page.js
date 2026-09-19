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
import Link from "next/link";
import Menu from "@/Components/Menu";
import Button from "@/Components/Buttons/Button";

const headerContainerHeight = 70;
const footerContainerHeight = 80;

const THEME_STORAGE_KEY = "json-java-theme";
const HISTORY_STORAGE_KEY = "json-to-java-history";

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

const ClassNameField = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    white-space: nowrap;
  }

  input {
    width: 150px;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    color: #12343b;
    outline: none;

    &:focus {
      border-color: #0f9d78;
    }
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

/*
 * ---------------------------------------------------------------------
 * JSON -> Java class generation helpers
 * ---------------------------------------------------------------------
 */

const JAVA_RESERVED_WORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
  "class", "const", "continue", "default", "do", "double", "else", "enum",
  "extends", "final", "finally", "float", "for", "goto", "if", "implements",
  "import", "instanceof", "int", "interface", "long", "native", "new",
  "package", "private", "protected", "public", "return", "short", "static",
  "strictfp", "super", "switch", "synchronized", "this", "throw", "throws",
  "transient", "try", "void", "volatile", "while", "true", "false", "null",
]);

/*
 * Convert an arbitrary JSON key into PascalCase, suitable for a
 * Java class name.
 */
const toPascalCase = (raw) => {
  const cleaned = String(raw || "")
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ""));

  const pascal = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return pascal.replace(/^[0-9]+/, "");
};

/*
 * Convert an arbitrary JSON key into camelCase, suitable for a
 * Java field name.
 */
const toCamelCase = (raw) => {
  const pascal = toPascalCase(raw);

  if (!pascal) return "";

  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/*
 * Guess a reasonable singular name for elements of an array field,
 * e.g. "products" -> "Product", "categoryList" -> "CategoryListItem".
 */
const singularize = (word) => {
  const lower = String(word || "").toLowerCase();

  if (!word) return "Item";

  if (lower.endsWith("ies")) return word.slice(0, -3) + "y";

  if (lower.endsWith("s") && !lower.endsWith("ss")) return word.slice(0, -1);

  return `${word}Item`;
};

/*
 * Pick Integer / Long / Double depending on the numeric value.
 */
const inferNumberType = (value) => {
  if (Number.isInteger(value)) {
    return value >= -2147483648 && value <= 2147483647 ? "Integer" : "Long";
  }

  return "Double";
};

/*
 * Produce a unique, valid Java class name given a desired base name.
 */
const makeUniqueClassName = (base, usedNames) => {
  let name = toPascalCase(base) || "GeneratedClass";

  if (!/^[A-Za-z_$]/.test(name)) {
    name = `Class${name}`;
  }

  if (JAVA_RESERVED_WORDS.has(name.toLowerCase())) {
    name = `${name}Class`;
  }

  let candidate = name;
  let counter = 1;

  while (usedNames.has(candidate)) {
    counter += 1;
    candidate = `${name}${counter}`;
  }

  usedNames.add(candidate);

  return candidate;
};

/*
 * Produce a valid, non-reserved Java field name given a JSON key.
 */
const makeFieldName = (key, fallbackIndex) => {
  let fieldName = toCamelCase(key);

  if (!fieldName || !/^[A-Za-z_$]/.test(fieldName)) {
    fieldName = `field${fallbackIndex}${toPascalCase(fieldName || key)}`;
  }

  if (JAVA_RESERVED_WORDS.has(fieldName.toLowerCase())) {
    fieldName = `${fieldName}Value`;
  }

  return fieldName;
};

/*
 * Indent a block of generated Java source by `level` levels
 * (4 spaces per level).
 */
const indentBlock = (text, level) => {
  const prefix = "    ".repeat(level);

  return text
    .split("\n")
    .map((line) => (line ? prefix + line : line))
    .join("\n");
};

/*
 * Resolve the Java type for a given JSON value. Nested objects are
 * turned into new static classes and appended to `classesOut`.
 */
const resolveJavaType = (key, value, usedNames, classesOut) => {
  if (value === null || value === undefined) {
    return "Object";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "List<Object>";
    }

    const sampleIndex = value.findIndex((item) => item !== null && item !== undefined);
    const sample = sampleIndex === -1 ? null : value[sampleIndex];

    const elementType = resolveJavaType(singularize(key), sample, usedNames, classesOut);

    return `List<${elementType}>`;
  }

  const valueType = typeof value;

  if (valueType === "string") return "String";
  if (valueType === "boolean") return "Boolean";
  if (valueType === "number") return inferNumberType(value);

  if (valueType === "object") {
    const className = makeUniqueClassName(key, usedNames);

    buildJavaClass(className, value, usedNames, classesOut, false);

    return className;
  }

  return "Object";
};

/*
 * Build the field declarations, getters, and setters for a single
 * Java class representing a JSON object, and push the finished
 * class text onto `classesOut`.
 */
function buildJavaClass(className, obj, usedNames, classesOut, isTopLevel) {
  const fieldEntries = Object.entries(obj).map(([key, value], index) => {
    const fieldName = makeFieldName(key, index);
    const type = resolveJavaType(key, value, usedNames, classesOut);

    return { key, fieldName, type };
  });

  const lines = [];

  lines.push(`public ${isTopLevel ? "" : "static "}class ${className} {`.replace("  ", " "));
  lines.push("");

  fieldEntries.forEach(({ key, fieldName, type }) => {
    if (key !== fieldName) {
      lines.push(`    @JsonProperty("${key}")`);
    }

    lines.push(`    private ${type} ${fieldName};`);
  });

  lines.push("");

  fieldEntries.forEach(({ fieldName, type }) => {
    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    lines.push(`    public ${type} get${capitalized}() {`);
    lines.push(`        return ${fieldName};`);
    lines.push(`    }`);
    lines.push("");
    lines.push(`    public void set${capitalized}(${type} ${fieldName}) {`);
    lines.push(`        this.${fieldName} = ${fieldName};`);
    lines.push(`    }`);
    lines.push("");
  });

  lines.push(`}`);

  classesOut.push(lines.join("\n"));
}

/*
 * Convert a JSON string into a full Java source file containing a
 * top-level class (and any nested static classes it needs).
 *
 * Rules:
 * - JSON object -> becomes the fields of the requested top-level class.
 * - JSON array -> wrapped in a class with a single `items` List field,
 *   whose element type is inferred from the array's first item.
 * - Nested JSON objects -> become nested static classes.
 * - Nested JSON arrays -> become List<T> fields.
 */
const convertJsonToJava = (jsonString, requestedClassName) => {
  const usedNames = new Set();
  const rootClassName = makeUniqueClassName(requestedClassName || "RootClass", usedNames);

  const parsed = JSON.parse(jsonString);

  let rootSource;

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error("JSON array must contain at least one item to infer a class structure.");
    }

    const nested = [];
    const sampleIndex = parsed.findIndex((item) => item !== null && item !== undefined);
    const sample = sampleIndex === -1 ? null : parsed[sampleIndex];

    const elementType = resolveJavaType(rootClassName, sample, usedNames, nested);

    const lines = [];

    lines.push(`public class ${rootClassName} {`);
    lines.push("");
    lines.push(`    @JsonProperty("items")`);
    lines.push(`    private List<${elementType}> items;`);
    lines.push("");
    lines.push(`    public List<${elementType}> getItems() {`);
    lines.push(`        return items;`);
    lines.push(`    }`);
    lines.push("");
    lines.push(`    public void setItems(List<${elementType}> items) {`);
    lines.push(`        this.items = items;`);
    lines.push(`    }`);

    nested.forEach((classText) => {
      lines.push("");
      lines.push(indentBlock(classText, 1));
    });

    lines.push(`}`);

    rootSource = lines.join("\n");
  } else if (parsed === null || typeof parsed !== "object") {
    throw new Error("JSON must contain an object or array at the top level for Java class generation.");
  } else {
    const rootKeys = Object.keys(parsed);

    if (rootKeys.length === 0) {
      throw new Error("JSON must contain at least one field to generate a Java class.");
    }

    const nested = [];
    const fieldEntries = rootKeys.map((key, index) => {
      const fieldName = makeFieldName(key, index);
      const type = resolveJavaType(key, parsed[key], usedNames, nested);

      return { key, fieldName, type };
    });

    const lines = [];

    lines.push(`public class ${rootClassName} {`);
    lines.push("");

    fieldEntries.forEach(({ key, fieldName, type }) => {
      if (key !== fieldName) {
        lines.push(`    @JsonProperty("${key}")`);
      }

      lines.push(`    private ${type} ${fieldName};`);
    });

    lines.push("");

    fieldEntries.forEach(({ fieldName, type }) => {
      const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      lines.push(`    public ${type} get${capitalized}() {`);
      lines.push(`        return ${fieldName};`);
      lines.push(`    }`);
      lines.push("");
      lines.push(`    public void set${capitalized}(${type} ${fieldName}) {`);
      lines.push(`        this.${fieldName} = ${fieldName};`);
      lines.push(`    }`);
      lines.push("");
    });

    nested.forEach((classText, index) => {
      lines.push(indentBlock(classText, 1));

      if (index < nested.length - 1) {
        lines.push("");
      }
    });

    lines.push(`}`);

    rootSource = lines.join("\n");
  }

  const needsListImport = /List</.test(rootSource);
  const needsJsonPropertyImport = /@JsonProperty/.test(rootSource);

  const importLines = [];

  if (needsListImport) importLines.push("import java.util.List;");
  if (needsJsonPropertyImport) importLines.push("import com.fasterxml.jackson.annotation.JsonProperty;");

  return importLines.length ? `${importLines.join("\n")}\n\n${rootSource}` : rootSource;
};

function App() {
  const [editorData, setEditorData] = useState("");
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState("");
  const [className, setClassName] = useState("RootClass");

  /*
   * Starts false (SSR-safe); the useLayoutEffect below
   * corrects it before the browser paints, avoiding the
   * visible flash you were seeing.
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
   * Apply the saved theme before the browser paints —
   * useLayoutEffect (not useEffect) is what removes the
   * extra visible frame at the wrong theme.
   */
  useLayoutEffect(() => {
    setDarkTheme(getStoredIsDark());
  }, []);

  /*
   * Convert JSON string to a Java class, updating state and
   * saving to history. Wraps convertJsonToJava with try/catch
   * and empty-input handling, so it can be called directly
   * from event handlers and effects.
   */
  const runConversion = (
    jsonString,
    requestedClassName,
    { shouldSaveHistory = true } = {},
  ) => {
    if (!jsonString || !jsonString.trim()) {
      setResultData("");
      setError("");
      return;
    }

    try {
      setError("");

      const javaSource = convertJsonToJava(jsonString, requestedClassName);

      setResultData(javaSource);

      if (shouldSaveHistory) {
        saveToHistory(jsonString, javaSource);
      }
    } catch (err) {
      setResultData("");

      setError(err?.message || "Unable to convert JSON to a Java class.");
    }
  };

  /*
   * Save history locally.
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
   * Load history.
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
   * Paste JSON from clipboard.
   */
  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        skipAutoHistoryForInputRef.current = {
          className,
          input: text,
        };
        setEditorData(text);
        runConversion(text, className);
      }
    } catch {
      setError("Unable to read clipboard.");
    }
  };

  /*
   * Upload JSON file.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      const text = await file.text();

      if (!text.trim()) {
        throw new Error("The selected JSON file is empty.");
      }

      skipAutoHistoryForInputRef.current = {
        className,
        input: text,
      };
      setEditorData(text);
      runConversion(text, className);
    } catch (err) {
      setResultData("");

      setError(err?.message || "Unable to read the selected JSON file.");
    }

    event.target.value = "";
  };

  /*
   * Clear input/output.
   */
  const clear = () => {
    setEditorData("");
    setResultData("");
    setError("");
  };

  /*
   * Download the generated .java file.
   */
  const download = (filename, text) => {
    if (!text) return;

    const blob = new Blob([text], {
      type: "text/x-java-source;charset=utf-8",
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
   * Copy button status.
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
   * Automatically convert JSON whenever the input or the
   * requested class name changes.
   */
  useEffect(() => {
    if (!editorData.trim()) {
      setResultData("");
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      const skipAutoHistoryForInput = skipAutoHistoryForInputRef.current;
      const shouldSaveHistory =
        !skipAutoHistoryForInput ||
        skipAutoHistoryForInput.input !== editorData ||
        skipAutoHistoryForInput.className !== className;

      skipAutoHistoryForInputRef.current = null;

      runConversion(editorData, className, { shouldSaveHistory });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorData, className]);

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
   * Delete history item.
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
        className={darkTheme ? "dark-mode" : "light-mode"}
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {/* HEADER */}

        <HeaderContainer>
          <div className="brand-nav">
            <h1 className="brand-title">JSON to Java Class Converter</h1>
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
            {/* JSON INPUT */}

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
                path="file:///json-to-java/input.json"
                value={editorData}
                onChange={(value) => {
                  setEditorData(value || "");
                }}
                language="json"
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

            {/* JAVA OUTPUT */}

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
                path={`file:///json-to-java/${className || "RootClass"}.java`}
                value={resultData || ""}
                onMount={onMountResultEditor}
                language="java"
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
                {/* CLASS NAME */}

                <ClassNameField>
                  <label htmlFor="java-class-name">Class name</label>

                  <input
                    id="java-class-name"
                    type="text"
                    value={className}
                    spellCheck={false}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="RootClass"
                  />
                </ClassNameField>

                <ToolDivider />

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
                    accept=".json,application/json"
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
                    Upload JSON
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

                <ToolRight>
                  {/* DOWNLOAD RESULT */}

                  <ToolBtn
                    onClick={() => download(`${className || "RootClass"}.java`, resultData)}
                    disabled={!resultData}
                  >
                    <IoMdDownload />
                    Download .java
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
                <h2>JSON to Java Class Conversion History</h2>

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
                        JSON: {item.input.substring(0, 120)}
                      </span>

                      <span className="preview">
                        Java: {item.output.substring(0, 300)}
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
            <h2>Free Online JSON to Java Class Converter</h2>

            <p>
              JSON to Java Class Converter is a free online tool that turns
              JSON data into a ready-to-use Java class, complete with
              private fields, getters, setters, and nested static classes,
              directly in your browser.
            </p>

            <p>
              Paste JSON into the input editor or upload a JSON file to
              instantly generate a Java class that mirrors the structure of
              your data, including nested objects and arrays.
            </p>

            <div className="link-row">
              {HOME_NAV_LINKS.map(({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>

            <h3>Why use this JSON to Java Class Converter?</h3>

            <ul>
              <li>Convert JSON to a Java class instantly in your browser.</li>

              <li>Upload JSON files directly from your computer.</li>

              <li>Choose your own top-level class name.</li>

              <li>Nested JSON objects become nested static Java classes.</li>

              <li>JSON arrays are converted into typed List fields.</li>

              <li>Generates getters, setters, and @JsonProperty annotations for Jackson.</li>

              <li>Copy or download the generated .java file.</li>

              <li>No server-side processing is required.</li>
            </ul>

            <h3>Common Questions</h3>

            <h4>What is JSON to Java class conversion?</h4>

            <p>
              JSON to Java class conversion turns structured JSON data into
              a Java POJO (Plain Old Java Object) whose fields mirror the
              JSON structure, so you can deserialize similar JSON payloads
              in a Java application.
            </p>

            <h4>How do I convert JSON to a Java class?</h4>

            <p>
              Paste your JSON into the input editor or upload a JSON file.
              The converter automatically parses the JSON and displays the
              resulting Java class in the output editor.
            </p>

            <h4>How are JSON arrays converted to Java?</h4>

            <p>
              JSON arrays are converted into <strong>List</strong> fields.
              For example, an array of product objects becomes a{" "}
              <strong>List&lt;Product&gt;</strong> field, with a nested{" "}
              <strong>Product</strong> class generated for the array's
              structure.
            </p>

            <h4>How are nested JSON objects handled?</h4>

            <p>
              Each nested JSON object becomes its own nested static Java
              class, named after the JSON key that contained it, keeping
              the generated file self-contained and easy to copy into a
              project.
            </p>

            <h4>Is this JSON to Java class converter free?</h4>

            <p>
              Yes. This JSON to Java class converter is free to use online
              and processes the conversion directly in your browser.
            </p>
          </div>
        </HomeSeoSection>
      </main>
    </>
  );
}

export default App;
