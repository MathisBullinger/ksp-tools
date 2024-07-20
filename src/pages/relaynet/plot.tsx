import styled from "styled-components";
import { useState } from "preact/hooks";
import { Body, Scene, useScene } from "./state";

export const Plot = () => {
  const scene = useScene();

  const getDefaultVMin = (scene: Scene): number =>
    Math.max(
      scene.body.radius * 2,
      (scene.body.radius +
        scene.satellites.altitude +
        scene.satellites.omniRange) *
        2
    ) * 1.2;

  const [vMin, setVmin] = useState(() => getDefaultVMin(scene));

  console.log("render plot");

  return (
    <S.Container viewBox={[-vMin / 2, -vMin / 2, vMin, vMin].join(" ")}>
      {[...Array(scene.satellites.count)].map((_, i) => (
        <Satellite key={i} index={i} vMin={vMin} />
      ))}
      <S.Body body={scene.body} />
    </S.Container>
  );
};

const Satellite = ({ index, vMin }: { index: number; vMin: number }) => {
  const { satellites, body } = useScene();
  if (index >= satellites.count) return;

  const offset = body.radius + satellites.altitude;

  const x = offset * Math.sin(2 * Math.PI * (index / satellites.count));
  const y = offset * Math.cos(2 * Math.PI * (index / satellites.count));

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

  Body: styled.circle.attrs<{ body: Body }>((props) => ({
    cx: 0,
    cy: 0,
    r: props.body.radius,
    fill: "#000",
  }))``,

  Satellite: styled.circle`
    fill: #000;
  `,

  OmniRange: styled.circle`
    fill: #fdd835;
    opacity: 0.15;
  `,
};
