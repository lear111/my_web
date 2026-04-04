const ORDER = 7;
const HALF = (ORDER - 1) / 2;
const SCALE_FACTOR = 0.7;
const STEP = 1 * SCALE_FACTOR;
const CUBIE_SIZE = 1 * SCALE_FACTOR;
const TURN_MS = 260;
const STICKER_SIZE = 0.86 * SCALE_FACTOR;
const STICKER_RADIUS = 0.12 * SCALE_FACTOR;
const STICKER_OFFSET = 0.502 * SCALE_FACTOR;
const SCRIPT_SPEED = 2.0;
const PERSONAL_SITE_URL = "personal.html";
const HEART_SITE_URL = "https://www.desmos.com/calculator/1ec336ecdb";
const EXIT_ANIMATION_MS = 560;
const SCRIPT_ANGLE_SET = new Set([90, 180, 270, 360]);
const FACE_NORMAL_BY_CODE = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0]
};
const FACE_BY_COLOR = {
  yellow: "D",
  white: "U",
  green: "F",
  blue: "B",
  red: "R",
  orange: "L",
  huang: "D",
  bai: "U",
  lv: "F",
  lan: "B",
  hong: "R",
  cheng: "L"
};

const SMILE_PATTERN_RULE = {
  yellow: {
    white: [
      [1, 1], [1, 7], [7, 1], [7, 7],
      [2, 3], [3, 2], [4, 2], [5, 2], [6, 3],
      [3, 5], [3, 6], [5, 5], [5, 6]
    ]
  }
};

const HEART_PATTERN_RULE = {
  yellow: {
    white: [
      [4, 2], [3, 3], [4, 3], [5, 3],
      [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
      [2, 5], [3, 5], [4, 5], [5, 5], [6, 5],
      [3, 6], [5, 6]
    ]
  }
};


const SMILE = [
  ["yellow", [7, 0], 180],
  ["yellow", [1, 0], 180],
  ["yellow", [0, 1], 90],
  ["yellow", [0, 7], 90],
  ["yellow", [7, 0], 180],
  ["yellow", [1, 0], 180],
  ["yellow", [0, 1], 270],
  ["yellow", [0, 7], 270],
  ["yellow", [2, 0], 180],
  ["yellow", [5, 0], 180],
  ["yellow", [6, 0], 180],
  ["yellow", [0, 3], 90],
  ["yellow", [0, 5], 90],
  ["yellow", [2, 0], 180],
  ["yellow", [5, 0], 180],
  ["yellow", [6, 0], 180],
  ["yellow", [0, 3], 270],
  ["yellow", [0, 5], 270],
  ["yellow", [3, 0], 180],
  ["yellow", [0, 2], 90],
  ["yellow", [0, 6], 90],
  ["yellow", [3, 0], 180],
  ["yellow", [0, 2], 270],
  ["yellow", [0, 6], 270],
  ["yellow", [2, 0], 180],
  ["yellow", [0, 4], 90],
  ["yellow", [2, 0], 180],
  ["yellow", [0, 4], 270],
];

const FACE_COLORS = {
  U: "#f3f3f3",
  D: "#f8f81d",
  F: "#009d54",
  B: "#1f64db",
  R: "#ff3a21",
  L: "#e87000",
  INNER: "#11161f"
};

function showLoadError(message) {
  const host = document.body;
  if (!host) {
    return;
  }
  const old = host.querySelector(".engine-error");
  if (old) {
    old.remove();
  }
  const p = document.createElement("p");
  p.className = "engine-error";
  p.style.color = "#ffe7e7";
  p.style.fontWeight = "700";
  p.style.position = "fixed";
  p.style.left = "12px";
  p.style.top = "14px";
  p.style.transform = "none";
  p.style.zIndex = "9999";
  p.style.margin = "0";
  p.style.padding = "10px 12px";
  p.style.background = "rgba(28, 32, 44, 0.95)";
  p.style.border = "1px solid rgba(255, 99, 99, 0.75)";
  p.style.borderRadius = "10px";
  p.style.boxShadow = "0 10px 26px rgba(0,0,0,0.35)";
  p.style.maxWidth = "min(94vw, 760px)";
  p.style.maxHeight = "38vh";
  p.style.overflow = "auto";
  p.style.fontSize = "14px";
  p.style.lineHeight = "1.45";
  p.style.whiteSpace = "pre-wrap";
  p.style.pointerEvents = "none";
  p.textContent = message;
  host.appendChild(p);
  console.warn("[pattern-debug]", message);
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = () => resolve(url);
    s.onerror = () => reject(new Error(`Failed: ${url}`));
    document.head.appendChild(s);
  });
}

function createRoundedStickerGeometry(THREE, size, radius, segments) {
  const half = size / 2;
  const r = Math.min(radius, half - 0.001);
  const shape = new THREE.Shape();
  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);
  return new THREE.ShapeGeometry(shape, segments);
}

function playExitTransition() {
  document.body.classList.add("is-exiting");
  return new Promise((resolve) => {
    window.setTimeout(resolve, EXIT_ANIMATION_MS);
  });
}

async function loadThreeWithFallback() {
  if (window.THREE && window.THREE.TrackballControls) {
    return;
  }

  const sources = [
    {
      three: "./node_modules/three/build/three.min.js",
      control: "./node_modules/three/examples/js/controls/TrackballControls.js"
    },
    {
      three: "https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.min.js",
      control: "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/controls/TrackballControls.js"
    },
    {
      three: "https://unpkg.com/three@0.124.0/build/three.min.js",
      control: "https://unpkg.com/three@0.124.0/examples/js/controls/TrackballControls.js"
    },
    {
      three: "https://cdn.bootcdn.net/ajax/libs/three.js/124/three.min.js",
      control: "https://cdn.bootcdn.net/ajax/libs/three.js/124/examples/js/controls/TrackballControls.js"
    }
  ];

  const errors = [];

  for (const src of sources) {
    try {
      if (!window.THREE) {
        await loadScript(src.three);
      }
      await loadScript(src.control);
      if (window.THREE && window.THREE.TrackballControls) {
        return;
      }
      errors.push(`TrackballControls unavailable from ${src.control}`);
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new Error(errors.join(" | "));
}

function startApp() {
  document.body.classList.remove("is-exiting");
  const THREE = window.THREE;
  const TrackballControls = window.THREE.TrackballControls;
  const AXIS_VECTORS = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  };
  const FACE_CONFIG = {
    F: { normal: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(1, 0, 0), up: new THREE.Vector3(0, 1, 0) },
    B: { normal: new THREE.Vector3(0, 0, -1), right: new THREE.Vector3(-1, 0, 0), up: new THREE.Vector3(0, 1, 0) },
    R: { normal: new THREE.Vector3(1, 0, 0), right: new THREE.Vector3(0, 0, -1), up: new THREE.Vector3(0, 1, 0) },
    L: { normal: new THREE.Vector3(-1, 0, 0), right: new THREE.Vector3(0, 0, 1), up: new THREE.Vector3(0, 1, 0) },
    U: { normal: new THREE.Vector3(0, 1, 0), right: new THREE.Vector3(1, 0, 0), up: new THREE.Vector3(0, 0, -1) },
    D: { normal: new THREE.Vector3(0, -1, 0), right: new THREE.Vector3(1, 0, 0), up: new THREE.Vector3(0, 0, 1) }
  };

  const canvas = document.getElementById("stage");
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(0xdde8f8, 25, 65);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
  // Keep yellow face upright: visual up uses +Z, so (1,1) stays at bottom-left.
  camera.up.set(0, 0, 1);
  // Yellow face (D) toward viewer with a slight rightward slant.
  camera.position.set(-6.36, -17.67, 4.10);
  camera.lookAt(0, 0, 0);

  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 3.6;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.45;
  controls.dynamicDampingFactor = 0.16;
  controls.minDistance = 11;
  controls.maxDistance = 40;
  controls.noPan = true;
  controls.target.set(0, 0, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x7a8aa8, 0.95);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(10, 14, 7);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xb3d1ff, 0.7);
  rim.position.set(-12, 10, -11);
  scene.add(rim);

  const bottomFill = new THREE.DirectionalLight(0xffffff, 1.2);
  bottomFill.position.set(0, -18, 0);
  scene.add(bottomFill);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const cubeRoot = new THREE.Group();
  scene.add(cubeRoot);

  const cubies = [];
  let busy = false;
  let isAutoPlaying = false;
  let isNavigating = false;
  const coreMaterial = new THREE.MeshLambertMaterial({ color: FACE_COLORS.INNER });
  const stickerGeometry = createRoundedStickerGeometry(THREE, STICKER_SIZE, STICKER_RADIUS, 6);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoveredCubies = new Set();
  let lastHover = null;
  const pointerDown = { x: 0, y: 0, moved: false };

  function roundCoord(v) {
    return Math.round(v / STEP);
  }

  function addSticker(cubie, color, axis, dir, faceCode) {
    const stickerMaterial = new THREE.MeshBasicMaterial({ color, fog: false });
    const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
    sticker.userData.isSticker = true;
    sticker.userData.faceCode = faceCode;
    sticker.userData.localNormal = FACE_NORMAL_BY_CODE[faceCode];
    if (axis === "x") {
      sticker.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      sticker.position.x = dir * STICKER_OFFSET;
    } else if (axis === "y") {
      sticker.rotation.x = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      sticker.position.y = dir * STICKER_OFFSET;
    } else {
      sticker.rotation.y = dir > 0 ? 0 : Math.PI;
      sticker.position.z = dir * STICKER_OFFSET;
    }
    cubie.add(sticker);
  }

  function buildCube() {
    while (cubeRoot.children.length) {
      const c = cubeRoot.children.pop();
      c.traverse((node) => {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    }
    cubies.length = 0;

    const geometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
    for (let x = -HALF; x <= HALF; x += 1) {
      for (let y = -HALF; y <= HALF; y += 1) {
        for (let z = -HALF; z <= HALF; z += 1) {
          const isSurface = Math.abs(x) === HALF || Math.abs(y) === HALF || Math.abs(z) === HALF;
          if (!isSurface) {
            continue;
          }
          const cubie = new THREE.Group();
          const core = new THREE.Mesh(geometry, coreMaterial.clone());
          cubie.add(core);

          if (x === HALF) {
            addSticker(cubie, FACE_COLORS.R, "x", 1, "R");
          }
          if (x === -HALF) {
            addSticker(cubie, FACE_COLORS.L, "x", -1, "L");
          }
          if (y === HALF) {
            addSticker(cubie, FACE_COLORS.U, "y", 1, "U");
          }
          if (y === -HALF) {
            addSticker(cubie, FACE_COLORS.D, "y", -1, "D");
          }
          if (z === HALF) {
            addSticker(cubie, FACE_COLORS.F, "z", 1, "F");
          }
          if (z === -HALF) {
            addSticker(cubie, FACE_COLORS.B, "z", -1, "B");
          }

          cubie.position.set(x * STEP, y * STEP, z * STEP);
          cubie.userData.isCubie = true;
          cubie.userData.coord = { x, y, z };
          cubeRoot.add(cubie);
          cubies.push(cubie);
        }
      }
    }
  }

  function layerPredicate(axis, layer, wide) {
    return (c) => {
      const v = c.userData.coord[axis];
      if (!wide) {
        return v === layer;
      }
      if (layer > 0) {
        return v >= layer - 1;
      }
      if (layer < 0) {
        return v <= layer + 1;
      }
      return Math.abs(v) <= 1;
    };
  }

  function snapCubie(cubie) {
    cubie.position.x = Math.round(cubie.position.x / STEP) * STEP;
    cubie.position.y = Math.round(cubie.position.y / STEP) * STEP;
    cubie.position.z = Math.round(cubie.position.z / STEP) * STEP;

    cubie.rotation.x = Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
    cubie.rotation.y = Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
    cubie.rotation.z = Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2);

    cubie.userData.coord.x = roundCoord(cubie.position.x);
    cubie.userData.coord.y = roundCoord(cubie.position.y);
    cubie.userData.coord.z = roundCoord(cubie.position.z);
  }

  function doMoveSpec(spec) {
    if (busy) {
      return Promise.resolve(false);
    }

    busy = true;
    const selected = cubies.filter(layerPredicate(spec.axis, spec.layer, spec.wide));
    selected.forEach((c) => pivot.add(c));

    const axisVec = new THREE.Vector3(
      spec.axis === "x" ? 1 : 0,
      spec.axis === "y" ? 1 : 0,
      spec.axis === "z" ? 1 : 0
    );

    return new Promise((resolve) => {
      const start = performance.now();
      const duration = Math.max(60, spec.durationMs || TURN_MS);
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        pivot.setRotationFromAxisAngle(axisVec, spec.angle * eased);

        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }

        selected.forEach((c) => {
          c.applyMatrix4(pivot.matrix);
          cubeRoot.add(c);
          snapCubie(c);
        });
        pivot.rotation.set(0, 0, 0);
        busy = false;
        resolve(true);
      }

      requestAnimationFrame(tick);
    });
  }

  function normalizeScriptCommand(cmd) {
    let faceColor;
    let layer;
    let angleDeg;

    if (Array.isArray(cmd)) {
      [faceColor, layer, angleDeg] = cmd;
    } else if (cmd && typeof cmd === "object") {
      faceColor = cmd.face || cmd.color;
      layer = cmd.layer;
      angleDeg = cmd.angle;
    } else {
      throw new Error("脚本指令格式错误");
    }

    const face = FACE_BY_COLOR[String(faceColor || "").toLowerCase()];
    if (!face) {
      throw new Error(`未知颜色面: ${faceColor}`);
    }

    if (!Array.isArray(layer) || layer.length !== 2) {
      throw new Error("layer 必须是 [horizontal, vertical]");
    }

    const h = Number(layer[0] || 0);
    const v = Number(layer[1] || 0);
    const horizontalChosen = h > 0;
    const verticalChosen = v > 0;
    if (horizontalChosen === verticalChosen) {
      throw new Error("layer 中必须且只能有一个方向非 0");
    }

    const index = horizontalChosen ? h : v;
    if (!Number.isInteger(index) || index < 1 || index > ORDER) {
      throw new Error(`层索引超出范围: ${index}`);
    }

    const angle = Number(angleDeg);
    if (!SCRIPT_ANGLE_SET.has(angle)) {
      throw new Error(`角度只支持 90/180/270/360，收到 ${angleDeg}`);
    }

    return { face, horizontalChosen, index, angle };
  }

  function getScriptMoveSpec(cmd) {
    const parsed = normalizeScriptCommand(cmd);
    const tile = parsed.horizontalChosen ? { col: 1, row: parsed.index } : { col: parsed.index, row: 1 };
    const layerSpec = layerFromFace(parsed.face, parsed.horizontalChosen, tile);
    if (!layerSpec) {
      throw new Error("无法解析层信息");
    }

    const quarter = clockwiseAngle(parsed.face, parsed.horizontalChosen, layerSpec.axis, layerSpec.axisDir);
  // 270deg clockwise is equivalent to 90deg counter-clockwise.
  const effectiveAngle = parsed.angle === 270 ? -90 : parsed.angle;
  const turns = effectiveAngle / 90;
    const durationMs = TURN_MS / Math.max(0.1, SCRIPT_SPEED);

    return {
      axis: layerSpec.axis,
      layer: layerSpec.layer,
      wide: false,
      angle: quarter * turns,
      durationMs
    };
  }

  async function runScript(scriptCommands) {
    if (isAutoPlaying || busy) {
      return;
    }
    isAutoPlaying = true;
    try {
      resetCube();
      for (const cmd of scriptCommands) {
        const spec = getScriptMoveSpec(cmd);
        await doMoveSpec(spec);
      }
    } finally {
      isAutoPlaying = false;
    }
  }

  function resetCube() {
    lastHover = null;
    setLayerHighlight(null);
    buildCube();
  }

  function coordKey(col, row) {
    return `${col},${row}`;
  }

  function getFaceTargetNormal(THREE, faceCode) {
    const n = FACE_NORMAL_BY_CODE[faceCode];
    if (!n) {
      return null;
    }
    return new THREE.Vector3(n[0], n[1], n[2]);
  }

  function getStickerFaceCodeOnFace(cubie, faceCode) {
    const targetNormal = getFaceTargetNormal(THREE, faceCode);
    if (!targetNormal) {
      return null;
    }

    let bestCode = null;
    let bestDot = -1;
    const worldQ = new THREE.Quaternion();
    cubie.getWorldQuaternion(worldQ);

    cubie.children.forEach((child) => {
      if (!child.userData || !child.userData.isSticker) {
        return;
      }
      const ln = child.userData.localNormal;
      if (!ln) {
        return;
      }
      const worldNormal = new THREE.Vector3(ln[0], ln[1], ln[2]).applyQuaternion(worldQ).normalize();
      const dot = worldNormal.dot(targetNormal);
      if (dot > bestDot) {
        bestDot = dot;
        bestCode = child.userData.faceCode;
      }
    });

    if (bestDot < 0.5) {
      return null;
    }
    return bestCode;
  }

  function getFaceColorGrid(faceCode) {
    // Ensure matrixWorld is current right after animated turns complete.
    scene.updateMatrixWorld(true);

    const grid = new Map();
    const layerValue = faceCode === "U" ? HALF : faceCode === "D" ? -HALF :
      faceCode === "F" ? HALF : faceCode === "B" ? -HALF :
      faceCode === "R" ? HALF : -HALF;
    const axis = faceCode === "U" || faceCode === "D" ? "y" :
      faceCode === "F" || faceCode === "B" ? "z" : "x";

    cubies.forEach((cubie) => {
      if (cubie.userData.coord[axis] !== layerValue) {
        return;
      }
      const tile = tileFromFaceCoord(faceCode, cubie.userData.coord);
      if (!tile) {
        return;
      }
      const code = getStickerFaceCodeOnFace(cubie, faceCode);
      if (code) {
        grid.set(coordKey(tile.col, tile.row), code);
      }
    });

    return grid;
  }

  function isFacePatternMatched(patternRule) {
    return getPatternMismatches(patternRule, 1).length === 0;
  }

  async function autoDetectAndRedirect() {
    if (isNavigating || busy || isAutoPlaying) {
      return;
    }

    if (isFacePatternMatched(HEART_PATTERN_RULE)) {
      isNavigating = true;
      await playExitTransition();
      window.location.href = HEART_SITE_URL;
      return;
    }

    if (isFacePatternMatched(SMILE_PATTERN_RULE)) {
      isNavigating = true;
      await playExitTransition();
      window.location.href = PERSONAL_SITE_URL;
    }
  }

  function getPatternMismatches(patternRule, limit = 10) {
    const faceColorName = Object.keys(patternRule || {})[0];
    if (!faceColorName) {
      return [{ key: "-", expected: "invalid-rule", actual: "missing-face" }];
    }

    const faceCode = FACE_BY_COLOR[String(faceColorName).toLowerCase()];
    if (!faceCode) {
      return [{ key: "-", expected: "known-face-color", actual: String(faceColorName) }];
    }

    const constraints = patternRule[faceColorName] || {};
    const expected = new Map();
    for (let col = 1; col <= ORDER; col += 1) {
      for (let row = 1; row <= ORDER; row += 1) {
        expected.set(coordKey(col, row), faceCode);
      }
    }

    Object.entries(constraints).forEach(([colorName, coords]) => {
      const colorCode = FACE_BY_COLOR[String(colorName).toLowerCase()];
      if (!colorCode || !Array.isArray(coords)) {
        return;
      }
      coords.forEach((pair) => {
        if (!Array.isArray(pair) || pair.length !== 2) {
          return;
        }
        const col = Number(pair[0]);
        const row = Number(pair[1]);
        if (Number.isInteger(col) && Number.isInteger(row) && col >= 1 && col <= ORDER && row >= 1 && row <= ORDER) {
          expected.set(coordKey(col, row), colorCode);
        }
      });
    });

    const actual = getFaceColorGrid(faceCode);
    const mismatches = [];
    for (const [k, expectedCode] of expected.entries()) {
      if (actual.get(k) !== expectedCode) {
        mismatches.push({ key: k, expected: expectedCode, actual: actual.get(k) || "none" });
        if (mismatches.length >= limit) {
          break;
        }
      }
    }
    return mismatches;
  }

  function faceFromNormal(normal) {
    const ax = Math.abs(normal.x);
    const ay = Math.abs(normal.y);
    const az = Math.abs(normal.z);
    if (ax > ay && ax > az) {
      return normal.x > 0 ? "R" : "L";
    }
    if (ay > ax && ay > az) {
      return normal.y > 0 ? "U" : "D";
    }
    return normal.z > 0 ? "F" : "B";
  }

  function tileFromFaceCoord(face, coord) {
    switch (face) {
      case "F":
        return { col: coord.x + HALF + 1, row: coord.y + HALF + 1 };
      case "B":
        return { col: HALF - coord.x + 1, row: coord.y + HALF + 1 };
      case "R":
        return { col: HALF - coord.z + 1, row: coord.y + HALF + 1 };
      case "L":
        return { col: coord.z + HALF + 1, row: coord.y + HALF + 1 };
      case "U":
        return { col: coord.x + HALF + 1, row: HALF - coord.z + 1 };
      case "D":
        return { col: coord.x + HALF + 1, row: coord.z + HALF + 1 };
      default:
        return null;
    }
  }

  function layerFromFace(face, isHorizontal, tile) {
    if (isHorizontal) {
      switch (face) {
        case "F":
        case "B":
        case "R":
        case "L":
          return { axis: "y", layer: tile.row - HALF - 1, axisDir: 1 };
        case "U":
          return { axis: "z", layer: HALF - tile.row + 1, axisDir: -1 };
        case "D":
          return { axis: "z", layer: tile.row - HALF - 1, axisDir: 1 };
        default:
          return null;
      }
    }

    switch (face) {
      case "F":
        return { axis: "x", layer: tile.col - HALF - 1, axisDir: 1 };
      case "B":
        return { axis: "x", layer: HALF - tile.col + 1, axisDir: -1 };
      case "R":
        return { axis: "z", layer: HALF - tile.col + 1, axisDir: -1 };
      case "L":
        return { axis: "z", layer: tile.col - HALF - 1, axisDir: 1 };
      case "U":
      case "D":
        return { axis: "x", layer: tile.col - HALF - 1, axisDir: 1 };
      default:
        return null;
    }
  }

  function clockwiseAngle(face, isHorizontal, axis, axisDir) {
    const cfg = FACE_CONFIG[face];
    const axisVec = AXIS_VECTORS[axis].clone().multiplyScalar(axisDir);
    const desired = isHorizontal ? cfg.right.clone() : cfg.up.clone().multiplyScalar(-1);
    const tangent = axisVec.clone().cross(cfg.normal);
    return tangent.dot(desired) >= 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  function getCubieFromObject(obj) {
    let node = obj;
    while (node && node !== cubeRoot) {
      if (node.userData && node.userData.isCubie) {
        return node;
      }
      node = node.parent;
    }
    return null;
  }

  function pickLayerFromEvent(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(cubeRoot.children, true);
    if (!hits.length) {
      return null;
    }

    const hit = hits[0];
    const cubie = getCubieFromObject(hit.object);
    if (!cubie) {
      return null;
    }

    const worldNormal = hit.face.normal
      .clone()
      .transformDirection(hit.object.matrixWorld)
      .normalize();
    const face = faceFromNormal(worldNormal);
    const tile = tileFromFaceCoord(face, cubie.userData.coord);
    if (!tile) {
      return null;
    }

    // Special rule: (7,1) always selects vertical layer.
    const isHorizontal = tile.col === ORDER && tile.row === 1 ? false : tile.col >= tile.row;
    const layerSpec = layerFromFace(face, isHorizontal, tile);
    if (!layerSpec) {
      return null;
    }

    return {
      face,
      tile,
      isHorizontal,
      axis: layerSpec.axis,
      layer: layerSpec.layer,
      axisDir: layerSpec.axisDir,
      angle: clockwiseAngle(face, isHorizontal, layerSpec.axis, layerSpec.axisDir)
    };
  }

  function setLayerHighlight(layerInfo) {
    hoveredCubies.forEach((cubie) => {
      cubie.children.forEach((child) => {
        if (child.material && child.material.color) {
          if (child.userData.baseHex !== undefined) {
            child.material.color.setHex(child.userData.baseHex);
          }
        }
      });
    });
    hoveredCubies.clear();

    if (!layerInfo) {
      return;
    }

    const selected = cubies.filter(layerPredicate(layerInfo.axis, layerInfo.layer, false));
    selected.forEach((cubie) => {
      cubie.children.forEach((child) => {
        if (child.material && child.material.color) {
          if (child.userData.baseHex === undefined) {
            child.userData.baseHex = child.material.color.getHex();
          }
          child.material.color.copy(new THREE.Color(child.userData.baseHex)).lerp(new THREE.Color(0xffffff), 0.12);
        }
      });
      hoveredCubies.add(cubie);
    });
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function bindUI() {
    const playDemoBtn = document.getElementById("play-demo");
    if (playDemoBtn) {
      let enterLocked = false;
      const handleEnter = async (ev) => {
        if (ev) {
          ev.stopPropagation();
          ev.preventDefault();
        }
        if (enterLocked) {
          return;
        }
        enterLocked = true;
        const originalText = playDemoBtn.textContent;
        playDemoBtn.textContent = "LOADING...";
        try {
          await runScript(SMILE);
          await autoDetectAndRedirect();
        } catch (err) {
          showLoadError(`Script failed: ${err.message}`);
        } finally {
          enterLocked = false;
          playDemoBtn.textContent = originalText;
        }
      };
      playDemoBtn.onclick = handleEnter;
      playDemoBtn.onpointerup = handleEnter;
    }

    const resetBtn = document.getElementById("reset-cube");
    if (resetBtn) {
      resetBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (busy || isAutoPlaying) {
          return;
        }
        resetCube();
      });
    }

    renderer.domElement.addEventListener("pointermove", (ev) => {
      if (busy) {
        return;
      }
      lastHover = pickLayerFromEvent(ev);
      setLayerHighlight(lastHover);
    });

    renderer.domElement.addEventListener("pointerleave", () => {
      lastHover = null;
      setLayerHighlight(null);
    });

    renderer.domElement.addEventListener("pointerdown", (ev) => {
      pointerDown.x = ev.clientX;
      pointerDown.y = ev.clientY;
      pointerDown.moved = false;
    });

    renderer.domElement.addEventListener("pointermove", (ev) => {
      if (Math.abs(ev.clientX - pointerDown.x) + Math.abs(ev.clientY - pointerDown.y) > 6) {
        pointerDown.moved = true;
      }
    });

    renderer.domElement.addEventListener("click", async (ev) => {
      if (busy || isAutoPlaying || pointerDown.moved) {
        return;
      }
      const picked = pickLayerFromEvent(ev);
      if (!picked) {
        return;
      }
      setLayerHighlight(null);
      await doMoveSpec({ axis: picked.axis, layer: picked.layer, angle: picked.angle, wide: false });
      lastHover = pickLayerFromEvent(ev);
      setLayerHighlight(lastHover);
    });

    window.addEventListener("resize", resize);
  }

  function animate() {
    controls.update();
    void autoDetectAndRedirect();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  buildCube();
  bindUI();
  resize();
  animate();
}

(async function boot() {
  try {
    await loadThreeWithFallback();
    startApp();
  } catch (err) {
    showLoadError("3D 引擎加载失败：当前网络无法访问公共 CDN。建议用可联网环境或我给你改成离线版。\n" + err.message);
    console.error(err);
  }
})();
