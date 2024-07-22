import type { Component, JSX } from "solid-js";
import styles from "./parameters.module.css";
import { defaultScene, useScene } from "./scene";
import { NumericInput } from "../../components/NumericInput";
import { ident, select } from "../../util";
import { Toggle } from "../../components/Toggle";
import { Dynamic, Show } from "solid-js/web";

export const Parameters: Component = () => {
  return (
    <form class={styles.container} onSubmit={(e) => e.preventDefault()}>
      <Section title="Celestial Body">
        <Item scenePath={["body", "radius"]}>radius (km)</Item>
        <Item
          scenePath={["body", "atmosphere"]}
          mapStoreValue={(value) => !!value}
          mapInputValue={(enabled) =>
            enabled ? defaultScene().body.atmosphere : undefined
          }
        >
          has atmosphere
        </Item>
        <Item scenePath={["body", "atmosphere", "height"]}>
          atm. height (km)
        </Item>
      </Section>
      <Section title="Satellites">
        <Item scenePath={["satellites", "count"]}>count</Item>
        <Item scenePath={["satellites", "altitude"]}>altitude (km)</Item>
        <Item scenePath={["satellites", "omniRange"]}>omni range (km)</Item>
      </Section>
      <Section title="UI toggles">
        <Item scenePath={["ui", "toggles", "atmosphere"]}>atmosphere</Item>
        <Item scenePath={["ui", "toggles", "orbit"]}>orbit</Item>
        <Item scenePath={["ui", "toggles", "stable"]}>stable</Item>
        <Item scenePath={["ui", "toggles", "night"]}>night shadow</Item>
        <Item scenePath={["ui", "toggles", "lineOfSight"]}>LOS</Item>
      </Section>
    </form>
  );
};

const Section: Component<{ title: string; children?: JSX.Element }> = ({
  title,
  children,
}) => {
  return (
    <div class={styles.section}>
      <span>{title}</span>
      {children}
    </div>
  );
};

const Item = <T,>(props: {
  scenePath: string[];
  children: string;
  mapStoreValue?: (value: unknown) => T;
  mapInputValue?: (value: T) => unknown;
}) => {
  const scene = useScene();
  const storeValue = () =>
    (props.mapStoreValue ?? ident)(select(scene, ...props.scenePath) as any);

  const getId = () =>
    props.scenePath
      .map((key) => key.toLowerCase().replace(/[^a-z]+/g, "-"))
      .join("_");

  const inputs = {
    number: NumericContoller,
    boolean: BooleanController,
  } satisfies Record<string, InputController<any>>;

  return (
    <Show when={(typeof storeValue()) in inputs}>
      <label for={getId()}>{props.children}</label>
      <Dynamic
        component={inputs[typeof storeValue() as keyof typeof inputs]}
        id={getId()}
        value={storeValue()}
        onChange={(value: any) =>
          (scene.set as any)(
            ...props.scenePath,
            (props.mapInputValue ?? ident)(value)
          )
        }
      />
    </Show>
  );
};

type InputController<T> = Component<{
  id: string;
  value: T;
  onChange: (value: T) => void;
}>;

const NumericContoller: InputController<number> = (props) => (
  <NumericInput {...props} />
);

const BooleanController: InputController<boolean> = (props) => (
  <Toggle id={props.id} enabled={props.value} onToggle={props.onChange} />
);
