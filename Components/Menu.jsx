"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { LuSearch } from "react-icons/lu";
import { FaTools } from "react-icons/fa";

const menuItems = [
  { href: "/", label: "JSON Beautifier" },
  { href: "/json-minify", label: "JSON Minifier" },
  { href: "/json-to-xml", label: "JSON to XML" },
  { href: "/xml-to-json", label: "XML to JSON" },
  { href: "/json-to-csv", label: "JSON to CSV" },
  { href: "/csv-to-json", label: "CSV to JSON" },
  { href: "/gzip-decompressor", label: "GZip Decompress" },
];

const MenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 90px;
  height: 38px;
  padding: 0 14px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;

  background: rgba(50, 53, 58, 0.9);
  color: #f3f4f6;

  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;

  svg {
    color: #109dcc;
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }

  &:hover {
    background: #109dcc;
    border-color: #109dcc;
    transform: translateY(-1px);

    svg {
      color: #ffffff;
      transform: rotate(10deg);
    }
  }

  &:active {
    transform: translateY(0);
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

  background: rgba(9, 12, 16, 0.76);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 999;
`;

const Modal = styled.div`
  width: min(88vw, 1100px);
  height: min(78vh, 700px);

  background: linear-gradient(
    180deg,
    rgba(35, 38, 43, 0.98),
    rgba(21, 24, 29, 0.96)
  );

  border-radius: 18px;

  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);

  padding: 18px 16px 16px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  display: flex;
  flex-direction: column;

  overflow: hidden;
  overflow-x: hidden;
`;

const ModalHeader = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;

  min-height: 36px;

  h3 {
    margin: 0;

    color: #109dcc;

    font-size: clamp(24px, 3vw, 36px);

    font-weight: 400;

    letter-spacing: 2px;

    text-align: center;
  }
`;

const CloseButton = styled.button`
  position: absolute;

  right: 0;
  top: 50%;

  transform: translateY(-50%);

  border: none;

  background: rgba(255, 255, 255, 0.08);

  color: #f3f4f6;

  font-size: 24px;

  cursor: pointer;

  border-radius: 10px;

  width: 42px;
  height: 42px;

  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const NavGrid = styled.div`
  flex: 1;

  min-height: 0;

  overflow-y: auto;

  overscroll-behavior: contain;

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 16px;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBar = styled.div`
  position: relative;

  width: 100%;
  max-width: 620px;

  margin: 0 auto 16px;

  svg {
    position: absolute;

    left: 16px;
    top: 50%;

    color: #109dcc;

    pointer-events: none;

    transform: translateY(-50%);
  }
`;

const SearchInput = styled.input`
  width: 100%;

  min-height: 42px;

  padding: 10px 16px 10px 46px;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 12px;

  background: rgba(9, 12, 16, 0.38);

  color: #f3f4f6;

  font: inherit;

  font-size: 16px;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: rgba(243, 244, 246, 0.6);
  }

  &:focus {
    border-color: #109dcc;

    box-shadow: 0 0 0 3px rgba(16, 157, 204, 0.18);
  }
`;

const EmptyState = styled.p`
  grid-column: 1 / -1;

  margin: 24px 0;

  color: rgba(243, 244, 246, 0.72);

  text-align: center;
`;

const NavLink = styled(Link)`
  display: flex;

  align-items: center;
  justify-content: center;

  min-height: 150px;

  padding: 14px;

  border-radius: 16px;

  background: linear-gradient(145deg, #ffffff, #f1f4f5);

  color: #109dcc;

  text-decoration: none;

  font-size: clamp(18px, 2.2vw, 30px);

  font-style: italic;

  font-weight: 400;

  letter-spacing: 2px;

  line-height: 1.25;

  text-align: center;

  text-transform: uppercase;

  border: 1px solid rgba(215, 222, 225, 0.8);

  box-shadow: 0 10px 24px rgba(8, 31, 42, 0.16);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);

    background: linear-gradient(145deg, #ffffff, #e1f3f7);

    box-shadow: 0 14px 28px rgba(8, 31, 42, 0.2);
  }

  @media (max-width: 600px) {
    min-height: 120px;

    padding: 14px;

    font-size: clamp(18px, 6vw, 27px);

    letter-spacing: 1px;
  }
`;

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <MenuButton
        type="button"
        aria-label="Open site navigation menu"
        onClick={() => setIsOpen(true)}
      >
        <FaTools size={16} />
        <span>Tools</span>
      </MenuButton>

      {isOpen && (
        <ModalBackdrop onClick={() => setIsOpen(false)}>
          <Modal onClick={(event) => event.stopPropagation()}>
            <ModalHeader>
              <h3>Search Tools</h3>

              <CloseButton
                type="button"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                ×
              </CloseButton>
            </ModalHeader>

            <SearchBar>
              <LuSearch size={18} aria-hidden="true" />

              <SearchInput
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search tools"
                aria-label="Search navigation tools"
              />
            </SearchBar>

            <NavGrid>
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <NavLink
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))
              ) : (
                <EmptyState>No tools found.</EmptyState>
              )}
            </NavGrid>
          </Modal>
        </ModalBackdrop>
      )}
    </>
  );
}