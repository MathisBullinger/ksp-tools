import {
  Component,
  For,
  Show,
  createContext,
  createMemo,
  useContext,
} from "solid-js";
import styles from "./plot.module.css";
import { useScene } from "./scene";
import { type Vec, vec } from "../../util";

const PlotContext = createContext({ vMin: () => 100 as number });
const usePlot = () => useContext(PlotContext);

export const Plot: Component = () => {
  const scene = useScene();

  const getVMin = () =>
    Math.max(
      scene.body.radius * 2,
      (scene.body.radius +
        scene.satellites.altitude +
        scene.satellites.omniRange) *
        2
    ) * 1.2;

  const viewBox = (): [x: number, y: number, width: number, height: number] => {
    const vMin = getVMin();
    return [-vMin / 2, -vMin / 2, vMin, vMin];
  };

  return (
    <PlotContext.Provider value={{ vMin: getVMin }}>
      <svg class={styles.svg} viewBox={viewBox().join(" ")}>
        <For each={Array(scene.satellites.count)}>
          {(_, index) => <SatelliteRange index={index()} />}
        </For>
        <SatellitesOrbit />
        <Body />
        <For each={Array(scene.satellites.count)}>
          {(_, index) => (
            <LineOfSight
              satelliteIndices={[
                index(),
                (index() + 1) % scene.satellites.count,
              ]}
            />
          )}
        </For>
        <For each={Array(scene.satellites.count)}>
          {(_, index) => <Satellite index={index()} />}
        </For>
        <StableOrbit />
      </svg>
    </PlotContext.Provider>
  );
};

const Body: Component = () => {
  const scene = useScene();
  return (
    <>
      <Atmosphere />
      <NightShadow />
      <circle class={styles.body} cx={0} cy={0} r={scene.body.radius} />
    </>
  );
};

const Atmosphere: Component = () => {
  const scene = useScene();
  return (
    <Show when={scene.body.atmosphere && scene.ui.toggles.atmosphere}>
      <defs>
        <radialGradient id="atmosphere-gradient">
          <stop
            offset={`${scene.body.radius / (scene.body.radius + scene.body.atmosphere!.height)}`}
            stop-color="var(--cl-atmosphere)"
            stop-opacity="50%"
          />
          <stop
            offset="100%"
            stop-color="var(--cl-atmosphere)"
            stop-opacity="10%"
          />
        </radialGradient>
      </defs>
      <circle
        r={scene.body.radius + scene.body.atmosphere!.height}
        fill="url(#atmosphere-gradient)"
      />
    </Show>
  );
};

const NightShadow: Component = () => {
  const scene = useScene();

  return (
    <Show when={scene.ui.toggles.night}>
      <rect
        x={0}
        y={-scene.body.radius}
        width="100%"
        height={scene.body.radius * 2}
        class={styles.shadow}
      />
    </Show>
  );
};

const SatellitesOrbit: Component = () => {
  const scene = useScene();
  const { vMin } = usePlot();

  return (
    <Show when={scene.satellites.count > 0 && scene.ui.toggles.orbit}>
      <circle
        r={scene.satellites.altitude + scene.body.radius}
        stroke-width={0.0005 * vMin()}
        stroke-dasharray={(0.01 * vMin()).toString()}
        class={styles.orbit}
      />
    </Show>
  );
};

const Satellite: Component<{ index: number }> = (props) => {
  const scene = useScene();
  const { vMin } = usePlot();

  const position = createMemo(() =>
    getSatellitePosition(
      scene.body.radius + scene.satellites.altitude,
      scene.satellites.count,
      props.index
    )
  );

  return (
    <circle
      class={styles.satellite}
      r={0.003 * vMin()}
      cx={position()[0]}
      cy={position()[1]}
    />
  );
};

const LineOfSight: Component<{ satelliteIndices: [number, number] }> = (
  props
) => {
  const scene = useScene();
  const { vMin } = usePlot();

  const separation = createMemo(() => {
    const r = scene.body.radius + scene.satellites.altitude;
    const a = (2 * Math.PI) / scene.satellites.count;
    const r2s = 2 * r ** 2;
    return Math.sqrt(r2s - r2s * Math.cos(a));
  });

  const hasConnection = createMemo(() => {
    const s = separation();
    if (s > scene.satellites.omniRange) return false;
    const a = scene.body.radius + scene.satellites.altitude;
    if (Math.sqrt(a ** 2 - (s / 2) ** 2) < scene.body.radius) return false;
    return true;
  });

  const position = createMemo(() => {
    const getPos = (index: number) =>
      getSatellitePosition(
        scene.body.radius + scene.satellites.altitude,
        scene.satellites.count,
        index
      );
    return [
      getPos(props.satelliteIndices[0]),
      getPos(props.satelliteIndices[1]),
    ];
  });

  return (
    <Show when={scene.ui.toggles.lineOfSight && scene.satellites.count > 0}>
      <line
        x1={position()[0][0]}
        y1={position()[0][1]}
        x2={position()[1][0]}
        y2={position()[1][1]}
        stroke-width={0.0005 * vMin()}
        stroke={`var(--cl-${hasConnection() ? "positive" : "negative"})`}
      />
    </Show>
  );
};

const getSatellitePosition = (
  radius: number,
  count: number,
  index: number
): Vec => [
  radius * Math.sin(Math.PI + 2 * Math.PI * (index / count)),
  radius * Math.cos(Math.PI + 2 * Math.PI * (index / count)),
];

const SatelliteRange: Component<{ index: number }> = (props) => {
  const scene = useScene();
  const { vMin } = usePlot();

  const position = createMemo(() =>
    getSatellitePosition(
      scene.body.radius + scene.satellites.altitude,
      scene.satellites.count,
      props.index
    )
  );

  const shadowVertices = () => {
    const r = scene.body.radius;
    const a = r + scene.satellites.altitude;

    const theta = Math.acos(r / a);

    const tanA = vec.rotate(vec.scale(position(), r), theta);
    const tanB = vec.rotate(vec.scale(position(), r), -theta);

    const tanAInf = vec.scale(vec.subtract(tanA, position()), vMin() * 2);
    const tanBInf = vec.scale(vec.subtract(tanB, position()), vMin() * 2);

    return [tanA, tanB, tanBInf, tanAInf];
  };

  const shadowId = () => `omni-shadow-${props.index}`;

  return (
    <>
      <mask id={shadowId()}>
        <rect x="-50%" y="-50%" width="100%" height="100%" fill="#fff" />
        <polygon
          points={shadowVertices()
            .map((point) => point.join(","))
            .join(" ")}
        />
      </mask>
      <circle
        class={styles.omniRange}
        r={scene.satellites.omniRange}
        cx={position()[0]}
        cy={position()[1]}
        mask={`url(#${shadowId()})`}
      />
    </>
  );
};

const StableOrbit: Component = () => {
  const scene = useScene();
  const { vMin } = usePlot();

  const stableAltitude = createMemo(() => {
    const a = scene.body.radius + scene.satellites.altitude;
    const b = scene.satellites.omniRange;

    const B = Math.PI / scene.satellites.count;

    const A = Math.asin((a * Math.sin(B)) / b);
    const C = Math.PI - A - B;

    return Math.sqrt(a ** 2 + b ** 2 - 2 * a * b * Math.cos(C));
  });

  return (
    <Show when={scene.ui.toggles.stable}>
      <circle
        class={styles.orbit}
        r={stableAltitude()}
        stroke-width={0.0005 * vMin()}
        stroke-dasharray={(0.01 * vMin()).toString()}
      />
    </Show>
  );
};
