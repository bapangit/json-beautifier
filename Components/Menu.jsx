"use client";

import { useState } from "react";
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
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #111827;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  width: min(420px, calc(100vw - 24px));
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.32);
  padding: 22px 18px 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;

  h3 {
    margin: 0;
    font-size: 20px;
    color: #111827;
  }
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: #374151;
  font-size: 24px;
  cursor: pointer;
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
  background: #f3f4f6;
  color: #111827;
  text-decoration: none;
  font-weight: 600;
  text-align: center;

  &:hover {
    background: #e5e7eb;
  }
`;

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

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
              <h3>Navigate</h3>
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
