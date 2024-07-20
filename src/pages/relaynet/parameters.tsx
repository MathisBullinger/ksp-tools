import styled from "styled-components";
import { useScene } from "./state";
import { select, setPath } from "../../util";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { FC } from "preact/compat";

export const Parameters = () => {
  return (
    <S.Container
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Item valuePath={["body", "radius"]}>radius (km)</Item>
    </S.Container>
  );
};

const Item = ({
  children: label,
  valuePath,
}: {
  children: string;
  valuePath: string[];
}) => {
  return (
    <>
      <label for={getId(valuePath)}>{label}</label>
      <NumericController valuePath={valuePath} />
    </>
  );
};

const inputController =
  <T,>(
    typeCheck: (value: unknown) => value is T,
    Component: FC<{
      inputId: string;
      value: T;
      onChange: (value: T) => void;
      commit: () => void;
    }>
  ): FC<{ valuePath: string[] }> =>
  ({ valuePath }) => {
    const scene = useScene();
    const storedValue = select(scene, ...valuePath);
    // const storedValueRef = useRef(storedValue)
    // storeV

    const [inputValue, setInputValue] = useState<T>(storedValue as any);

    useLayoutEffect(() => {
      setInputValue(storedValue as any);
    }, [storedValue]);

    if (!typeCheck(storedValue)) return null;
    return (
      <Component
        inputId={getId(valuePath)}
        value={inputValue}
        onChange={setInputValue}
        commit={() => scene.update(...valuePath)(inputValue as any)}
      />
    );
  };

const NumericController = inputController(
  (value): value is number => typeof value === "number",
  ({ inputId, value, onChange, commit }) => {
    return (
      <NumericInput
        id={inputId}
        value={value}
        onChange={onChange}
        onBlur={commit}
      />
    );
  }
);

const NumericInput = ({
  id,
  value,
  onChange,
  onBlur,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
}) => {
  return (
    <input
      id={id}
      type="number"
      value={value}
      onChange={({ currentTarget }) =>
        onChange(parseFloat(currentTarget.value))
      }
      onBlur={onBlur}
    />
  );
};

const getId = (path: string[]): string =>
  path.map((key) => key.toLowerCase().replace(/[^a-z]+/g, "-")).join("_");

const S = {
  Container: styled("form")`
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.5em;

    > * {
      height: fit-content;
    }
  `,
};
