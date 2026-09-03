"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { FiSearch, FiX, FiCode, FiRepeat, FiArchive } from "react-icons/fi";
import { FaTools } from "react-icons/fa";

/*
 * Tools are grouped by function rather than shown as a flat
 * grid — the grouping reflects how the tools actually relate
 * to each other (format vs. convert vs. compress).
 */
const menuGroups = [
  {
    id: "format",
    label: "Format",
    icon: FiCode,
    items: [
      {
        href: "/",
        label: "JSON Beautifier",
        description: "Pretty-print and indent JSON",
      },
      {
        href: "/json-minify",
        label: "JSON Minifier",
        description: "Strip whitespace from JSON",
      },
      {
        href: "/html-beautifier",
        label: "HTML Beautifier",
        description: "Pretty-print and indent HTML",
      },
      {
        href: "/html-minifier",
        label: "HTML Minifier",
        description: "Minify and compress HTML",
      },
      // {
      //   href: "/json-diff-checker",
      //   label: "JSON Diff Checker",
      //   description: "Compare two JSON documents",
      // },
    ],
  },
  {
    id: "convert",
    label: "Convert",
    icon: FiRepeat,
    items: [
      {
        href: "/json-to-xml",
        label: "JSON to XML",
        description: "Convert JSON into XML",
      },
      {
        href: "/xml-to-json",
        label: "XML to JSON",
        description: "Convert XML into JSON",
      },
      {
        href: "/json-to-csv",
        label: "JSON to CSV",
        description: "Convert JSON into CSV",
      },
      {
        href: "/csv-to-json",
        label: "CSV to JSON",
        description: "Convert CSV into JSON",
      },
      {
        href: "/json-to-java",
        label: "JSON to Java",
        description: "Generate Java classes from JSON",
      },
    ],
  },
  {
    id: "compress",
    label: "Compress",
    icon: FiArchive,
    items: [
      {
        href: "/gzip-decompressor",
        label: "GZip Decompress",
        description: "Decompress a .gz file",
      },
      {
        href: "/gzip-compressor",
        label: "GZip Compress",
        description: "Compress into a .gz file",
      },
      {
        href: "/brotli-decompressor",
        label: "brotli Decompress",
        description: "Decompress a .br file",
      },
      {
        href: "/brotli-compressor",
        label: "brotli Compress",
        description: "Compress into a .br file",
      },
    ],
  },
];

/* ---------- palette ---------- */
const c = {
  bg: "#0e1116",
  surface: "#161b22",
  surfaceRaised: "#1b212b",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.14)",
  text: "#e6edf3",
  textMuted: "#8b95a1",
  textFaint: "#5c6470",
  accent: "#109dcc",
  accentSoft: "rgba(16, 157, 204, 0.12)",
};

const MenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 90px;
  height: 38px;
  padding: 0 14px;

  border: 1px solid ${c.border};
  border-radius: 9px;

  background: ${c.surface};
  color: ${c.text};

  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  transition: border-color 0.15s ease, background 0.15s ease;

  svg {
    color: ${c.accent};
    flex-shrink: 0;
  }

  &:hover {
    border-color: ${c.borderStrong};
    background: ${c.surfaceRaised};
  }

  &:focus-visible {
    outline: 2px solid ${c.accent};
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    min-width: 78px;
    height: 36px;
    padding: 0 12px;
    gap: 6px;
    font-size: 13px;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;

  background: rgba(6, 8, 11, 0.72);
  backdrop-filter: blur(3px);

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;

  z-index: 999;

  animation: fade-in 0.15s ease;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Modal = styled.div`
  width: min(92vw, 800px);
  max-height: min(82vh, 640px);

  display: flex;
  flex-direction: column;

  background: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);

  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 18px 20px;
  border-bottom: 1px solid ${c.border};

  h3 {
    margin: 0;
    color: ${c.text};
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.1px;
  }
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  border: 1px solid transparent;
  border-radius: 8px;

  background: transparent;
  color: ${c.textMuted};

  cursor: pointer;

  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${c.surfaceRaised};
    color: ${c.text};
  }

  &:focus-visible {
    outline: 2px solid ${c.accent};
    outline-offset: 1px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  padding: 14px 20px;
  border-bottom: 1px solid ${c.border};

  svg {
    position: absolute;
    left: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: ${c.textFaint};
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 38px;

  padding: 0 12px 0 34px;
  box-sizing: border-box;

  border: 1px solid ${c.border};
  border-radius: 8px;

  background: ${c.bg};
  color: ${c.text};

  font: inherit;
  font-size: 14px;

  outline: none;

  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${c.textFaint};
  }

  &:focus {
    border-color: ${c.accent};
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
`;

const ListArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px 16px;

  scrollbar-width: thin;
  scrollbar-color: ${c.borderStrong} transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${c.borderStrong};
    border-radius: 8px;
  }
`;

const Group = styled.div`
  & + & {
    margin-top: 6px;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px 10px 6px;

  color: ${c.textMuted};
  font-size: 13px;
  font-weight: 600;

  svg {
    color: ${c.accent};
    flex-shrink: 0;
  }
`;

const GroupItems = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;

  padding: 4px 10px 14px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ItemRow = styled(Link)`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 4px;

  height: 100%;
  box-sizing: border-box;

  padding: 12px 13px;
  border: 1px solid ${c.border};
  border-radius: 10px;

  background: ${c.surfaceRaised};
  text-decoration: none;

  transition: border-color 0.12s ease, background 0.12s ease,
    transform 0.12s ease;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 2px;
    border-radius: 2px;
    background: transparent;
    transition: background 0.12s ease;
  }

  &:hover,
  &:focus-visible {
    border-color: ${c.borderStrong};
    background: ${c.accentSoft};
    transform: translateY(-1px);
  }

  &:hover::before,
  &:focus-visible::before {
    background: ${c.accent};
  }

  &:focus-visible {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: border-color 0.12s ease, background 0.12s ease;
    &:hover,
    &:focus-visible {
      transform: none;
    }
  }
`;

const ItemLabel = styled.span`
  color: ${c.text};
  font-size: 14.5px;
  font-weight: 500;
`;

const ItemDescription = styled.span`
  color: ${c.textMuted};
  font-size: 12.5px;
`;

const EmptyState = styled.p`
  margin: 32px 12px;
  color: ${c.textMuted};
  font-size: 14px;
  text-align: center;
`;

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  const openMenu = () => setIsOpen(true);

  const closeMenu = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return menuGroups;

    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const hasResults = filteredGroups.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 20);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  return (
    <>
      <MenuButton
        type="button"
        aria-label="Open site navigation menu"
        onClick={openMenu}
      >
        <FaTools size={15} />
        <span>Tools</span>
      </MenuButton>

      {isOpen && (
        <ModalBackdrop onClick={closeMenu}>
          <Modal
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
            onClick={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <h3>Tools</h3>
              <CloseButton
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <FiX size={17} />
              </CloseButton>
            </ModalHeader>

            <SearchBar>
              <FiSearch size={16} aria-hidden="true" />
              <SearchInput
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tools"
                aria-label="Search navigation tools"
              />
            </SearchBar>

            <ListArea>
              {hasResults ? (
                filteredGroups.map((group) => (
                  <Group key={group.id}>
                    <GroupHeader>
                      <group.icon size={13} />
                      {group.label}
                    </GroupHeader>

                    <GroupItems>
                      {group.items.map((item) => (
                        <ItemRow
                          href={item.href}
                          key={item.href}
                          onClick={closeMenu}
                        >
                          <ItemLabel>{item.label}</ItemLabel>
                          <ItemDescription>{item.description}</ItemDescription>
                        </ItemRow>
                      ))}
                    </GroupItems>
                  </Group>
                ))
              ) : (
                <EmptyState>No tools match &ldquo;{searchQuery}&rdquo;.</EmptyState>
              )}
            </ListArea>
          </Modal>
        </ModalBackdrop>
      )}
    </>
  );
}
