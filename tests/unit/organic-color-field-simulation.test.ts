import { describe, expect, it } from "vitest";
import {
  createOrganicSimulation,
  getOrganicSnapshot,
  resizeOrganicSimulation,
  stepOrganicSimulation,
} from "@/lib/organic-color-field-simulation";

describe("organic color field simulation", () => {
  it("keeps soft-body blobs inside field bounds after strong pointer forces", () => {
    const simulation = createOrganicSimulation({
      width: 960,
      height: 540,
      tone: "light",
      seed: "bounds-test",
    });

    for (let index = 0; index < 240; index += 1) {
      stepOrganicSimulation(
        simulation,
        {
          x: index % 2 === 0 ? 40 : 920,
          y: index % 3 === 0 ? 40 : 500,
          active: true,
        },
        16.67,
      );
    }

    const snapshot = getOrganicSnapshot(simulation);

    for (const blob of snapshot.blobs) {
      expect(blob.minX).toBeGreaterThanOrEqual(0);
      expect(blob.maxX).toBeLessThanOrEqual(snapshot.width);
      expect(blob.minY).toBeGreaterThanOrEqual(0);
      expect(blob.maxY).toBeLessThanOrEqual(snapshot.height);
    }
  });

  it("keeps node positions finite while springs deform the blobs", () => {
    const simulation = createOrganicSimulation({
      width: 1180,
      height: 620,
      tone: "dark",
      seed: "finite-test",
    });

    for (let index = 0; index < 180; index += 1) {
      stepOrganicSimulation(
        simulation,
        {
          x: 590 + Math.sin(index * 0.2) * 340,
          y: 310 + Math.cos(index * 0.17) * 180,
          active: true,
        },
        16.67,
      );
    }

    const snapshot = getOrganicSnapshot(simulation);

    for (const blob of snapshot.blobs) {
      expect(Number.isFinite(blob.x)).toBe(true);
      expect(Number.isFinite(blob.y)).toBe(true);

      for (const node of blob.nodes) {
        expect(Number.isFinite(node.x)).toBe(true);
        expect(Number.isFinite(node.y)).toBe(true);
      }
    }
  });

  it("does not advance when reduced motion is enabled", () => {
    const simulation = createOrganicSimulation({
      width: 960,
      height: 540,
      tone: "light",
      seed: "reduced-motion-test",
      reducedMotion: true,
    });
    const before = getOrganicSnapshot(simulation);

    stepOrganicSimulation(simulation, { x: 480, y: 270, active: true }, 1000);

    expect(getOrganicSnapshot(simulation)).toEqual(before);
  });

  it("preserves relative placement after resize", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 500,
      tone: "light",
      seed: "resize-test",
    });
    const before = getOrganicSnapshot(simulation);

    resizeOrganicSimulation(simulation, 1500, 750);

    const after = getOrganicSnapshot(simulation);

    expect(after.blobs[0]?.x).toBeCloseTo((before.blobs[0]?.x ?? 0) * 1.5, 4);
    expect(after.blobs[0]?.y).toBeCloseTo((before.blobs[0]?.y ?? 0) * 1.5, 4);
    expect(after.width).toBe(1500);
    expect(after.height).toBe(750);
  });
});
