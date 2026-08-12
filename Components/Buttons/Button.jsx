import { styled } from "styled-components";

const Btn = styled.button`
  border: 1px solid #00000000;
  border-radius: 2px;
  color: black;
  background-color: #ffffff75;
  padding: 3px 7px;
  white-space: nowrap;
  font-size: 12px;
  cursor: pointer;
  ${({ $customStyle }) => $customStyle}
  &:hover {
    background-color: #ffffff26;
    color: #b1b1b1;
  }
  &:active {
    color: grey;
  }
`;

function Button({ title, onClick, style, hintText, ...rest }) {
  return (
    <Btn
      $customStyle={style}
      title={hintText || ""}
      role="button"
      onClick={(e) => onClick && onClick(e)}
      {...rest}
    >
      {`${title}`.toUpperCase()}
    </Btn>
  );
}

export default Button;
