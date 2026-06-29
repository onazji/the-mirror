import { Button } from "./Button";
import { lightHaptic } from "../utils/haptics";

type Props = {
  anchor: boolean | null;
  integrity: boolean | null;
  onChange: (next: { anchor: boolean; integrity: boolean }) => void;
};

export function SeerSection({ anchor, integrity, onChange }: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* QUESTION 1 */}
      <div>
        <div style={{ marginBottom: 6 }}>
          Did you show up for what matters to you today?
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Yes"
            kind={anchor === true ? "primary" : "secondary"}
            onClick={() => {
              lightHaptic();
              onChange({ anchor: true, integrity: integrity ?? false });
            }}
          />

          <Button
            label="No"
            kind={anchor === false ? "primary" : "secondary"}
            onClick={() => {
              lightHaptic();
              onChange({ anchor: false, integrity: integrity ?? false });
            }}
          />
        </div>
      </div>

      {/* QUESTION 2 */}
      <div>
        <div style={{ marginBottom: 6 }}>
          Did you stay true to yourself today?
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Yes"
            kind={integrity === true ? "primary" : "secondary"}
            onClick={() => {
              lightHaptic();
              onChange({ anchor: anchor ?? false, integrity: true });
            }}
          />

          <Button
            label="No"
            kind={integrity === false ? "primary" : "secondary"}
            onClick={() => {
              lightHaptic();
              onChange({ anchor: anchor ?? false, integrity: false });
            }}
          />
        </div>
      </div>
    </div>
  );
}