import styled from "styled-components";
import { useScene } from "./state";
import type * as T from "./state";
import { FC } from "preact/compat";
import { Vec, vec } from "../../util";

export const Plot = () => {
  const scene = useScene();

  const getDefaultVMin = (scene: T.Scene): number =>
    Math.max(
      scene.body.radius * 2,
      (scene.body.radius +
        scene.satellites.altitude +
        scene.satellites.omniRange) *
        2
    ) * 1.2;

  const vMin = getDefaultVMin(scene);

  return (
    <S.Container viewBox={[-vMin / 2, -vMin / 2, vMin, vMin].join(" ")}>
      <g>
        <NightShadow {...scene.body} />
        {[...Array(scene.satellites.count)].map((_, i) => (
          <SatelliteRange key={i} index={i} vMin={vMin} />
        ))}
        {scene.satellites.count > 0 && (
          <S.Orbit
            r={scene.satellites.altitude + scene.body.radius}
            stroke-width={0.0005 * vMin}
            stroke-dasharray={0.01 * vMin}
          />
        )}
        <StableOrbit vMin={vMin} />
        {[...Array(scene.satellites.count)].map((_, i) => (
          <Satellite key={i} index={i} vMin={vMin} />
        ))}
        <Body {...scene.body} />
      </g>
    </S.Container>
  );
};

const Body: FC<T.Body> = ({ radius, atmosphere }) => {
  return (
    <>
      {atmosphere && (
        <Atmosphere height={atmosphere.height} bodyRadius={radius} />
      )}
      <S.Body radius={radius} />
    </>
  );
};

const NightShadow: FC<T.Body> = ({ radius }) => {
  const { ui } = useScene();
  if (!ui.toggles.night) return null;
  return <S.Shadow x={0} y={-radius} width="100%" height={radius * 2} />;
};

const Atmosphere: FC<{ height: number; bodyRadius: number }> = ({
  height,
  bodyRadius,
}) => {
  const { ui } = useScene();

  if (!ui.toggles.atmosphere) return null;
  return (
    <>
      <defs>
        <radialGradient id="atmosphere-gradient">
          <stop
            offset={`${bodyRadius / (bodyRadius + height)}`}
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
      <S.Atmosphere height={height} parentRadius={bodyRadius} />
    </>
  );
};

const Satellite: FC<{ index: number; vMin: number }> = ({ index, vMin }) => {
  const scene = useScene();
  if (index >= scene.satellites.count) return null;

  const [x, y] = getSatellitePosition(scene, index);

  return <S.Satellite r={0.003 * vMin} cx={x} cy={y} />;
};

const SatelliteRange: FC<{ index: number; vMin: number }> = ({
  index,
  vMin,
}) => {
  const scene = useScene();
  if (index >= scene.satellites.count) return null;
  const [x, y] = getSatellitePosition(scene, index);

  const shadowId = `omni-shadow-${index}`;

  return (
    <>
      <defs>
        <mask id={shadowId}>
          <rect x="-50%" y="-50%" width="100%" height="100%" fill="#fff" />
          <OmniShadow index={index} vMin={vMin} />
        </mask>
      </defs>
      <S.OmniRange
        r={scene.satellites.omniRange}
        cx={x}
        cy={y}
        mask={`url(#${shadowId})`}
      />
    </>
  );
};

const OmniShadow: FC<{ index: number; vMin: number }> = ({ index, vMin }) => {
  const scene = useScene();
  const satPos = getSatellitePosition(scene, index);

  const r = scene.body.radius;
  const a = r + scene.satellites.altitude;

  const theta = Math.acos(r / a);

  const tanA = vec.rotate(vec.scale(satPos, r), theta);
  const tanB = vec.rotate(vec.scale(satPos, r), -theta);

  const tanAInf = vec.scale(vec.subtract(tanA, satPos), vMin * 2);
  const tanBInf = vec.scale(vec.subtract(tanB, satPos), vMin * 2);

  const points = [tanA, tanB, tanBInf, tanAInf];

  return <polygon points={points.map((point) => point.join(",")).join(" ")} />;
};

const getSatellitePosition = (
  { body, satellites }: T.Scene,
  index: number
): Vec => {
  const offset = body.radius + satellites.altitude;
  return [
    offset * Math.sin(Math.PI + 2 * Math.PI * (index / satellites.count)),
    offset * Math.cos(Math.PI + 2 * Math.PI * (index / satellites.count)),
  ];
};

const StableOrbit: FC<{ vMin: number }> = ({ vMin }) => {
  const scene = useScene();
  if (!scene.ui.toggles.stable) return null;

  const a = scene.body.radius + scene.satellites.altitude;
  const b = scene.satellites.omniRange;

  const B = Math.PI / scene.satellites.count;

  const A = Math.asin((a * Math.sin(B)) / b);
  const C = Math.PI - A - B;

  const c = Math.sqrt(a ** 2 + b ** 2 - 2 * a * b * Math.cos(C));

  console.log(c);

  if (isNaN(c)) return null;

  return (
    <S.Orbit
      r={c}
      stroke-width={0.0005 * vMin}
      stroke-dasharray={0.01 * vMin}
    />
  );
};

const S = {
  Container: styled.svg`
    width: 800px;
    height: 800px;
    border: 1px solid var(--cl-text);
    display: block;

    --cl-omni: #fdd835;
    --cl-atmosphere: #8e9da9;

    @media (prefers-color-scheme: dark) {
      --cl-omni: #fff59d;
      --cl-atmosphere: #01579b;
    }
  `,

  Body: styled.circle.attrs<{ radius: number }>(({ radius }) => ({
    cx: 0,
    cy: 0,
    r: radius,
  }))`
    fill: var(--cl-text);
  `,

  Atmosphere: styled.circle.attrs<{ height: number; parentRadius: number }>(
    ({ parentRadius, height }) => ({
      cx: 0,
      cy: 0,
      r: parentRadius + height,
    })
  )`
    fill: url(#atmosphere-gradient);
  `,

  Satellite: styled.circle`
    fill: var(--cl-text);
  `,

  OmniRange: styled.circle`
    fill: var(--cl-omni);
    opacity: 0.15;
  `,

  Orbit: styled.circle`
    fill: none;
    stroke: var(--cl-text);
  `,

  Shadow: styled.rect`
    fill: var(--cl-text);
    opacity: 0.1;
  `,
};
