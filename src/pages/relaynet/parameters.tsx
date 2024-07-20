import styled from "styled-components";
import { Scene, makeDefaultScene, useScene } from "./state";
import { Select, ident, select } from "../../util";
import { useCallback, useLayoutEffect, useRef, useState } from "preact/hooks";
import { FC } from "preact/compat";

export const Parameters = () => {
  const scene = useScene();

  return (
    <S.Container
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <S.SectionTitle>Celestial Body</S.SectionTitle>
      <Item valuePath={["body", "radius"]}>radius (km)</Item>
      <Item
        valuePath={["body", "atmosphere"] as const}
        mapStoreValue={(atmosphere) => !!atmosphere}
        mapInputValue={(exists) =>
          exists ? makeDefaultScene().body.atmosphere : undefined
        }
      >
        atmosphere
      </Item>
      <Item
        valuePath={["body", "atmosphere", "height"]}
        condition={scene.body.atmosphere !== undefined}
      >
        height (km)
      </Item>
      <S.SectionTitle>Satellites</S.SectionTitle>
      <Item valuePath={["satellites", "count"]}>count</Item>
      <Item valuePath={["satellites", "altitude"]}>altitude (km)</Item>
      <Item valuePath={["satellites", "omniRange"]}>omni range (km)</Item>
      <S.SectionTitle>UI toggles</S.SectionTitle>
      <Item valuePath={["ui", "toggles", "atmosphere"]}>atmosphere</Item>
      <Item valuePath={["ui", "toggles", "orbit"]}>orbit</Item>
      <Item valuePath={["ui", "toggles", "stable"]}>stable</Item>
      <Item valuePath={["ui", "toggles", "night"]}>night shadow</Item>
    </S.Container>
  );
};

const Item = <P extends string[], T>({
  children: label,
  condition,
  ...props
}: {
  children: string;
  valuePath: P;
  mapStoreValue?: (value: Select<Scene, P>) => T;
  mapInputValue?: (value: T) => Select<Scene, P>;
  condition?: boolean;
}) => {
  if (condition === false) return null;
  return (
    <>
      <S.Label for={getId(props.valuePath)}>{label}</S.Label>
      <NumericController {...props} />
      <BooleanController {...props} />
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
  ): FC<{
    valuePath: string[];
    mapStoreValue?: (value: any) => unknown;
    mapInputValue?: (value: any) => unknown;
  }> =>
  ({ valuePath, mapStoreValue, mapInputValue }) => {
    const scene = useScene();
    const storedValue = select(scene, ...valuePath);

    const [inputValue, setInputState] = useState<T>(storedValue as any);
    const inputValueRef = useRef(inputValue);
    inputValueRef.current = inputValue;

    const mapInputRef = useRef<(value: any) => any>(ident);
    mapInputRef.current = mapInputValue ?? ident;

    const setInputValue = useCallback((value: T) => {
      const mappedValue = mapInputRef.current(value);
      setInputState(mappedValue);
      inputValueRef.current = mappedValue;
    }, []);

    useLayoutEffect(() => {
      setInputValue(storedValue as any);
    }, [storedValue]);

    const storedValueMapped = (mapStoreValue ?? ident)(storedValue);

    if (!typeCheck(storedValueMapped)) return null;
    return (
      <Component
        inputId={getId(valuePath)}
        value={inputValue}
        onChange={setInputValue}
        commit={() => scene.update(...valuePath)(inputValueRef.current as any)}
      />
    );
  };

const NumericController = inputController(
  (value): value is number => typeof value === "number",
  ({ inputId, value, onChange, commit }) => (
    <NumericInput
      id={inputId}
      value={value}
      onChange={onChange}
      onBlur={commit}
    />
  )
);

const BooleanController = inputController(
  (value): value is boolean => typeof value === "boolean",
  ({ inputId, value, onChange, commit }) => (
    <Checkbox
      id={inputId}
      checked={value}
      onChange={(value) => {
        onChange(value);
        commit();
      }}
    />
  )
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
}) => (
  <S.NumberInput
    id={id}
    value={value}
    onChange={({ currentTarget }) => onChange(parseFloat(currentTarget.value))}
    onBlur={onBlur}
  />
);

const Checkbox = ({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <S.Checkbox
    id={id}
    checked={checked}
    onChange={({ currentTarget }) => onChange(currentTarget.checked)}
  />
);

const getId = (path: string[]): string =>
  path.map((key) => key.toLowerCase().replace(/[^a-z]+/g, "-")).join("_");

const S = {
  Container: styled("form")`
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.5em;
    grid-auto-rows: min-content;
  `,

  SectionTitle: styled.span`
    grid-column: 1 / -1;
    text-align: center;
    font-weight: 500;
    font-variant: small-caps;
    align-items: center;
    background-color: #0000000b;
  `,

  Label: styled.label`
    text-align: right;
  `,

  NumberInput: styled("input").attrs({ type: "number" })`
    width: 12ch;
  `,

  Checkbox: styled("input").attrs({ type: "checkbox" })`
    width: fit-content;
    cursor: pointer;
    margin: 0 0.2em;
  `,
};
