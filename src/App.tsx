import { useCallback, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Screen } from "./state/screens";
import { createEmptyDraft } from "./state/appState";
import type {
  MirrorDraft,
  MirrorSession,
  PreviousStartResult,
} from "./types/mirror";
import type { EchoRecord } from "./types/echo";
import { LocalStorageStore } from "./storage/localStorageStore";
import {
  loadSessionsResult,
  saveSessions,
  createSessionFromDraft,
  appendSession,
  createReflectionExport,
  deleteAllSessions,
  type SessionLoadResult,
} from "./services/sessionService";
import {
  deleteAllEchoes,
  loadEchoStateResult,
  markEchoViewed,
  surfaceEchoForSession,
} from "./services/echoService";

import { HomeScreen } from "./screens/HomeScreen";
import { CheckScreen } from "./screens/CheckScreen";
import {
  ReflectiveTransition,
  REFLECTIVE_TRANSITION_DURATION_MS,
} from "./components/ReflectiveTransition";
import transitionStyles from "./components/ReflectiveTransition.module.css";
import { GlassSurface } from "./components/GlassSurface";
import { EchoInvitation } from "./components/EchoInvitation";
import { EchoComparison } from "./components/EchoComparison";

const store = new LocalStorageStore();

function loadWarning(result: SessionLoadResult): string | null {
  if (result.issues.length === 0) return null;
  const count = result.issues.length;
  return `${count} stored reflection issue${count === 1 ? "" : "s"} detected. Nothing was overwritten. Export includes recovery data.`;
}

export default function App() {
  const [initialLoad] = useState(() => loadSessionsResult(store));
  const [initialEchoLoad] = useState(() =>
    loadEchoStateResult(store, initialLoad.sessions)
  );
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [draft, setDraft] = useState<MirrorDraft>(createEmptyDraft());
  const [sessions, setSessions] = useState<MirrorSession[]>(initialLoad.sessions);
  const [echoes, setEchoes] = useState<EchoRecord[]>(initialEchoLoad.state.records);
  const [dataWarning, setDataWarning] = useState<string | null>(() =>
    loadWarning(initialLoad) ?? initialEchoLoad.issue
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [transition, setTransition] = useState<{
    direction: "down" | "up";
  } | null>(null);
  const transitionTargetRef = useRef<Screen | null>(null);
  const queuedEchoRef = useRef<EchoRecord | null>(null);
  const [pendingEcho, setPendingEcho] = useState<EchoRecord | null>(null);
  const [activeEcho, setActiveEcho] = useState<EchoRecord | null>(null);

  const swapToTransitionTarget = useCallback(() => {
    const target = transitionTargetRef.current;
    if (target) {
      setScreen(target);
    }
  }, []);

  const completeTransition = useCallback(() => {
    transitionTargetRef.current = null;
    setTransition(null);
    if (queuedEchoRef.current) {
      setPendingEcho(queuedEchoRef.current);
      queuedEchoRef.current = null;
    }
  }, []);

  const navigateWithTransition = (target: Screen) => {
    if (transition || target === screen) return;

    transitionTargetRef.current = target;
    setTransition({
      direction: screen === Screen.HOME ? "down" : "up",
    });
  };

  const goHome = () => {
    const result = loadSessionsResult(store);
    setSessions(result.sessions);
    setDataWarning(loadWarning(result));
    setSaveError(null);
    setDraft(createEmptyDraft());
    navigateWithTransition(Screen.HOME);
  };

  const saveDraftNow = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSaveError(null);
    try {
      const session = createSessionFromDraft(draft, Date.now());
      const nextSessions = appendSession(store, session);
      setSessions(nextSessions);
      try {
        const echoResult = surfaceEchoForSession(
          store,
          session,
          nextSessions,
          "free"
        );
        setEchoes(echoResult.state.records);
        queuedEchoRef.current = echoResult.echo;
      } catch (echoError) {
        setDataWarning(
          echoError instanceof Error
            ? echoError.message
            : "Echo data could not be updated. Your reflection was still saved."
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 650));
      setDraft(createEmptyDraft());
      navigateWithTransition(Screen.HOME);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "The reflection could not be saved on this device."
      );
    } finally {
      setSubmitting(false);
    }
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

    try {
      saveSessions(store, nextSessions);
      setSessions(nextSessions);
      setDataWarning(null);
    } catch (error) {
      setDataWarning(
        error instanceof Error
          ? error.message
          : "The reflection update could not be saved."
      );
    }
  };

  const exportReflections = async () => {
    const exportDocument = createReflectionExport(store);
    const contents = JSON.stringify(exportDocument, null, 2);
    const date = exportDocument.exportedAt.slice(0, 10);
    const filename = `the-mirror-reflections-${date}.json`;
    const file = new File([contents], filename, { type: "application/json" });

    if (Capacitor.isNativePlatform()) {
      const canShare = await Share.canShare();
      if (!canShare.value) {
        throw new Error("Android sharing is not available on this device.");
      }

      const { uri } = await Filesystem.writeFile({
        path: filename,
        data: contents,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: "The Mirror reflections",
        files: [uri],
        dialogTitle: "Export reflections",
      });
      return;
    }

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "The Mirror reflections",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const removeAllReflections = () => {
    try {
      deleteAllSessions(store);
      deleteAllEchoes(store);
      setSessions([]);
      setEchoes([]);
      setPendingEcho(null);
      setActiveEcho(null);
      queuedEchoRef.current = null;
      setDraft(createEmptyDraft());
      setDataWarning(null);
    } catch (error) {
      setDataWarning(
        error instanceof Error
          ? error.message
          : "Reflection history could not be deleted from this device."
      );
    }
  };

  const openEcho = (echo: EchoRecord) => {
    try {
      const nextState = markEchoViewed(store, sessions, echo.id);
      setEchoes(nextState.records);
      setActiveEcho({ ...echo, viewed: true });
      setPendingEcho(null);
    } catch (error) {
      setDataWarning(
        error instanceof Error ? error.message : "The Echo could not be opened."
      );
    }
  };

  let screenContent: JSX.Element;

  switch (screen) {
    case Screen.HOME:
      screenContent = (
        <HomeScreen
          sessions={sessions}
          echoes={echoes}
          onStart={() => navigateWithTransition(Screen.CHECK)}
          onResult={updatePreviousStartResult}
          onExport={exportReflections}
          onDeleteAll={removeAllReflections}
          dataWarning={dataWarning}
          onOpenEcho={openEcho}
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
          saveError={saveError}
        />
      );
      break;

    default:
      return null;
  }

  return (
    <>
      <div
        className={transition ? transitionStyles.contentBehindMaterial : undefined}
        style={
          transition
            ? { animationDuration: `${REFLECTIVE_TRANSITION_DURATION_MS}ms` }
            : undefined
        }
      >
        {screenContent}
      </div>
      <GlassSurface crystallizing={transition !== null} />
      {transition ? (
        <ReflectiveTransition
          direction={transition.direction}
          onSwap={swapToTransitionTarget}
          onComplete={completeTransition}
        />
      ) : null}
      {pendingEcho && !transition ? (
        <EchoInvitation
          onExplore={() => openEcho(pendingEcho)}
          onDismiss={() => setPendingEcho(null)}
        />
      ) : null}
      {activeEcho ? (
        <EchoComparison
          echo={activeEcho}
          sessions={sessions}
          onClose={() => setActiveEcho(null)}
        />
      ) : null}
    </>
  );
}
