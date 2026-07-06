import { describe, expect, it } from "vitest";
import {
  createOrganicSimulation,
  getOrganicSnapshot,
  resizeOrganicSimulation,
  stepOrganicSimulation,
} from "@/lib/organic-color-field-simulation";
import type { OrganicPointer } from "@/lib/organic-color-field-simulation";

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
          vx: index % 2 === 0 ? -26 : 26,
          vy: index % 3 === 0 ? -18 : 18,
          speed: 32,
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
          vx: Math.cos(index * 0.2) * 28,
          vy: -Math.sin(index * 0.17) * 22,
          speed: 34,
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

    stepOrganicSimulation(
      simulation,
      { x: 480, y: 270, vx: 40, vy: 0, speed: 40, active: true },
      1000,
    );

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

  it("moves a body point farther when cursor approach speed is higher", () => {
    const slow = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "speed-test",
    });
    const fast = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "speed-test",
    });
    const start = getOrganicSnapshot(slow).blobs[0];
    expect(start).toBeDefined();
    const reach =
      Math.max(
        (start?.maxX ?? 0) - (start?.minX ?? 0),
        (start?.maxY ?? 0) - (start?.minY ?? 0),
      ) * 0.5;

    const slowPointer: OrganicPointer = {
      x: (start?.x ?? 0) - reach * 0.8,
      y: start?.y ?? 0,
      vx: 4,
      vy: 0,
      speed: 4,
      active: true,
    };
    const fastPointer: OrganicPointer = {
      ...slowPointer,
      vx: 34,
      speed: 34,
    };

    stepOrganicSimulation(slow, slowPointer, 16.67);
    stepOrganicSimulation(fast, fastPointer, 16.67);

    const slowMove =
      (getOrganicSnapshot(slow).blobs[0]?.x ?? 0) - (start?.x ?? 0);
    const fastMove =
      (getOrganicSnapshot(fast).blobs[0]?.x ?? 0) - (start?.x ?? 0);

    expect(fastMove).toBeGreaterThan(slowMove);
  });

  it("uses the same body-point interaction for the footer variant", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 520,
      tone: "dark",
      variant: "footer",
      seed: "footer-interaction-test",
    });
    const start = getOrganicSnapshot(simulation).blobs[1];
    expect(start).toBeDefined();
    const reach =
      Math.max(
        (start?.maxX ?? 0) - (start?.minX ?? 0),
        (start?.maxY ?? 0) - (start?.minY ?? 0),
      ) * 0.5;

    stepOrganicSimulation(
      simulation,
      {
        x: (start?.x ?? 0) - reach * 0.75,
        y: start?.y ?? 0,
        vx: 32,
        vy: 0,
        speed: 32,
        active: true,
      },
      16.67,
    );

    const after = getOrganicSnapshot(simulation).blobs[1];

    expect((after?.x ?? 0) - (start?.x ?? 0)).toBeGreaterThan(0);
  });

  it("repels blob bodies before they visually group together", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "separation-test",
    });
    const [first, second] = simulation.blobs;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;

    const translate = (blob: typeof first, nextX: number, nextY: number) => {
      const dx = nextX - blob.x;
      const dy = nextY - blob.y;
      blob.x = nextX;
      blob.y = nextY;
      for (const node of blob.nodes) {
        node.x += dx;
        node.y += dy;
      }
    };

    translate(second, first.x + first.rx * 0.35, first.y);
    const before = second.x - first.x;

    for (let index = 0; index < 12; index += 1) {
      stepOrganicSimulation(
        simulation,
        { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
        16.67,
      );
    }

    expect(second.x - first.x).toBeGreaterThan(before);
  });
});
