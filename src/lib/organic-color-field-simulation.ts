import { createNoise3D } from "simplex-noise";

export type OrganicTone = "light" | "dark";
export type OrganicFieldVariant = "hero" | "footer";

export type OrganicPointer = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
};

export type OrganicSimulationOptions = {
  width: number;
  height: number;
  tone: OrganicTone;
  variant?: OrganicFieldVariant;
  seed?: string;
  reducedMotion?: boolean;
};

type NodePoint = {
  angle: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type BlobConfig = {
  color: string;
  opacity: number;
  xRatio: number;
  yRatio: number;
  rxRatio: number;
  ryRatio: number;
  phase: number;
  mass: number;
  swirl: number;
  drift: number;
};

type BlobColorConfig = {
  color: string;
  opacity: number;
};

type BlobMotionConfig = {
  xRatio: number;
  yRatio: number;
  rxRatio: number;
  ryRatio: number;
  phase: number;
  mass: number;
  swirl: number;
  drift: number;
};

export type OrganicBlob = BlobConfig & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  nodes: NodePoint[];
};

export type OrganicSimulation = {
  width: number;
  height: number;
  tone: OrganicTone;
  variant: OrganicFieldVariant;
  reducedMotion: boolean;
  time: number;
  noise: ReturnType<typeof createNoise3D>;
  blobs: OrganicBlob[];
};

export type OrganicSnapshot = {
  width: number;
  height: number;
  blobs: Array<{
    x: number;
    y: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    nodes: Array<{ x: number; y: number }>;
  }>;
};

const nodeCount = 18;

const toneColors: Record<OrganicTone, BlobColorConfig[]> = {
  light: [
    {
      color: "rgba(222, 173, 137, 0.5)",
      opacity: 0.58,
    },
    {
      color: "rgba(250, 217, 157, 0.52)",
      opacity: 0.6,
    },
    {
      color: "rgba(140, 172, 191, 0.5)",
      opacity: 0.56,
    },
  ],
  dark: [
    {
      color: "rgba(74, 49, 29, 0.58)",
      opacity: 0.62,
    },
    {
      color: "rgba(69, 55, 28, 0.5)",
      opacity: 0.56,
    },
    {
      color: "rgba(30, 50, 66, 0.66)",
      opacity: 0.62,
    },
  ],
};

const variantMotion: Record<OrganicFieldVariant, BlobMotionConfig[]> = {
  hero: [
    {
      xRatio: 0.24,
      yRatio: 0.68,
      rxRatio: 0.25,
      ryRatio: 0.25,
      phase: 0.2,
      mass: 0.9,
      swirl: -1,
      drift: 0.042,
    },
    {
      xRatio: 0.48,
      yRatio: 0.64,
      rxRatio: 0.24,
      ryRatio: 0.24,
      phase: 2.1,
      mass: 1.1,
      swirl: 1,
      drift: 0.05,
    },
    {
      xRatio: 0.76,
      yRatio: 0.66,
      rxRatio: 0.24,
      ryRatio: 0.24,
      phase: 4,
      mass: 1,
      swirl: -0.72,
      drift: 0.044,
    },
  ],
  footer: [
    {
      xRatio: 0.24,
      yRatio: 0.66,
      rxRatio: 0.25,
      ryRatio: 0.25,
      phase: 0.2,
      mass: 0.9,
      swirl: -1,
      drift: 0.042,
    },
    {
      xRatio: 0.5,
      yRatio: 0.62,
      rxRatio: 0.24,
      ryRatio: 0.24,
      phase: 2.1,
      mass: 1.1,
      swirl: 1,
      drift: 0.05,
    },
    {
      xRatio: 0.76,
      yRatio: 0.66,
      rxRatio: 0.24,
      ryRatio: 0.24,
      phase: 4,
      mass: 1,
      swirl: -0.72,
      drift: 0.044,
    },
  ],
};

export function createOrganicSimulation({
  width,
  height,
  tone,
  variant = "hero",
  seed = "fufu-organic-field",
  reducedMotion = false,
}: OrganicSimulationOptions): OrganicSimulation {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const noise = createNoise3D(seededRandom(`${seed}:${tone}:${variant}`));
  const colors = toneColors[tone];
  const fallbackColor = colors[0] ?? {
    color: "rgba(0, 0, 0, 0.5)",
    opacity: 0.5,
  };
  const blobs = variantMotion[variant].map((motion, index) =>
    createBlob(
      { ...motion, ...(colors[index] ?? fallbackColor) },
      safeWidth,
      safeHeight,
    ),
  );
  const simulation = {
    width: safeWidth,
    height: safeHeight,
    tone,
    variant,
    reducedMotion,
    time: 0,
    noise,
    blobs,
  };

  for (const blob of simulation.blobs) {
    containBlob(simulation, blob);
  }

  return simulation;
}

export function resizeOrganicSimulation(
  simulation: OrganicSimulation,
  width: number,
  height: number,
) {
  const nextWidth = Math.max(width, 1);
  const nextHeight = Math.max(height, 1);
  const sx = nextWidth / simulation.width;
  const sy = nextHeight / simulation.height;

  simulation.width = nextWidth;
  simulation.height = nextHeight;

  for (const blob of simulation.blobs) {
    blob.x *= sx;
    blob.y *= sy;
    blob.vx *= sx;
    blob.vy *= sy;
    blob.rx = nextWidth * blob.rxRatio;
    blob.ry = nextHeight * blob.ryRatio;

    for (const node of blob.nodes) {
      node.x *= sx;
      node.y *= sy;
      node.vx *= sx;
      node.vy *= sy;
    }

    containBlob(simulation, blob);
  }
}

export function stepOrganicSimulation(
  simulation: OrganicSimulation,
  pointer: OrganicPointer,
  deltaMs: number,
) {
  if (simulation.reducedMotion) return;

  const dt = Math.min(Math.max(deltaMs / 16.67, 0), 2);
  simulation.time += deltaMs;

  for (const blob of simulation.blobs) {
    const flow = sampleFlow(simulation, blob);
    blob.vx += flow.x * blob.drift * dt;
    blob.vy += flow.y * blob.drift * dt;

    applyPointerForce(simulation, blob, pointer, dt);
    applyBlobSeparation(simulation, blob, dt);

    blob.vx *= 0.972;
    blob.vy *= 0.972;
    blob.vx = clamp(blob.vx, -15, 15);
    blob.vy = clamp(blob.vy, -15, 15);
    blob.x += blob.vx * dt;
    blob.y += blob.vy * dt;

    stepNodes(simulation, blob, dt);
    containBlob(simulation, blob);
  }
}

export function getOrganicSnapshot(
  simulation: OrganicSimulation,
): OrganicSnapshot {
  return {
    width: simulation.width,
    height: simulation.height,
    blobs: simulation.blobs.map((blob) => {
      const bounds = getNodeBounds(blob);

      return {
        x: blob.x,
        y: blob.y,
        ...bounds,
        nodes: blob.nodes.map((node) => ({ x: node.x, y: node.y })),
      };
    }),
  };
}

export function renderOrganicSimulation({
  simulation,
  context,
  scratch,
}: {
  simulation: OrganicSimulation;
  context: CanvasRenderingContext2D;
  scratch: HTMLCanvasElement;
}) {
  const scale = 0.55;
  const width = Math.max(1, Math.ceil(simulation.width * scale));
  const height = Math.max(1, Math.ceil(simulation.height * scale));

  if (scratch.width !== width) scratch.width = width;
  if (scratch.height !== height) scratch.height = height;

  const scratchContext = scratch.getContext("2d");
  if (!scratchContext) return;

  scratchContext.save();
  scratchContext.setTransform(scale, 0, 0, scale, 0, 0);
  scratchContext.clearRect(0, 0, simulation.width, simulation.height);
  scratchContext.globalCompositeOperation = "source-over";

  for (const blob of simulation.blobs) {
    drawBlob(scratchContext, simulation, blob);
  }

  scratchContext.restore();

  context.clearRect(0, 0, simulation.width, simulation.height);
  context.drawImage(scratch, 0, 0, simulation.width, simulation.height);
  fadeCanvasBottomEdge(context, simulation);
}

function fadeCanvasBottomEdge(
  context: CanvasRenderingContext2D,
  simulation: OrganicSimulation,
) {
  const fadeHeight = Math.min(48, Math.max(18, simulation.height * 0.045));
  const gradient = context.createLinearGradient(
    0,
    simulation.height - fadeHeight,
    0,
    simulation.height,
  );

  gradient.addColorStop(0, "rgb(0 0 0 / 0)");
  gradient.addColorStop(1, "rgb(0 0 0 / 1)");

  context.save();
  context.globalCompositeOperation = "destination-out";
  context.fillStyle = gradient;
  context.fillRect(
    0,
    simulation.height - fadeHeight,
    simulation.width,
    fadeHeight,
  );
  context.restore();
}

function createBlob(
  config: BlobConfig,
  width: number,
  height: number,
): OrganicBlob {
  const x = width * config.xRatio;
  const y = height * config.yRatio;
  const rx = width * config.rxRatio;
  const ry = height * config.ryRatio;
  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / nodeCount;

    return {
      angle,
      x: x + Math.cos(angle) * rx,
      y: y + Math.sin(angle) * ry,
      vx: 0,
      vy: 0,
    };
  });

  return {
    ...config,
    x,
    y,
    vx: 0,
    vy: 0,
    rx,
    ry,
    nodes,
  };
}

function stepNodes(
  simulation: OrganicSimulation,
  blob: OrganicBlob,
  dt: number,
) {
  const rotation =
    simulation.noise(blob.phase, 7.7, simulation.time * 0.00016) * 0.28;

  for (const node of blob.nodes) {
    const angle = node.angle + rotation;
    const wobble =
      1 +
      simulation.noise(
        Math.cos(node.angle) * 0.8 + blob.phase,
        Math.sin(node.angle) * 0.8 - blob.phase,
        simulation.time * 0.00055,
      ) *
        0.075;
    const targetX = blob.x + Math.cos(angle) * blob.rx * wobble;
    const targetY = blob.y + Math.sin(angle) * blob.ry * wobble;

    node.vx += (targetX - node.x) * 0.035 * dt;
    node.vy += (targetY - node.y) * 0.035 * dt;

    node.vx *= 0.86;
    node.vy *= 0.86;
  }

  for (let index = 0; index < blob.nodes.length; index += 1) {
    const node = blob.nodes[index];
    const next = blob.nodes[(index + 1) % blob.nodes.length];
    const expected =
      Math.hypot(
        Math.cos(node.angle) * blob.rx - Math.cos(next.angle) * blob.rx,
        Math.sin(node.angle) * blob.ry - Math.sin(next.angle) * blob.ry,
      ) * 0.92;
    const dx = next.x - node.x;
    const dy = next.y - node.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.01) {
      const force = (dist - expected) * 0.008 * dt;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      node.vx += fx;
      node.vy += fy;
      next.vx -= fx;
      next.vy -= fy;
    }
  }

  for (const node of blob.nodes) {
    node.vx = clamp(node.vx, -13, 13);
    node.vy = clamp(node.vy, -13, 13);
    node.x += node.vx * dt;
    node.y += node.vy * dt;
  }

  const average = blob.nodes.reduce(
    (sum, node) => ({
      x: sum.x + node.x,
      y: sum.y + node.y,
    }),
    { x: 0, y: 0 },
  );

  blob.x = blob.x * 0.94 + (average.x / blob.nodes.length) * 0.06;
  blob.y = blob.y * 0.94 + (average.y / blob.nodes.length) * 0.06;
}

function applyPointerForce(
  simulation: OrganicSimulation,
  blob: OrganicBlob,
  pointer: OrganicPointer,
  dt: number,
) {
  if (!pointer.active) return;

  const dx = blob.x - pointer.x;
  const dy = blob.y - pointer.y;
  const dist = Math.hypot(dx, dy);
  const reach = Math.max(blob.rx, blob.ry);

  if (dist <= 0.01 || dist >= reach) return;

  const force = (1 - dist / reach) ** 2;
  const speed = Math.min(pointer.speed, 52);

  if (speed < 0.2) return;

  const pointerDirX = pointer.vx / speed;
  const pointerDirY = pointer.vy / speed;
  const awayX = dx / dist;
  const awayY = dy / dist;
  const approach = clamp(pointerDirX * awayX + pointerDirY * awayY, 0, 1);
  const pushX = pointerDirX * 0.72 + awayX * 0.28;
  const pushY = pointerDirY * 0.72 + awayY * 0.28;
  const pushLength = Math.hypot(pushX, pushY) || 1;
  const speedScale = Math.min(speed / 12, 3);
  const impulse =
    force * (0.35 + approach * 0.9) * speedScale * (10.5 / blob.mass) * dt;
  const tangent = force * approach * speedScale * 0.85 * blob.swirl * dt;

  blob.vx += (pushX / pushLength) * impulse + -awayY * tangent;
  blob.vy += (pushY / pushLength) * impulse + awayX * tangent;
}

function applyBlobSeparation(
  simulation: OrganicSimulation,
  blob: OrganicBlob,
  dt: number,
) {
  for (const other of simulation.blobs) {
    if (other === blob) continue;

    const dx = blob.x - other.x;
    const dy = blob.y - other.y;
    const dist = Math.hypot(dx, dy);
    const separation = Math.min(blob.rx + other.rx, blob.ry + other.ry) * 0.62;

    if (dist > 0.01 && dist < separation) {
      const force = (1 - dist / separation) * 0.58 * dt;
      blob.vx += (dx / dist) * force;
      blob.vy += (dy / dist) * force;
    }
  }
}

function sampleFlow(simulation: OrganicSimulation, blob: OrganicBlob) {
  const time = simulation.time * 0.00016 + blob.phase;
  const x = blob.x * 0.0018;
  const y = blob.y * 0.0018;
  const angle = simulation.noise(x, y, time) * Math.PI * 2;
  const lift = simulation.noise(x + 12.7, y - 4.3, time * 0.9) * 0.32 - 0.05;

  return {
    x: Math.cos(angle) + lift * 0.35,
    y: Math.sin(angle) * 0.72 + lift,
  };
}

function containBlob(simulation: OrganicSimulation, blob: OrganicBlob) {
  const bounds = getNodeBounds(blob);
  let shiftX = 0;
  let shiftY = 0;

  if (bounds.minX < 0) shiftX = -bounds.minX;
  if (bounds.maxX > simulation.width) shiftX = simulation.width - bounds.maxX;
  if (bounds.minY < 0) shiftY = -bounds.minY;
  if (bounds.maxY > simulation.height) shiftY = simulation.height - bounds.maxY;

  if (shiftX !== 0) {
    blob.x += shiftX;
    blob.vx = shiftX > 0 ? Math.abs(blob.vx) * 0.38 : -Math.abs(blob.vx) * 0.38;

    for (const node of blob.nodes) {
      node.x += shiftX;
      node.vx =
        shiftX > 0 ? Math.abs(node.vx) * 0.42 : -Math.abs(node.vx) * 0.42;
    }
  }

  if (shiftY !== 0) {
    blob.y += shiftY;
    blob.vy = shiftY > 0 ? Math.abs(blob.vy) * 0.38 : -Math.abs(blob.vy) * 0.38;

    for (const node of blob.nodes) {
      node.y += shiftY;
      node.vy =
        shiftY > 0 ? Math.abs(node.vy) * 0.42 : -Math.abs(node.vy) * 0.42;
    }
  }
}

function drawBlob(
  context: CanvasRenderingContext2D,
  simulation: OrganicSimulation,
  blob: OrganicBlob,
) {
  const center = getBlobCenter(blob);
  const gradient = context.createRadialGradient(
    center.x,
    center.y,
    Math.min(blob.rx, blob.ry) * 0.05,
    center.x,
    center.y,
    Math.max(blob.rx, blob.ry) * 1.18,
  );
  gradient.addColorStop(0, blob.color);
  gradient.addColorStop(0.38, blob.color);
  gradient.addColorStop(0.72, softenColor(blob.color, 0.34));
  gradient.addColorStop(1, transparentColor(blob.color));

  context.save();
  context.globalAlpha = blob.opacity;
  context.filter = `blur(${getBlurRadius(simulation)}px)`;
  context.fillStyle = gradient;
  drawSmoothPath(context, blob.nodes);
  context.fill();
  context.restore();
}

function getBlurRadius(simulation: OrganicSimulation) {
  if (simulation.variant === "hero") {
    return simulation.width < 640 ? 39 : 33;
  }

  return simulation.width < 640 ? 31 : 26;
}

function drawSmoothPath(
  context: CanvasRenderingContext2D,
  nodes: readonly NodePoint[],
) {
  if (nodes.length === 0) return;

  const first = midpoint(nodes[0], nodes[1]);
  context.beginPath();
  context.moveTo(first.x, first.y);

  for (let index = 1; index <= nodes.length; index += 1) {
    const current = nodes[index % nodes.length];
    const next = nodes[(index + 1) % nodes.length];
    const mid = midpoint(current, next);
    context.quadraticCurveTo(current.x, current.y, mid.x, mid.y);
  }

  context.closePath();
}

function midpoint(a: NodePoint, b: NodePoint) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function getBlobCenter(blob: OrganicBlob) {
  const total = blob.nodes.reduce(
    (sum, node) => ({
      x: sum.x + node.x,
      y: sum.y + node.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / blob.nodes.length,
    y: total.y / blob.nodes.length,
  };
}

function getNodeBounds(blob: OrganicBlob) {
  return blob.nodes.reduce(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.x),
      maxX: Math.max(bounds.maxX, node.x),
      minY: Math.min(bounds.minY, node.y),
      maxY: Math.max(bounds.maxY, node.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}

function transparentColor(color: string) {
  return color.replace(
    /rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^)]+\)/,
    "rgba($1, $2, $3, 0)",
  );
}

function softenColor(color: string, alpha: number) {
  return color.replace(
    /rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^)]+\)/,
    `rgba($1, $2, $3, ${alpha})`,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function seededRandom(seed: string) {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
