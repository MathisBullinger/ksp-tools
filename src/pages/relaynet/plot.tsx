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
        {[...Array(scene.satellites.count)].map((_, i) => (
          <Satellite key={i} index={i} vMin={vMin} />
        ))}
        <Body {...scene.body} />
      </g>
    </S.Container>
  );
};

const Body = ({ radius, atmosphere }: T.Body) => {
  return (
    <>
      {atmosphere && (
        <S.Atmosphere height={atmosphere.height} parentRadius={radius} />
      )}
      <S.Body radius={radius} />
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
    fill: #0002;
  `,

  Satellite: styled.circle`
    fill: #000;
  `,

  OmniRange: styled.circle`
    fill: #fdd835;
    opacity: 0.15;
  `,
};
