import type { Component } from "solid-js";
import styles from "./Toggle.module.css";

export const Toggle: Component<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  id?: string;
}> = (props) => {
  return (
    <input
      class={styles.toggle}
      id={props.id}
      type="checkbox"
      checked={props.enabled}
      onChange={({ target }) => props.onToggle(target.checked)}
    />
  );
};
