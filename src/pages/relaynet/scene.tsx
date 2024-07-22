import { Component, createContext, useContext, type JSX } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

export const Context = createContext<
  Scene & { set: SetStoreFunction<Scene> }
>();
export const useScene = () => useContext(Context)!;

export const defaultScene = (): Scene => ({
  body: {
    name: "Kerbin",
    radius: 600,
    atmosphere: {
      height: 70,
    },
  },
  satellites: {
    count: 3,
    altitude: 500,
    omniRange: 3000,
  },
  ui: {
    toggles: {
      atmosphere: true,
      orbit: true,
      stable: false,
      night: true,
      lineOfSight: true,
    },
  },
});

export const SceneProvider: Component<{ children?: JSX.Element }> = (props) => {
  const [store, setStore] = createStore<Scene>(defaultScene());

  return (
    <Context.Provider value={{ ...store, set: setStore }}>
      {props.children}
    </Context.Provider>
  );
};

export type Scene = {
  body: Body;
  satellites: {
    count: number;
    altitude: number;
    omniRange: number;
  };
  ui: {
    toggles: {
      atmosphere: boolean;
      orbit: boolean;
      stable: boolean;
      night: boolean;
      lineOfSight: boolean;
    };
  };
};

export type Body = {
  name?: string;
  radius: number;
  atmosphere?: {
    height: number;
  };
};
