"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { LuMenu } from "react-icons/lu";

const menuItems = [
  { href: "/", label: "JSON Beautifier" },
  { href: "/json-to-xml", label: "JSON to XML" },
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
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
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
    font-size: 20px;
    color: #f3f4f6;
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(17, 21, 26, 0.92);
  color: #4ac8ff;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(22, 27, 31, 1);
    box-shadow: rgba(99, 99, 99, 0.24) 0px 4px 10px 0px;
  }
`;

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

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

            <NavGrid>
              {menuItems.map((item) => (
                <NavLink href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </NavGrid>
          </Modal>
        </ModalBackdrop>
      )}
    </>
  );
}
