import {
  LocationProvider,
  Router,
  Route,
  hydrate,
  prerender as ssr,
} from "preact-iso";

import PageRelayNet from "./pages/relaynet";
import { NotFound } from "./pages/_404.jsx";

export function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={PageRelayNet} />
        <Route default component={NotFound} />
      </Router>
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
