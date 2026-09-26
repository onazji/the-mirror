import { useCallback, useRef, useState } from "react";
import { Screen } from "./state/screens";
import { createEmptyDraft } from "./state/appState";
import type {
  MirrorDraft,
  MirrorSession,
  PreviousStartResult,
} from "./types/mirror";
import { LocalStorageStore } from "./storage/localStorageStore";
import {
  loadSessions,
  saveSessions,
  createSessionFromDraft,
  appendSession,
} from "./services/sessionService";

import { HomeScreen } from "./screens/HomeScreen";
import { CheckScreen } from "./screens/CheckScreen";
import { ReflectiveTransition } from "./components/ReflectiveTransition";

const store = new LocalStorageStore();

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [draft, setDraft] = useState<MirrorDraft>(createEmptyDraft());
  const [sessions, setSessions] = useState<MirrorSession[]>(() =>
    loadSessions(store)
  );

  const [submitting, setSubmitting] = useState(false);
  const [transition, setTransition] = useState<{
    direction: "down" | "up";
  } | null>(null);
  const transitionTargetRef = useRef<Screen | null>(null);

  const swapToTransitionTarget = useCallback(() => {
    const target = transitionTargetRef.current;
    if (target) {
      setScreen(target);
    }
  }, []);

  const completeTransition = useCallback(() => {
    transitionTargetRef.current = null;
    setTransition(null);
  }, []);

  const navigateWithTransition = (target: Screen) => {
    if (transition || target === screen) return;

    transitionTargetRef.current = target;
    setTransition({
      direction: screen === Screen.HOME ? "down" : "up",
    });
  };

  const goHome = () => {
    setSessions(loadSessions(store));
    setDraft(createEmptyDraft());
    navigateWithTransition(Screen.HOME);
  };

  const saveDraftNow = async () => {
    if (submitting) return;

    setSubmitting(true);

    const session = createSessionFromDraft(draft, Date.now());
    const nextSessions = appendSession(store, session);

    setSessions(nextSessions);

    await new Promise((resolve) => setTimeout(resolve, 650));

    setDraft(createEmptyDraft());
    navigateWithTransition(Screen.HOME);

    setSubmitting(false);
  };

  const updatePreviousStartResult = (
    sessionId: string,
    result: PreviousStartResult
  ) => {
    const nextSessions = sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            previousStartResult: result,
          }
        : session
    );

    saveSessions(store, nextSessions);
    setSessions(nextSessions);
  };

  let screenContent: JSX.Element;

  switch (screen) {
    case Screen.HOME:
      screenContent = (
        <HomeScreen
          sessions={sessions}
          onStart={() => navigateWithTransition(Screen.CHECK)}
          onResult={updatePreviousStartResult}
        />
      );
      break;

    case Screen.CHECK:
      screenContent = (
        <CheckScreen
          draft={draft}
          onChange={setDraft}
          onBack={goHome}
          onNext={saveDraftNow}
          submitting={submitting}
        />
      );
      break;

    default:
      return null;
  }

  return (
    <>
      {screenContent}
      {transition ? (
        <ReflectiveTransition
          direction={transition.direction}
          onSwap={swapToTransitionTarget}
          onComplete={completeTransition}
        />
      ) : null}
    </>
  );
}