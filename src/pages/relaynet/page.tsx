import { SceneProvider } from "./scene";
import { Parameters } from "./parameters";
import styles from "./page.module.css";
import { Plot } from "./plot";
import { MetaProvider, Title } from "@solidjs/meta";

const RelayNet = () => (
  <MetaProvider>
    <Title>Satellite planner (Kerbal Space Program)</Title>
    <SceneProvider>
      <div class={styles.page}>
        <Parameters />
        <Plot />
      </div>
    </SceneProvider>
  </MetaProvider>
);

export default RelayNet;
