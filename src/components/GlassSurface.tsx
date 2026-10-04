import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { attachGlassOptics, type GlassOpticsController, type GlassSensorStatus } from "../services/glassOpticsService";
import styles from "./GlassSurface.module.css";

export type GlassSurfaceHandle = {
  requestPermission: () => Promise<GlassSensorStatus>;
};

/** Inert optical surface; deliberately contains no permission or navigation UI. */
export const GlassSurface = forwardRef<GlassSurfaceHandle, { crystallizing: boolean }>(
  function GlassSurface({ crystallizing }, ref) {
    const controller = useRef<GlassOpticsController | null>(null);
    useEffect(() => {
      controller.current = attachGlassOptics(document.documentElement);
      return () => {
        controller.current?.dispose();
        controller.current = null;
      };
    }, []);
    useImperativeHandle(ref, () => ({
      requestPermission: async () => controller.current?.requestPermission() ?? "unavailable",
    }), []);
    return (
      <div
        className={styles.surface}
        data-crystallizing={crystallizing}
        data-mirror-glass=""
        aria-hidden="true"
      />
    );
  },
);