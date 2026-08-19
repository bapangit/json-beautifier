"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { LuMenu, LuSearch } from "react-icons/lu";

const menuItems = [
  { href: "/", label: "JSON Beautifier" },
  { href: "/json-minify", label: "JSON Minifier" },
  { href: "/json-to-xml", label: "JSON to XML" },
  { href: "/json-to-csv", label: "JSON to CSV" },
  { href: "/csv-to-json", label: "CSV to JSON" },
  { href: "/xml-to-json", label: "XML to JSON" },
];

const MenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(50, 53, 58, 0.9);
  color: #f3f4f6;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(34, 37, 42, 1);
    transform: translateY(-1px);
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
  width: min(92vw, 1500px);
  height: min(86vh, 880px);
  background: linear-gradient(180deg, rgba(35, 38, 43, 0.98), rgba(21, 24, 29, 0.96));
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  padding: 22px 18px 18px;
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
  margin-bottom: 18px;
  min-height: 42px;

  h3 {
    margin: 0;
    color: #109dcc;
    font-size: clamp(30px, 4vw, 48px);
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

  &:hover {
    background: rgba(255, 255, 255, 0.12);
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
  max-width: 620px;
  margin: 0 auto 22px;

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
  min-height: 48px;
  padding: 10px 16px 10px 46px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(9, 12, 16, 0.38);
  color: #f3f4f6;
  font: inherit;
  font-size: 16px;
  outline: none;

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
  min-height: 220px;
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(145deg, #ffffff, #f1f4f5);
  color: #109dcc;
  text-decoration: none;
  font-size: clamp(22px, 2.7vw, 38px);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 2px;
  line-height: 1.25;
  text-align: center;
  text-transform: uppercase;
  border: 1px solid rgba(215, 222, 225, 0.8);
  box-shadow: 0 10px 24px rgba(8, 31, 42, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: linear-gradient(145deg, #ffffff, #e9f0f2);
    box-shadow: 0 14px 28px rgba(8, 31, 42, 0.2);
  }

  @media (max-width: 600px) {
    min-height: 150px;
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
        <LuMenu size={18} />
      </MenuButton>

      {isOpen && (
        <ModalBackdrop onClick={() => setIsOpen(false)}>
          <Modal onClick={(event) => event.stopPropagation()}>
            <ModalHeader>
              <h3>More Tools</h3>
              <CloseButton type="button" aria-label="Close menu" onClick={() => setIsOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <SearchBar>
              <LuSearch size={18} aria-hidden="true" />
              <SearchInput
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tools"
                aria-label="Search navigation tools"
              />
            </SearchBar>

            <NavGrid>
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <NavLink href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
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
