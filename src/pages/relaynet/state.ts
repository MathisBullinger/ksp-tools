import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { Select } from "../../util";

export type Scene = {
  body: Body;
  satellites: {
    count: number;
    altitude: number;
    omniRange: number;
  };
};

export type Body = {
  name?: string;
  radius: number;
};

export const makeDefaultScene = (): Scene => ({
  body: {
    name: "Kerbin",
    radius: 600,
  },
  satellites: {
    count: 4,
    altitude: 1000,
    omniRange: 2000,
  },
});

export type Update = <P extends string[]>(
  ...path: P
) => (value: Select<Scene, P>) => Scene;

export const State = createContext<Scene & { update: Update }>({
  ...makeDefaultScene(),
  update: () => () => makeDefaultScene(),
});

export const useScene = () => useContext(State);
