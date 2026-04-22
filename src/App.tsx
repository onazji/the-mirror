import { useState } from "react";
import { Screen } from "./state/screens";
import { createEmptyDraft } from "./state/appState";
import type { MirrorDraft, MirrorSession } from "./types/mirror";
import { LocalStorageStore } from "./storage/localStorageStore";
import {
  loadSessions,
  createSessionFromDraft,
  appendSession,
} from "./services/sessionService";

import { HomeScreen } from "./screens/HomeScreen";
import { CheckScreen } from "./screens/CheckScreen";

const store = new LocalStorageStore();

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [draft, setDraft] = useState<MirrorDraft>(createEmptyDraft());
  const [sessions, setSessions] = useState<MirrorSession[]>(() => loadSessions(store));

  const goHome = () => {
    setSessions(loadSessions(store));
    setDraft(createEmptyDraft());
    setScreen(Screen.HOME);
  };

  const saveDraftNow = () => {
    const session = createSessionFromDraft(draft, Date.now());
    const nextSessions = appendSession(store, session);

    setSessions(nextSessions);
    setDraft(createEmptyDraft());
    setScreen(Screen.HOME);
  };

  switch (screen) {
    case Screen.HOME:
      return (
        <HomeScreen
          sessions={sessions}
          onStart={() => setScreen(Screen.CHECK)}
        />
      );

    case Screen.CHECK:
      return (
        <CheckScreen
          draft={draft}
          onChange={setDraft}
          onBack={goHome}
          onNext={saveDraftNow}
        />
      );

    default:
      return null;
  }
}