import { describe, expect, it } from "vitest";
import {
  createOrganicSimulation,
  getOrganicSnapshot,
  resizeOrganicSimulation,
  stepOrganicSimulation,
} from "@/lib/organic-color-field-simulation";
import type {
  OrganicBlob,
  OrganicPointer,
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

  it("repels a body point from a stationary cursor", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "stationary-repel-test",
    });
    const idle = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "stationary-repel-test",
    });
    const start = getOrganicSnapshot(simulation).blobs[0];
    expect(start).toBeDefined();
    const radius =
      Math.max(
        (start?.maxX ?? 0) - (start?.minX ?? 0),
        (start?.maxY ?? 0) - (start?.minY ?? 0),
      ) * 0.5;

    for (let index = 0; index < 60; index += 1) {
      stepOrganicSimulation(
        idle,
        { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
        16.67,
      );
      stepOrganicSimulation(
        simulation,
        {
          x: (start?.x ?? 0) - radius * 0.8,
          y: start?.y ?? 0,
          vx: 0,
          vy: 0,
          speed: 0,
          active: true,
        },
        16.67,
      );
    }

    const after = getOrganicSnapshot(simulation).blobs[0];
    const idleAfter = getOrganicSnapshot(idle).blobs[0];

    expect((after?.x ?? 0) - (idleAfter?.x ?? 0)).toBeGreaterThan(0);
  });

  it("keeps cursor repulsion independent from cursor velocity", () => {
    const slow = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "velocity-independent-test",
    });
    const fast = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "velocity-independent-test",
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

    expect(fastMove).toBeCloseTo(slowMove, 5);
  });

  it("ramps cursor repulsion gradually as distance closes", () => {
    const createStillSimulation = () => {
      const simulation = createOrganicSimulation({
        width: 1000,
        height: 600,
        tone: "light",
        seed: "repulsion-ramp-test",
      });

      for (const blob of simulation.blobs) {
        blob.drift = 0;
      }

      return simulation;
    };
    const idle = createStillSimulation();
    const far = createStillSimulation();
    const mid = createStillSimulation();
    const near = createStillSimulation();
    const start = getOrganicSnapshot(idle).blobs[0];
    expect(start).toBeDefined();
    const radius =
      Math.max(
        (start?.maxX ?? 0) - (start?.minX ?? 0),
        (start?.maxY ?? 0) - (start?.minY ?? 0),
      ) * 0.5;
    const pointerAt = (distance: number): OrganicPointer => ({
      x: (start?.x ?? 0) - distance,
      y: start?.y ?? 0,
      vx: 0,
      vy: 0,
      speed: 0,
      active: true,
    });

    stepOrganicSimulation(
      idle,
      { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
      16.67,
    );
    stepOrganicSimulation(far, pointerAt(radius * 1.75), 16.67);
    stepOrganicSimulation(mid, pointerAt(radius * 1), 16.67);
    stepOrganicSimulation(near, pointerAt(radius * 0.42), 16.67);

    const idleMove =
      (getOrganicSnapshot(idle).blobs[0]?.x ?? 0) - (start?.x ?? 0);
    const farMove =
      (getOrganicSnapshot(far).blobs[0]?.x ?? 0) - (start?.x ?? 0) - idleMove;
    const midMove =
      (getOrganicSnapshot(mid).blobs[0]?.x ?? 0) - (start?.x ?? 0) - idleMove;
    const nearMove =
      (getOrganicSnapshot(near).blobs[0]?.x ?? 0) - (start?.x ?? 0) - idleMove;

    expect(farMove).toBeGreaterThanOrEqual(0);
    expect(midMove).toBeGreaterThan(farMove);
    expect(nearMove).toBeGreaterThan(midMove);
    expect(nearMove).toBeLessThan(radius * 0.3);
  });

  it("caps the first-frame jump when the cursor starts on a body point", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "close-cursor-jump-test",
    });
    const blob = simulation.blobs[1];
    expect(blob).toBeDefined();
    if (!blob) return;

    for (const currentBlob of simulation.blobs) {
      currentBlob.drift = 0;
    }

    const start = getOrganicSnapshot(simulation).blobs[1];
    const radius = Math.max(blob.rx, blob.ry);

    stepOrganicSimulation(
      simulation,
      {
        x: blob.x,
        y: blob.y,
        vx: 0,
        vy: 0,
        speed: 0,
        active: true,
      },
      16.67,
    );

    const after = getOrganicSnapshot(simulation).blobs[1];
    const movement = Math.hypot(
      (after?.x ?? 0) - (start?.x ?? 0),
      (after?.y ?? 0) - (start?.y ?? 0),
    );

    expect(movement).toBeLessThan(radius * 0.08);
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

  it("gently drifts a body point away from a resting cursor", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "exclusion-test",
    });
    const blob = simulation.blobs[1];
    expect(blob).toBeDefined();
    if (!blob) return;

    const pointer = {
      x: blob.x,
      y: blob.y,
      vx: 0,
      vy: 0,
      speed: 0,
      active: true,
    };
    const gentleClearance = getBodyRadiusForTest(blob) * 0.9;

    for (let index = 0; index < 160; index += 1) {
      stepOrganicSimulation(simulation, pointer, 16.67);
    }

    const after = getOrganicSnapshot(simulation).blobs[1];
    const distance = Math.hypot(
      (after?.x ?? 0) - pointer.x,
      (after?.y ?? 0) - pointer.y,
    );

    expect(distance).toBeGreaterThanOrEqual(gentleClearance * 0.85);
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

    translateBlobForTest(second, first.x + first.rx * 0.35, first.y);
    let previousDistance = Math.hypot(second.x - first.x, second.y - first.y);

    for (let index = 0; index < 12; index += 1) {
      stepOrganicSimulation(
        simulation,
        { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
        16.67,
      );

      const currentDistance = Math.hypot(
        second.x - first.x,
        second.y - first.y,
      );
      expect(currentDistance).toBeGreaterThanOrEqual(previousDistance * 0.98);
      previousDistance = currentDistance;
    }

    expect(previousDistance).toBeGreaterThan(first.rx * 0.35);
  });

  it("does not park idle blobs in section corners", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "idle-corner-test",
    });

    for (const blob of simulation.blobs) {
      blob.drift = 0;
    }

    for (let index = 0; index < 720; index += 1) {
      stepOrganicSimulation(
        simulation,
        { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
        16.67,
      );
    }

    const snapshot = getOrganicSnapshot(simulation);

    for (const blob of snapshot.blobs) {
      const nearHorizontalWall =
        blob.minX <= 1 || blob.maxX >= snapshot.width - 1;
      const nearVerticalWall =
        blob.minY <= 1 || blob.maxY >= snapshot.height - 1;

      expect(nearHorizontalWall && nearVerticalWall).toBe(false);
    }
  });

  it("lets a resting cursor slowly herd a wall-adjacent blob inward", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "wall-herding-test",
    });
    const blob = simulation.blobs[0];
    expect(blob).toBeDefined();
    if (!blob) return;

    for (const currentBlob of simulation.blobs) {
      currentBlob.drift = 0;
    }

    const startX = blob.x;
    const pointer = {
      x: blob.x - blob.rx * 0.7,
      y: blob.y,
      vx: 0,
      vy: 0,
      speed: 0,
      active: true,
    };

    for (let index = 0; index < 120; index += 1) {
      stepOrganicSimulation(simulation, pointer, 16.67);
    }

    expect(blob.x - startX).toBeGreaterThan(getBodyRadiusForTest(blob) * 0.08);
    expect(
      getOrganicSnapshot(simulation).blobs[0]?.minX,
    ).toBeGreaterThanOrEqual(0);
  });

  it("settles cursor-driven motion after the cursor leaves", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "settle-after-cursor-test",
    });
    const blob = simulation.blobs[0];
    expect(blob).toBeDefined();
    if (!blob) return;

    for (const currentBlob of simulation.blobs) {
      currentBlob.drift = 0;
    }

    const pointer = {
      x: blob.x - blob.rx * 0.65,
      y: blob.y,
      vx: 0,
      vy: 0,
      speed: 0,
      active: true,
    };
    let maxDrivenSpeed = 0;

    for (let index = 0; index < 120; index += 1) {
      stepOrganicSimulation(simulation, pointer, 16.67);
      maxDrivenSpeed = Math.max(maxDrivenSpeed, Math.hypot(blob.vx, blob.vy));
    }

    for (let index = 0; index < 360; index += 1) {
      stepOrganicSimulation(
        simulation,
        { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
        16.67,
      );
    }

    expect(Math.hypot(blob.vx, blob.vy)).toBeLessThan(maxDrivenSpeed * 0.55);
  });

  it("lets cursor influence temporarily soften blob separation", () => {
    const idle = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "separation-yield-test",
    });
    const active = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "separation-yield-test",
    });
    const [idleFirst, idleSecond] = idle.blobs;
    const [activeFirst, activeSecond] = active.blobs;
    expect(idleFirst).toBeDefined();
    expect(idleSecond).toBeDefined();
    expect(activeFirst).toBeDefined();
    expect(activeSecond).toBeDefined();
    if (!idleFirst || !idleSecond || !activeFirst || !activeSecond) return;

    for (const simulation of [idle, active]) {
      for (const blob of simulation.blobs) {
        blob.drift = 0;
      }
    }

    translateBlobForTest(
      idleSecond,
      idleFirst.x + idleFirst.rx * 0.35,
      idleFirst.y,
    );
    translateBlobForTest(
      activeSecond,
      activeFirst.x + activeFirst.rx * 0.35,
      activeFirst.y,
    );
    activeFirst.cursorInfluence = 1;
    activeSecond.cursorInfluence = 1;

    stepOrganicSimulation(
      idle,
      { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
      16.67,
    );
    stepOrganicSimulation(
      active,
      { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
      16.67,
    );

    const idleDistance = Math.hypot(
      idleSecond.x - idleFirst.x,
      idleSecond.y - idleFirst.y,
    );
    const activeDistance = Math.hypot(
      activeSecond.x - activeFirst.x,
      activeSecond.y - activeFirst.y,
    );

    expect(activeDistance).toBeLessThan(idleDistance);
  });

  it("lets cursor pressure overcome stacked blob separation", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "cursor-overcomes-separation-test",
    });
    const [first, second, third] = simulation.blobs;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();
    if (!first || !second || !third) return;

    for (const blob of simulation.blobs) {
      blob.drift = 0;
    }

    translateBlobForTest(second, first.x + first.rx * 0.12, first.y);
    translateBlobForTest(third, first.x - first.rx * 0.12, first.y);
    const before = getOrganicSnapshot(simulation);

    for (let index = 0; index < 18; index += 1) {
      stepOrganicSimulation(
        simulation,
        {
          x: first.x - first.rx * 0.35,
          y: first.y,
          vx: 0,
          vy: 0,
          speed: 0,
          active: true,
        },
        16.67,
      );
    }

    const after = getOrganicSnapshot(simulation);
    const firstMove = after.blobs[0]?.x ?? 0;
    const previousFirst = before.blobs[0]?.x ?? 0;

    expect(firstMove).toBeGreaterThan(previousFirst);
  });

  it("keeps stacked blobs from jumping under cursor pressure", () => {
    const simulation = createOrganicSimulation({
      width: 1000,
      height: 600,
      tone: "light",
      seed: "stacked-motion-budget-test",
    });
    const [first, second, third] = simulation.blobs;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();
    if (!first || !second || !third) return;

    for (const blob of simulation.blobs) {
      blob.drift = 0;
    }

    translateBlobForTest(second, first.x + first.rx * 0.1, first.y);
    translateBlobForTest(third, first.x - first.rx * 0.08, first.y);
    const before = getOrganicSnapshot(simulation);

    stepOrganicSimulation(
      simulation,
      {
        x: first.x,
        y: first.y,
        vx: 60,
        vy: 0,
        speed: 60,
        active: true,
      },
      16.67,
    );

    const after = getOrganicSnapshot(simulation);
    const maxMovement = Math.max(
      ...after.blobs.map((blob, index) => {
        const previous = before.blobs[index];

        return Math.hypot(blob.x - previous.x, blob.y - previous.y);
      }),
    );

    expect(maxMovement).toBeLessThan(first.rx * 0.14);
  });
});

function getBodyRadiusForTest(blob: OrganicBlob) {
  return Math.max(blob.rx, blob.ry) * 0.46;
}

function translateBlobForTest(blob: OrganicBlob, nextX: number, nextY: number) {
  const dx = nextX - blob.x;
  const dy = nextY - blob.y;
  blob.x = nextX;
  blob.y = nextY;

  for (const node of blob.nodes) {
    node.x += dx;
    node.y += dy;
  }
}
