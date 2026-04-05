const field = document.getElementById("field");
const ctx = field.getContext("2d");

const growthLabel = document.getElementById("growthLabel");
const dialogBubble = document.getElementById("dialogBubble");
const feedBtn = document.getElementById("feedBtn");
const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("questionInput");

const KIMI_ENDPOINT = "/api/chat";

const tree = {
  growth: 1,
  seed: 20260312,
  swayOffset: Math.random() * Math.PI * 2,
  leafA: "#5cad74",
  leafB: "#3d845a",
  trunk: "#6b4d38"
};

let typingTimer = null;

// --- 核心网络请求 ---
async function askKimi(question) {
  const response = await fetch(KIMI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, growth: tree.growth })
  });

  if (!response.ok) {
    let message = `Kimi API 请求失败: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) message = `${message} - ${errorBody.error}`;
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.reply;
  if (!text || typeof text !== "string") throw new Error("本地服务返回格式异常");

  return text.trim();
}

// --- 数学与工具函数 ---
function mulberry32(seed) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// 优化 1：画布防抖重绘（节约性能养分）
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  field.width = Math.round(w * ratio);
  field.height = Math.round(h * ratio);
  field.style.width = `${w}px`;
  field.style.height = `${h}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// 优化 2：具有呼吸感的打字机效果
function typeSpeak(text, baseSpeed = 30) {
  if (typingTimer) clearTimeout(typingTimer);
  dialogBubble.textContent = "";
  let i = 0;

  function typeNextChar() {
    dialogBubble.textContent = text.slice(0, i + 1);
    i++;
    if (i < text.length) {
      // 加入一点随机延迟，模拟真实的顿挫感
      const jitter = Math.random() * 20 - 10; 
      typingTimer = setTimeout(typeNextChar, Math.max(10, baseSpeed + jitter));
    } else {
      typingTimer = null;
    }
  }
  typeNextChar();
}

// --- 绘图逻辑 ---
function drawSkyAndGround(w, h, tick) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#d7ecff");
  sky.addColorStop(0.55, "#e6f5ef");
  sky.addColorStop(1, "#d6ebd8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.84;
  const sunY = h * 0.12;
  const sunR = 56 + Math.sin(tick * 0.0012) * 4; // 太阳的微弱呼吸
  const sun = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunR);
  sun.addColorStop(0, "rgba(255, 246, 190, 0.95)");
  sun.addColorStop(1, "rgba(255, 246, 190, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  const lawn = ctx.createLinearGradient(0, h * 0.55, 0, h);
  lawn.addColorStop(0, "#a2d8a5");
  lawn.addColorStop(1, "#72b179");
  ctx.fillStyle = lawn;
  ctx.fillRect(0, h * 0.56, w, h * 0.44);

  for (let i = 0; i < 5; i += 1) {
    const y = h * (0.62 + i * 0.08);
    ctx.fillStyle = i % 2 ? "rgba(116, 177, 116, 0.15)" : "rgba(96, 162, 100, 0.12)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, y, w * 0.6, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLeaf(x, y, size, rand) {
  const color = rand() > 0.35 ? tree.leafA : tree.leafB;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
  ctx.beginPath();
  ctx.arc(x - size * 0.32, y - size * 0.34, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawWiseFace(cx, cy, trunkW, trunkH, tick) {
  const eyeY = cy - trunkH * 0.18;
  const blink = Math.sin(tick * 0.004) > 0.97 ? 0.2 : 1;

  ctx.fillStyle = "rgba(31, 20, 13, 0.72)";
  ctx.beginPath();
  ctx.ellipse(cx - trunkW * 0.16, eyeY, trunkW * 0.06, trunkW * 0.09 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + trunkW * 0.16, eyeY, trunkW * 0.06, trunkW * 0.09 * blink, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 186, 188, 0.28)";
  ctx.beginPath();
  ctx.ellipse(cx - trunkW * 0.26, cy - trunkH * 0.04, trunkW * 0.08, trunkW * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + trunkW * 0.26, cy - trunkH * 0.04, trunkW * 0.08, trunkW * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(49, 30, 21, 0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + trunkH * 0.04, trunkW * 0.13, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawRootDetails(baseX, baseY, rootWidth) {
  const rand = mulberry32(tree.seed + 777);
  ctx.fillStyle = "rgba(96, 72, 47, 0.4)";
  ctx.beginPath();
  ctx.ellipse(baseX, baseY + 8, rootWidth * 1.95, rootWidth * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  const rootCount = 8;
  for (let i = 0; i < rootCount; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const spread = rootWidth * (0.35 + (i / rootCount) * 0.78);
    const sx = baseX + side * spread * (0.5 + rand() * 0.35);
    const sy = baseY + rand() * 2.4;
    const len = rootWidth * (1.4 + rand() * 1.2);
    const ex = sx + side * len;
    const ey = sy + len * (0.46 + rand() * 0.33);
    const cx = (sx + ex) * 0.5 + side * len * (0.16 + rand() * 0.16);
    const cy = (sy + ey) * 0.5 + len * (0.14 + rand() * 0.15);

    ctx.strokeStyle = "rgba(86, 62, 41, 0.62)";
    ctx.lineWidth = Math.max(1.1, rootWidth * 0.15 * (0.82 + rand() * 0.42));
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
}

function drawFractalTree(baseX, baseY, tick) {
  const rand = mulberry32(tree.seed);
  
  // 回归沉稳，取消摇晃
  const sway = 0;

  const growthPow = Math.pow(tree.growth, 0.72);
  const rootLen = 30 + growthPow * 7.5;
  const rootWidth = 13 + Math.pow(tree.growth, 0.5) * 1.35;

  drawRootDetails(baseX, baseY, rootWidth);
  const tips = [];

  function branch(x, y, len, angle, width, depth) {
    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;
    const midX = (x + nx) * 0.5;
    const midY = (y + ny) * 0.5;
    const bend = (rand() - 0.5) * len * 0.09;
    const ctrlX = midX + Math.cos(angle + Math.PI / 2) * bend;
    const ctrlY = midY + Math.sin(angle + Math.PI / 2) * bend;

    ctx.strokeStyle = tree.trunk;
    ctx.lineWidth = Math.max(0.75, width);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(ctrlX, ctrlY, nx, ny);
    ctx.stroke();

    const nextLen = len * (0.69 + rand() * 0.14);
    const nextWidth = width * (0.72 + rand() * 0.08);

    if (nextLen < 4.2 || depth > 24) {
      tips.push({ x: nx, y: ny, size: clamp(1.5 + width * 0.36, 1.5, 6.5) });
      return;
    }

    const chance = rand();
    let count = chance > 0.76 ? 3 : 2;

    for (let i = 0; i < count; i += 1) {
      const center = i - (count - 1) / 2;
      const spread = 0.34 + rand() * 0.44;
      // 移除了 sway 带来的动态计算，恢复静态生长
      const branchAngle = angle + center * spread + (rand() - 0.5) * 0.14;
      const childLen = nextLen * (0.88 + rand() * 0.22);
      branch(nx, ny, childLen, branchAngle, nextWidth, depth + 1);
    }
  }

  branch(baseX, baseY, rootLen, -Math.PI / 2, rootWidth, 1);

  for (let i = 0; i < tips.length; i += 1) {
    const tip = tips[i];
    const jitterX = (rand() - 0.5) * 2.4;
    const jitterY = (rand() - 0.5) * 2.4;
    drawLeaf(tip.x + jitterX, tip.y + jitterY, tip.size, rand);
  }

  const trunkH = rootLen * 0.68;
  const trunkW = rootWidth * 2.2;
  drawWiseFace(baseX, baseY - trunkH * 0.56, trunkW, trunkH, tick);
}

function draw(tick) {
  const w = field.clientWidth;
  const h = field.clientHeight;
  ctx.clearRect(0, 0, w, h);

  drawSkyAndGround(w, h, tick);
  drawFractalTree(w * 0.5, h * 0.83, tick);

  requestAnimationFrame(draw);
}

// --- 本地回退语录 ---
function wisdomLineForGrowth() {
  const g = tree.growth;
  if (g < 8) return "先向下扎根，再向上发问。真正的成长，常从看不见的地方开始。";
  if (g < 20) return "时间不会替你前进，但会把你重复做的事，慢慢雕成你的形状。";
  if (g < 45) return "风不是来打败树的，风只是提醒树: 柔软也是一种力量。";
  if (g < 90) return "当你不再急着证明自己，世界才开始把更大的问题交给你。";
  return "年轮从不喧哗，却记录了每一次沉默中的选择。命运，往往由这些选择构成。";
}

function growthStageGenericReplies() {
  const g = tree.growth;
  if (g < 8) return ["别急着找终点，先把脚下这一寸土壤踩实。", "很多答案不是想出来的，而是做着做着长出来的。", "你今天认真对待的小事，明天会成为你稳住自己的根。"];
  if (g < 20) return ["把问题拆小，不是妥协，而是让改变有了入口。", "所谓方向感，往往来自一次次校准，而不是一次决定。", "你重复的习惯，就是你在时间里写下的自我介绍。"];
  if (g < 45) return ["当你允许不确定存在，思考才会真正开始。", "真正的稳定不是不摇晃，而是摇晃之后还能回到中心。", "别怕慢，怕的是把焦虑误认成行动。"];
  if (g < 90) return ["看见复杂，不代表无能；能在复杂里找到次序，才是成熟。", "有些路要独自走，不是因为孤独，而是因为那段理解只能亲自抵达。", "当你学会与代价共处，选择才真正属于你。"];
  return ["所谓智慧，不是永远正确，而是愿意不断修正自己。", "你以为自己在走向未来，其实也在不断重写过去的意义。", "最高级的力量，是看透之后仍然愿意温柔地生活。"];
}

function answerQuestion(text) {
  const q = text.trim();
  if (!q) return "问题空空的时候，先观察风向。你想聊学习、心情，还是未来？";
  if (/学习|数学|考试|作业/.test(q)) return "学习像分形: 一个小结论会长出更多分支。先抓主干，再补细枝。";
  if (/焦虑|迷茫|难过|压力/.test(q)) return "先把呼吸放慢: 吸气四拍，停两拍，呼气六拍。树也靠节律活着。";
  if (/目标|计划|未来|方向/.test(q)) return "把目标拆成今天能做的三件小事。树长高，也是一段段节间累起来的。";
  if (/你是谁|名字|智慧树/.test(q)) return "我是你的智慧树，负责生长，也负责陪你把问题想清楚。";
  const generic = growthStageGenericReplies();
  return generic[Math.floor(Math.random() * generic.length)];
}

// --- 交互事件 ---
function feedTree() {
  const gain = 0.8 + Math.random() * 2.3;
  tree.growth += gain;
  growthLabel.textContent = `成长值 ${tree.growth.toFixed(1)}`;
  typeSpeak(wisdomLineForGrowth());
}

feedBtn.addEventListener("click", feedTree);
askBtn.addEventListener("click", handleAsk);

async function handleAsk() {
  const userQuestion = questionInput.value.trim();
  if (!userQuestion) {
    typeSpeak(answerQuestion(""));
    return;
  }

  askBtn.disabled = true;
  askBtn.textContent = "光合作用中..."; // 修改了文案，更符合大树的设定

  try {
    const kimiReply = await askKimi(userQuestion);
    typeSpeak(kimiReply, 20); // 给 Kimi 的回复稍微加快一点基础语速
  } catch (error) {
    console.error(error);
    typeSpeak(`${answerQuestion(userQuestion)}（提示: 汲取云端养分失败，已回退到本地记忆。）`);
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "提问";
    questionInput.value = "";
  }
}

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !askBtn.disabled) {
    askBtn.click();
  }
});

// 引入防抖的 Resize 监听
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
});

// --- 初始化 ---
resizeCanvas();
growthLabel.textContent = `成长值 ${tree.growth.toFixed(1)}`;
requestAnimationFrame(draw);