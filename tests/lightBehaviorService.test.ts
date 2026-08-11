import { describe, expect, it } from "vitest";
import { getLightBehavior } from "../src/services/lightBehaviorService";

describe("Light Behavior Presence × Focus matrix", () => {
  it("maps all nine combinations independently of Mirror State", () => {
    expect(getLightBehavior("relaxed", "narrow")).toBe("emergent");
    expect(getLightBehavior("relaxed", "wide")).toBe("receptive");
    expect(getLightBehavior("relaxed", "scattered")).toBe("dissonant");

    expect(getLightBehavior("content", "narrow")).toBe("faithful");
    expect(getLightBehavior("content", "wide")).toBe("gracious");
    expect(getLightBehavior("content", "scattered")).toBe("wandering");

    expect(getLightBehavior("tense", "narrow")).toBe("constricted");
    expect(getLightBehavior("tense", "wide")).toBe("burdened");
    expect(getLightBehavior("tense", "scattered")).toBe("fractured");
  });
});