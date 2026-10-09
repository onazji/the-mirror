import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

type Props = {
  reflectionCount: number;
  onExport: () => Promise<void>;
  onDeleteAll: () => void;
};

export function ReflectionDataControls({
  reflectionCount,
  onExport,
  onDeleteAll,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportReflections = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await onExport();
      setMessage("Your reflection file is ready.");
    } catch {
      setMessage("The reflection file could not be created. Nothing was changed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Card title="Your reflection data">
        <div style={{ display: "grid", gap: 12 }}>
          <div className="small">
            Stored only on this device. Export a copy anytime, or permanently delete
            every reflection from this installation.
          </div>
          <Button
            label={exporting ? "Preparing export..." : "Export reflections"}
            onClick={exportReflections}
            kind="secondary"
            disabled={exporting}
          />
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={reflectionCount === 0}
            style={{
              minHeight: 44,
              borderRadius: 14,
              border: "1px solid rgba(132, 42, 66, 0.28)",
              background: "rgba(255,255,255,0.48)",
              color: reflectionCount === 0 ? "var(--muted)" : "#842a42",
              fontWeight: 700,
              cursor: reflectionCount === 0 ? "default" : "pointer",
              opacity: reflectionCount === 0 ? 0.55 : 1,
            }}
          >
            Delete reflection history
          </button>
          {message ? (
            <div className="small" role="status">
              {message}
            </div>
          ) : null}
        </div>
      </Card>

      {confirmingDelete ? (
        <div
          role="presentation"
          onClick={() => setConfirmingDelete(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(28,27,53,0.42)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-reflections-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 430px)",
              padding: 24,
              borderRadius: 24,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 24px 64px rgba(28,27,53,0.22)",
            }}
          >
            <h2 id="delete-reflections-title" style={{ margin: "0 0 10px" }}>
              Delete all reflections?
            </h2>
            <p style={{ margin: "0 0 20px", color: "var(--muted)", lineHeight: 1.5 }}>
              This permanently removes {reflectionCount} reflection
              {reflectionCount === 1 ? "" : "s"} from this device. Export first if
              you want to keep a copy.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <Button
                label="Cancel"
                onClick={() => setConfirmingDelete(false)}
                kind="secondary"
              />
              <button
                type="button"
                onClick={() => {
                  onDeleteAll();
                  setConfirmingDelete(false);
                }}
                style={{
                  minHeight: 48,
                  border: 0,
                  borderRadius: 14,
                  background: "#842a42",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete all reflections
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
