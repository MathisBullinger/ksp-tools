import type { Component } from "solid-js";
import styles from "./NumericInput.module.css";

export const NumericInput: Component<{
  value: number;
  onChange: (value: number) => void;
  id?: string;
}> = (props) => {
  return (
    <input
      {...props}
      class={styles.input}
      type="number"
      onChange={({ target }) => {
        const value = parseFloat(target.value);
        if (!isNaN(value)) props.onChange(value);
      }}
    />
  );
};
