import styled from "styled-components";
import { useScene } from "./state";
import type * as T from "./state";
import { FC } from "preact/compat";

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
        {scene.satellites.count > 0 && (
          <S.Orbit
            r={scene.satellites.altitude + scene.body.radius}
            stroke-width={0.0005 * vMin}
            stroke-dasharray={0.01 * vMin}
          />
        )}
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
            stop-color="#8e9da988"
          />
          <stop offset="100%" stop-color="#8e9da908" />
        </radialGradient>
      </defs>
      <S.Atmosphere height={height} parentRadius={bodyRadius} />
    </>
  );
};

const Satellite: FC<{ index: number; vMin: number }> = ({ index, vMin }) => {
  const { satellites, body } = useScene();
  if (index >= satellites.count) return null;

  const offset = body.radius + satellites.altitude;

  const x =
    offset * Math.sin(Math.PI + 2 * Math.PI * (index / satellites.count));
  const y =
    offset * Math.cos(Math.PI + 2 * Math.PI * (index / satellites.count));

  return (
    <g transform={`translate(${x}, ${y})`}>
      <S.OmniRange r={satellites.omniRange} />
      <S.Satellite r={0.003 * vMin} />
    </g>
  );
};

const S = {
  Container: styled.svg`
    width: 800px;
    height: 800px;
    border: 1px solid #000;
    display: block;
  `,

  Body: styled.circle.attrs<{ radius: number }>(({ radius }) => ({
    cx: 0,
    cy: 0,
    r: radius,
  }))`
    fill: #000;
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
    fill: #000;
  `,

  OmniRange: styled.circle`
    fill: #fdd835;
    opacity: 0.15;
  `,

  Orbit: styled.circle`
    fill: none;
    stroke: #000;
  `,
};
