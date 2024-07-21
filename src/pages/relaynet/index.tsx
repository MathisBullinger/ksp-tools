import styled from "styled-components";
import { Plot } from "./plot";
import { Parameters } from "./parameters";
import { useCallback, useMemo, useState } from "preact/hooks";
import { Scene, State, Update, makeDefaultScene } from "./state";
import { setPath } from "../../util";
// @ts-ignore
import Helmet from "preact-helmet";

const RelayNet = () => {
  const [scene, setScene] = useState(makeDefaultScene);

  const update = useCallback<Update>(
    (...path) =>
      (value) => {
        let updated: Scene | null = null;
        setScene(
          (current) => ((updated = setPath(current)(...path)(value)), updated)
        );
        return updated!;
      },
    []
  );

  const contextValue = useMemo(() => ({ ...scene, update }), [scene, update]);

  return (
    <State.Provider value={contextValue}>
      <Helmet title="Satellite planner (Kerbal Space Program)" />
      <S.Page>
        <Parameters />
        <Plot />
      </S.Page>
    </State.Provider>
  );
};

export default RelayNet;

const S = {
  Page: styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding: 1rem 0;
  `,
};
