import styled from "styled-components";
import { Plot } from "./plot";
import { Parameters } from "./parameters";
import { useCallback, useMemo, useState } from "preact/hooks";
import { Scene, State, Update, makeDefaultScene } from "./state";
import { Select, setPath } from "../../util";

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
  `,
};
