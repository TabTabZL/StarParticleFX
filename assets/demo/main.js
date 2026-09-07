import { EFFECTS } from "./catalog.js";

const TAU = Math.PI * 2;
const canvas = document.querySelector("#particle-field");
const context = canvas.getContext("2d", { alpha: false });
const effectNameZh = document.querySelector("#effect-name-zh");
const effectNameEn = document.querySelector("#effect-name-en");
const effectFeeling = document.querySelector("#effect-feeling");
const effectCount = document.querySelector("#effect-count");
const effectNav = document.querySelector("#effect-nav");
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const captureMode = new URLSearchParams(window.location.search).has("capture");

document.body.dataset.capture = String(captureMode);

let width = 1;
let height = 1;
let pixelRatio = 1;
let particles = [];
let links = [];
let currentIndex = 0;
let modeStartedAt = performance.now();
let animationFrame = 0;
let visible = !document.hidden;
let hiddenAt = 0;
let backgroundGradient;

const pointer = { x: 0, y: 0, active: false };
const output = { x: 0, y: 0, size: 1, alpha: 0.5, tailX: 0, tailY: 0, hasTail: false, palette: 0 };

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function fract(value) {
  return value - Math.floor(value);
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function smooth(value) {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
}

function pulse(time, rise = 2.8, hold = 1.8, fall = 1.6) {
  const duration = rise + hold + fall;
  const phase = time % duration;
  if (phase < rise) return smooth(phase / rise);
  if (phase < rise + hold) return 1;
  return 1 - smooth((phase - rise - hold) / fall);
}

function targetPoints(count) {
  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = 480;
  targetCanvas.height = 240;
  const targetContext = targetCanvas.getContext("2d", { willReadFrequently: true });
  targetContext.fillStyle = "#fff";
  targetContext.font = "900 178px Arial Black, sans-serif";
  targetContext.textAlign = "center";
  targetContext.textBaseline = "middle";
  targetContext.fillText("FX", 240, 126);
  const pixels = targetContext.getImageData(0, 0, 480, 240).data;
  const candidates = [];

  for (let y = 18; y < 222; y += 3) {
    for (let x = 18; x < 462; x += 3) {
      if (pixels[(y * 480 + x) * 4 + 3] > 128) candidates.push([x, y]);
    }
  }

  const random = mulberry32(43021);
  return Array.from({ length: count }, () => {
    const [x, y] = candidates[Math.floor(random() * candidates.length)];
    return {
      x: (x / 480 - 0.5) * 1.7 + (random() - 0.5) * 0.012,
      y: (y / 240 - 0.5) * 0.84 + (random() - 0.5) * 0.012,
    };
  });
}

function createParticles() {
  const area = width * height;
  const count = Math.round(clamp(area / 430, 1_150, 2_600));
  const random = mulberry32(94731);
  const targets = targetPoints(count);

  particles = Array.from({ length: count }, (_, index) => {
    const angle = random() * TAU;
    const radius = Math.sqrt(random());
    return {
      index,
      x: (random() - 0.5) * 2.8,
      y: (random() - 0.5) * 1.8,
      u: random(),
      v: random(),
      z: random(),
      angle,
      radius,
      size: 0.48 + Math.pow(random(), 5) * 2.2,
      group: Math.floor(random() * 12),
      tx: targets[index].x,
      ty: targets[index].y,
      sx: 0,
      sy: 0,
      tailSx: 0,
      tailSy: 0,
      drawAlpha: 0,
      drawSize: 1,
      palette: 0,
      hasTail: false,
    };
  });

  links = [];
  const nodeCount = Math.min(170, particles.length);
  for (let index = 0; index < nodeCount; index += 1) {
    let nearest = -1;
    let nearestDistance = Infinity;
    for (let candidate = index + 1; candidate < nodeCount; candidate += 1) {
      const dx = particles[index].x - particles[candidate].x;
      const dy = particles[index].y - particles[candidate].y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    if (nearest >= 0 && nearestDistance < 0.09) links.push([index, nearest]);
  }
}

function evaluate(effectIndex, particle, time, result) {
  let x = particle.x;
  let y = particle.y;
  let size = particle.size;
  let alpha = 0.24 + particle.v * 0.42;
  let palette = particle.group % 3;
  let tailX = x;
  let tailY = y;
  let hasTail = false;

  switch (effectIndex) {
    case 0: {
      const progress = pulse(time, 2.6, 2.2, 1.4);
      const drift = (1 - progress) * 0.16;
      const orbit = particle.angle + time * (0.18 + particle.v * 0.16);
      x = lerp(particle.x, particle.tx, progress) + Math.cos(orbit) * drift;
      y = lerp(particle.y, particle.ty, progress) + Math.sin(orbit) * drift;
      alpha *= 0.72 + progress * 0.28;
      size *= 0.88 + progress * 0.34;
      break;
    }
    case 1: {
      x = particle.x + Math.sin(time * 0.35 + particle.angle) * 0.018;
      y = particle.y + Math.cos(time * 0.29 + particle.angle) * 0.018;
      alpha *= 0.7 + 0.3 * Math.sin(time * 0.7 + particle.u * 12) ** 2;
      break;
    }
    case 2: {
      const galaxy = particle.group % 3;
      const centers = [[-0.5, -0.04], [0.54, 0.08], [0.05, 0.3]];
      const radius = 0.04 + Math.pow(particle.u, 0.58) * (galaxy === 2 ? 0.42 : 0.68);
      const arm = (particle.group % 4) * TAU / 4;
      const angle = particle.angle * 0.16 + arm + radius * 8.2 + time * (0.34 - radius * 0.2);
      x = centers[galaxy][0] + Math.cos(angle) * radius;
      y = centers[galaxy][1] + Math.sin(angle) * radius * 0.54 + (particle.v - 0.5) * 0.08;
      alpha *= 0.66 + (1 - radius) * 0.42;
      size *= 0.72 + (1 - radius) * 0.48;
      break;
    }
    case 3: {
      const collapse = smooth(clamp((time % 6.2) / 4.5));
      const radius = Math.hypot(particle.x, particle.y) + 0.08;
      const angle = Math.atan2(particle.y, particle.x) + collapse * (2.2 + 2.8 / radius);
      const compressed = radius * lerp(1, 0.035, collapse ** 1.45);
      x = Math.cos(angle) * compressed;
      y = Math.sin(angle) * compressed * 0.72;
      tailX = Math.cos(angle - 0.09 - collapse * 0.16) * compressed * (1 + collapse * 0.34);
      tailY = Math.sin(angle - 0.09 - collapse * 0.16) * compressed * 0.72 * (1 + collapse * 0.34);
      hasTail = collapse > 0.2;
      alpha *= 0.6 + collapse * 0.3;
      break;
    }
    case 4: {
      const cycle = time % 5.8;
      const blast = smooth(clamp((cycle - 1.25) / 2.7));
      const anticipation = smooth(clamp(cycle / 1.25));
      const radius = lerp(0.055 + particle.radius * 0.11 * anticipation, 0.18 + particle.radius * 1.7, blast);
      const angle = particle.angle + Math.sin(particle.u * 20) * 0.08;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius * 0.76;
      tailX = Math.cos(angle) * Math.max(0, radius - 0.05 - blast * 0.12);
      tailY = Math.sin(angle) * Math.max(0, radius - 0.05 - blast * 0.12) * 0.76;
      hasTail = blast > 0.08 && blast < 0.92;
      alpha *= lerp(0.74 + anticipation * 0.24, 0.5, blast);
      size *= 0.8 + anticipation * 0.35;
      palette = particle.group % 3;
      break;
    }
    case 5: {
      const depth = 0.12 + fract(particle.z + time * (0.1 + particle.v * 0.05));
      x = particle.x * 0.42 / depth;
      y = particle.y * 0.42 / depth;
      const previousDepth = Math.min(1.12, depth + 0.085);
      tailX = particle.x * 0.42 / previousDepth;
      tailY = particle.y * 0.42 / previousDepth;
      hasTail = true;
      alpha *= clamp(1.1 - depth * 0.48, 0.28, 0.82);
      size *= clamp(1.18 - depth * 0.44, 0.65, 1.12);
      break;
    }
    case 6: {
      const lensX = pointer.active ? pointer.x : Math.sin(time * 0.43) * 0.46;
      const lensY = pointer.active ? pointer.y : Math.cos(time * 0.31) * 0.24;
      const dx = particle.x - lensX;
      const dy = particle.y - lensY;
      const radius = Math.hypot(dx, dy) + 0.08;
      const influence = smooth(1 - clamp(radius / 0.66));
      const angle = Math.atan2(dy, dx) + influence * 0.62;
      const bentRadius = radius + influence * 0.12;
      x = lensX + Math.cos(angle) * bentRadius;
      y = lensY + Math.sin(angle) * bentRadius;
      alpha *= 0.72 + influence * 0.38;
      size *= 0.8 + influence * 0.45;
      break;
    }
    case 7: {
      const breath = Math.sin(time * 0.68) * 0.5 + 0.5;
      x = particle.x * (0.88 + breath * 0.1) + Math.sin(particle.y * 3.2 + time * 0.28 + particle.angle) * 0.12;
      y = particle.y * (0.9 + breath * 0.08) + Math.cos(particle.x * 2.6 - time * 0.24 + particle.angle) * 0.1;
      alpha *= 0.54 + breath * 0.3 + particle.u * 0.1;
      palette = (particle.group + Math.floor(time * 0.18)) % 3;
      break;
    }
    case 8: {
      const orbit = particle.group % 6;
      const radius = 0.16 + orbit * 0.14 + (particle.u - 0.5) * 0.045;
      const angle = particle.angle + time * (0.48 / (orbit + 1) + 0.04);
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius * (0.42 + orbit * 0.045);
      alpha *= 0.74 + (5 - orbit) * 0.035;
      size *= orbit === 0 ? 1.2 : 0.9;
      break;
    }
    case 9: {
      const fall = fract(particle.u + time * (0.045 + particle.v * 0.045));
      x = particle.x + Math.sin(time * 0.5 + particle.angle) * 0.055;
      y = -1.05 + fall * 2.08;
      const settle = smooth(clamp((fall - 0.72) / 0.28));
      const skyline = 0.72 + Math.sin(x * 8.5) * 0.11 + Math.sin(x * 19) * 0.045;
      y = lerp(y, skyline, settle * 0.86);
      alpha *= 0.5 + fall * 0.34;
      break;
    }
    case 10: {
      const fold = Math.sin(time * 0.63) * 1.05;
      const side = particle.x < 0 ? -1 : 1;
      const localX = Math.abs(particle.x);
      const cosine = Math.cos(fold * side);
      x = localX * cosine * side;
      y = particle.y + Math.sin(particle.x * 3.4 + time * 0.45) * 0.13;
      const depth = localX * Math.sin(fold * side);
      size *= 0.82 + clamp(depth + 0.4, 0, 0.62);
      alpha *= 0.64 + clamp(depth + 0.5, 0, 0.28);
      break;
    }
    case 11: {
      const generation = particle.group % 4;
      const parentAngle = Math.floor(particle.u * 9) / 9 * TAU;
      const parentRadius = 0.22 + (particle.group % 3) * 0.25;
      const growth = smooth(clamp((time % 6 - generation * 0.55) / 2.4));
      const branch = (particle.v - 0.5) * (0.08 + generation * 0.06) * growth;
      x = Math.cos(parentAngle) * parentRadius + Math.cos(particle.angle + time * 0.25) * branch;
      y = Math.sin(parentAngle) * parentRadius * 0.66 + Math.sin(particle.angle + time * 0.25) * branch;
      alpha *= 0.48 + growth * 0.38;
      size *= 1.06 - generation * 0.11;
      break;
    }
    case 12: {
      const freeze = pulse(time, 3, 2.6, 1.5);
      const snappedX = Math.round(particle.x * 7) / 7;
      const snappedY = Math.round((particle.y + (Math.round(particle.x * 7) % 2) * 0.07) * 7) / 7;
      const threshold = clamp((particle.x + 1.45) / 2.9);
      const localFreeze = smooth(clamp((freeze - threshold * 0.6) / 0.4));
      x = lerp(particle.x + Math.sin(time + particle.angle) * 0.03, snappedX, localFreeze);
      y = lerp(particle.y + Math.cos(time * 0.8 + particle.angle) * 0.03, snappedY, localFreeze);
      alpha *= 0.65 + localFreeze * 0.3;
      break;
    }
    case 13: {
      const stream = particle.group % 5;
      const progress = fract(particle.u + time * (0.035 + stream * 0.003));
      x = -1.48 + progress * 2.96;
      const center = (stream - 2) * 0.28;
      y = center + Math.sin(progress * TAU * (1.2 + stream * 0.07) + stream) * 0.16 + (particle.v - 0.5) * 0.12;
      tailX = x - 0.06;
      tailY = center + Math.sin((progress - 0.02) * TAU * (1.2 + stream * 0.07) + stream) * 0.16 + (particle.v - 0.5) * 0.12;
      hasTail = true;
      alpha *= 0.68;
      palette = stream % 3;
      break;
    }
    case 14: {
      const migration = pulse(time, 2.8, 2.1, 1.4);
      const band = particle.group % 3;
      const targetX = (band - 1) * 0.78 + (particle.u - 0.5) * 0.5;
      const targetY = (particle.v - 0.5) * 1.55 + Math.sin(particle.angle) * 0.05;
      x = lerp(particle.x, targetX, migration);
      y = lerp(particle.y, targetY, migration);
      palette = band;
      alpha *= 0.74;
      break;
    }
    case 15: {
      const originX = -0.5;
      const originY = 0.08;
      const dx = particle.x - originX;
      const dy = particle.y - originY;
      const radius = Math.hypot(dx, dy) + 0.001;
      const front = fract(time * 0.13) * 2.25;
      const distance = radius - front;
      const wave = Math.exp(-(distance * distance) / 0.012) * Math.sin(distance * 28);
      x = particle.x + dx / radius * wave * 0.16;
      y = particle.y + dy / radius * wave * 0.16;
      alpha *= 0.56 + Math.exp(-(distance * distance) / 0.02) * 0.46;
      size *= 0.82 + Math.exp(-(distance * distance) / 0.02) * 0.52;
      break;
    }
    case 16: {
      const flock = particle.group % 5;
      const path = time * (0.18 + flock * 0.012) + flock * 1.18;
      const centerX = Math.sin(path * 0.73) * 0.72 + (flock - 2) * 0.08;
      const centerY = Math.cos(path * 0.54 + flock) * 0.36;
      const formationAngle = particle.angle + Math.sin(path) * 0.42;
      const spread = 0.05 + particle.u * 0.25;
      x = centerX + Math.cos(formationAngle) * spread;
      y = centerY + Math.sin(formationAngle) * spread * 0.52;
      tailX = x - Math.cos(path * 0.73) * 0.035;
      tailY = y + Math.sin(path * 0.54 + flock) * 0.02;
      hasTail = particle.index % 3 === 0;
      alpha *= 0.72;
      break;
    }
    case 17: {
      const reverse = smooth(clamp((time % 6) / 4.2));
      const explosionRadius = 0.3 + particle.radius * 1.7;
      const explodedX = Math.cos(particle.angle) * explosionRadius;
      const explodedY = Math.sin(particle.angle) * explosionRadius * 0.72;
      x = lerp(explodedX, particle.tx, reverse);
      y = lerp(explodedY, particle.ty, reverse);
      tailX = lerp(explodedX * 1.035, particle.tx, reverse);
      tailY = lerp(explodedY * 1.035, particle.ty, reverse);
      hasTail = reverse < 0.82;
      alpha *= 0.6 + reverse * 0.3;
      break;
    }
    case 18: {
      const angle = Math.atan2(particle.y, particle.x);
      const radius = Math.hypot(particle.x, particle.y) + 0.001;
      const boundary = 0.42 + Math.cos(angle * 5) * 0.13;
      const reveal = pulse(time, 2.6, 2.6, 1.4);
      const inside = smooth(clamp((boundary - radius) / 0.24));
      const pushedRadius = lerp(radius, Math.max(radius, boundary + 0.08 + particle.u * 0.18), reveal * inside);
      x = Math.cos(angle) * pushedRadius;
      y = Math.sin(angle) * pushedRadius * 0.92;
      alpha *= 0.58 + reveal * 0.22;
      break;
    }
    case 19: {
      const formation = pulse(time, 3.2, 2.4, 1.6);
      const ring = particle.group % 7 === 0;
      if (ring) {
        const radius = 0.74 + (particle.u - 0.5) * 0.08;
        const angle = particle.angle + time * 0.18;
        x = lerp(particle.x, Math.cos(angle) * radius, formation);
        y = lerp(particle.y, Math.sin(angle) * radius * 0.24, formation);
        alpha *= 0.62;
      } else {
        const longitude = particle.angle + time * 0.055;
        const latitude = Math.asin(particle.u * 2 - 1);
        const sphereX = Math.cos(latitude) * Math.cos(longitude) * 0.56;
        const sphereY = Math.sin(latitude) * 0.56;
        x = lerp(particle.x, sphereX, formation);
        y = lerp(particle.y, sphereY, formation);
        const light = clamp((Math.cos(latitude) * Math.cos(longitude + 0.8) + 1) * 0.5, 0.12, 1);
        alpha *= lerp(0.46, 0.34 + light * 0.62, formation);
        size *= lerp(0.8, 0.74 + light * 0.46, formation);
      }
      break;
    }
    case 20: {
      const layer = particle.group % 5;
      const zoom = fract(time * 0.12 + layer / 5);
      const scale = 2 ** (zoom * 4.3 - 2.25);
      const angle = particle.angle + zoom * 1.4;
      const baseRadius = 0.06 + particle.radius * 0.84;
      x = Math.cos(angle + baseRadius * 5) * baseRadius * scale;
      y = Math.sin(angle + baseRadius * 5) * baseRadius * scale * 0.68;
      alpha *= Math.sin(zoom * Math.PI) ** 0.55;
      size *= 0.66 + zoom * 0.86;
      break;
    }
    default:
      break;
  }

  if (effectIndex !== 6) {
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const distance = Math.hypot(dx, dy) + 0.001;
    const influence = pointer.active ? smooth(1 - clamp(distance / 0.34)) : 0;
    x += dx / distance * influence * 0.045;
    y += dy / distance * influence * 0.045;
  }

  result.x = x;
  result.y = y;
  result.size = clamp(size, 0.45, 3.2);
  result.alpha = clamp(alpha, 0.035, 0.72);
  result.tailX = tailX;
  result.tailY = tailY;
  result.hasTail = hasTail;
  result.palette = palette;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function mixColor(from, to, amount) {
  return {
    r: Math.round(lerp(from.r, to.r, amount)),
    g: Math.round(lerp(from.g, to.g, amount)),
    b: Math.round(lerp(from.b, to.b, amount)),
  };
}

function rgbString(color) {
  return `rgb(${color.r} ${color.g} ${color.b})`;
}

function paletteFor(effectIndex) {
  if (effectIndex === 14) return ["rgb(105 211 255)", "rgb(255 126 176)", "rgb(255 207 104)"];
  const accent = hexToRgb(EFFECTS[effectIndex].accent);
  return [
    rgbString(mixColor(accent, { r: 255, g: 255, b: 255 }, 0.54)),
    rgbString(accent),
    rgbString(mixColor(accent, { r: 80, g: 105, b: 140 }, 0.38)),
  ];
}

function toScreenX(normalized) {
  return width * 0.56 + normalized * Math.min(width * 0.34, height * 0.56);
}

function toScreenY(normalized) {
  return height * 0.5 + normalized * Math.min(height * 0.46, width * 0.36);
}

function drawAtmosphere(time) {
  const effect = EFFECTS[currentIndex];
  const accent = hexToRgb(effect.accent);
  const centerX = width * 0.56;
  const centerY = height * 0.48;
  const radius = Math.max(width, height) * 0.46;
  const haze = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  const breathe = 0.022 + (Math.sin(time * 0.5) * 0.5 + 0.5) * 0.018;
  haze.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${breathe})`);
  haze.addColorStop(0.45, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.012)`);
  haze.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = haze;
  context.fillRect(0, 0, width, height);
}

function drawGuides(time, palette) {
  context.save();
  context.globalCompositeOperation = "lighter";

  if (currentIndex === 1 || currentIndex === 12) {
    const reveal = currentIndex === 1 ? 0.13 + Math.sin(time * 0.7) ** 2 * 0.11 : pulse(time, 3, 2.6, 1.5) * 0.15;
    context.strokeStyle = palette[1];
    context.globalAlpha = reveal;
    context.lineWidth = 0.6;
    context.beginPath();
    for (const [from, to] of links) {
      const first = particles[from];
      const second = particles[to];
      const distance = Math.hypot(first.sx - second.sx, first.sy - second.sy);
      if (distance > Math.min(width, height) * 0.15) continue;
      context.moveTo(first.sx, first.sy);
      context.lineTo(second.sx, second.sy);
    }
    context.stroke();
  }

  if (currentIndex === 8) {
    context.strokeStyle = palette[1];
    context.globalAlpha = 0.12;
    context.lineWidth = 0.7;
    for (let orbit = 0; orbit < 6; orbit += 1) {
      const radius = (0.16 + orbit * 0.14) * Math.min(width * 0.34, height * 0.56);
      context.beginPath();
      context.ellipse(width * 0.56, height * 0.5, radius, radius * (0.42 + orbit * 0.045), 0, 0, TAU);
      context.stroke();
    }
  }

  if (currentIndex === 6) {
    const lensX = pointer.active ? pointer.x : Math.sin(time * 0.43) * 0.46;
    const lensY = pointer.active ? pointer.y : Math.cos(time * 0.31) * 0.24;
    context.strokeStyle = palette[0];
    context.globalAlpha = 0.13;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(toScreenX(lensX), toScreenY(lensY), Math.min(width, height) * 0.095, 0, TAU);
    context.stroke();
  }

  if (currentIndex === 19) {
    context.strokeStyle = palette[1];
    context.globalAlpha = 0.18 * pulse(time, 3.2, 2.4, 1.6);
    context.lineWidth = 1.1;
    context.beginPath();
    context.ellipse(width * 0.56, height * 0.5, Math.min(width, height) * 0.29, Math.min(width, height) * 0.07, -0.08, 0, TAU);
    context.stroke();
  }

  context.restore();
}

function drawTails(palette) {
  context.save();
  context.globalCompositeOperation = "lighter";
  context.lineWidth = currentIndex === 5 ? 0.9 : 0.65;
  for (let colorIndex = 0; colorIndex < 3; colorIndex += 1) {
    context.strokeStyle = palette[colorIndex];
    context.globalAlpha = currentIndex === 5 ? 0.26 : 0.18;
    context.beginPath();
    for (const particle of particles) {
      if (!particle.hasTail || particle.palette !== colorIndex) continue;
      context.moveTo(particle.tailSx, particle.tailSy);
      context.lineTo(particle.sx, particle.sy);
    }
    context.stroke();
  }
  context.restore();
}

function drawParticles(palette) {
  context.save();
  context.globalCompositeOperation = "lighter";

  for (const particle of particles) {
    const color = palette[particle.palette];
    context.fillStyle = color;
    context.globalAlpha = particle.drawAlpha;
    const size = particle.drawSize;
    context.fillRect(particle.sx - size * 0.5, particle.sy - size * 0.5, size, size);

    if (particle.size > 1.65) {
      context.globalAlpha = particle.drawAlpha * 0.1;
      const halo = size * 3.6;
      context.fillRect(particle.sx - halo * 0.5, particle.sy - halo * 0.5, halo, halo);
    }
  }

  context.restore();
}

function draw(time) {
  context.save();
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, width, height);
  context.restore();

  drawAtmosphere(time);
  const palette = paletteFor(currentIndex);

  for (const particle of particles) {
    evaluate(currentIndex, particle, time, output);
    particle.sx = toScreenX(output.x);
    particle.sy = toScreenY(output.y);
    particle.tailSx = toScreenX(output.tailX);
    particle.tailSy = toScreenY(output.tailY);
    particle.drawAlpha = output.alpha;
    particle.drawSize = output.size * pixelRatio ** 0.25;
    particle.palette = output.palette;
    particle.hasTail = output.hasTail;
  }

  drawGuides(time, palette);
  if (particles.some((particle) => particle.hasTail)) drawTails(palette);
  drawParticles(palette);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.65);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  backgroundGradient = context.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, "#06101a");
  backgroundGradient.addColorStop(0.5, "#02050a");
  backgroundGradient.addColorStop(1, "#060a12");
  createParticles();
  if (reducedMotion) draw(3.2);
}

function indexFromHash() {
  const slug = window.location.hash.slice(1);
  const index = EFFECTS.findIndex((effect) => effect.slug === slug);
  return index >= 0 ? index : 0;
}

function setEffect(index, updateHash = true) {
  currentIndex = (index + EFFECTS.length) % EFFECTS.length;
  modeStartedAt = performance.now();
  const effect = EFFECTS[currentIndex];
  document.documentElement.style.setProperty("--accent", effect.accent);
  effectNameZh.textContent = effect.nameZh;
  effectNameEn.textContent = effect.nameEn;
  effectFeeling.textContent = effect.feeling;
  effectCount.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${EFFECTS.length}`;
  progressBar.style.transform = `scaleX(${(currentIndex + 1) / EFFECTS.length})`;
  [...effectNav.querySelectorAll("button")].forEach((button, buttonIndex) => {
    button.setAttribute("aria-current", String(buttonIndex === currentIndex));
  });
  if (updateHash) window.history.replaceState(null, "", `#${effect.slug}`);
  if (reducedMotion) draw(3.2);
}

function buildNavigation() {
  effectNav.innerHTML = EFFECTS.map((effect, index) => `
    <li><button type="button" data-index="${index}" aria-label="${effect.nameZh}" title="${effect.nameZh}"></button></li>
  `).join("");
  effectNav.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (button) setEffect(Number(button.dataset.index));
  });
}

function animate(now) {
  if (!visible) return;
  const time = reducedMotion ? 3.2 : (now - modeStartedAt) / 1000 + (captureMode ? 0.45 : 0);
  draw(time);
  animationFrame = requestAnimationFrame(animate);
}

buildNavigation();
resize();
setEffect(indexFromHash(), false);

previousButton.addEventListener("click", () => setEffect(currentIndex - 1));
nextButton.addEventListener("click", () => setEffect(currentIndex + 1));
window.addEventListener("hashchange", () => setEffect(indexFromHash(), false));
window.addEventListener("resize", resize, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setEffect(currentIndex - 1);
  if (event.key === "ArrowRight") setEffect(currentIndex + 1);
});

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - rect.left) / rect.width * 2.8 - 1.4;
  pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 1.8;
  pointer.active = true;
});
canvas.addEventListener("pointerleave", () => { pointer.active = false; });

document.addEventListener("visibilitychange", () => {
  visible = !document.hidden;
  if (!visible) {
    hiddenAt = performance.now();
    cancelAnimationFrame(animationFrame);
    return;
  }
  modeStartedAt += performance.now() - hiddenAt;
  animationFrame = requestAnimationFrame(animate);
});

if (!reducedMotion) animationFrame = requestAnimationFrame(animate);
