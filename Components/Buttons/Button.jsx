import { styled } from "styled-components";

const Btn = styled.button`
  border: 1px solid #8bd8d0;
  border-radius: 4px;
  color: #12343b;
  background-color: #dff5f1;
  padding: 3px 8px;
  width: 150px;
  min-width: 150px;
  flex-shrink: 0;
  height: 28px;
  min-height: 28px;

  white-space: nowrap;
  font-size: 12px;
  cursor: pointer;

  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;

  ${({ $customStyle }) => $customStyle}

  &:hover {
    background-color: #b8e8e1;
    color: #0f4c5c;
  }

  &:active {
    color: #0f766e;
  }

  .button-icon {
    width: 14px;
    height: 14px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;
  }

  .button-icon svg {
    width: 100%;
    height: 100%;
  }
`;

function Button({ title, icon, onClick, style, hintText, ...rest }) {
  return (
    <Btn
      $customStyle={style}
      title={hintText || ""}
      role="button"
      onClick={(e) => onClick && onClick(e)}
      {...rest}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {title && <span>{`${title}`.toUpperCase()}</span>}
    </Btn>
  );
}

export default Button;