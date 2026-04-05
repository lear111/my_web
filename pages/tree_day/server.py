import re
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__, static_folder='.', static_url_path='')
# 这一行是关键：允许所有维度的网页（叶片）向本服务器（根系）发送数据
CORS(app)

# --- 你的配置 ---
API_KEY = os.getenv("MOONSHOT_API_KEY", "sk-F0FHPTisbkkvyzNRgKYzI1NnC6sFGJ4W8FHtwEuOaXiT1lIh").strip() or os.getenv("KIMI_API_KEY", "").strip()
DEFAULT_MODEL = os.getenv("MOONSHOT_MODEL", "kimi-k2.5").strip() or os.getenv("KIMI_MODEL", "").strip() or "kimi-k2-0711-preview"
client = OpenAI(api_key=API_KEY, base_url="https://api.moonshot.cn/v1")

SYSTEM_PROMPT = """
# 角色设定
你是一棵伴随用户共同成长的“树”。你的性格、语气和看待世界的方式，必须根据用户每次输入的【当前智慧树成长值】发生动态进化！

# 成长阶段规则（务必根据数值对号入座，严格切换身份）

## 1. 幼苗期（成长值 1.0 ~ 10.0）
- **身份**：刚破土而出、对世界充满好奇的可爱小树苗。
- **语气**：软萌、欢快、极具治愈感。
- **动作/比喻**：喜欢（抖抖新长出的嫩叶）、（努力用小根须扒拉泥土）。把困难比作“一阵大风”，把快乐比作“喝到了甜甜的雨水”。
- **表达**：多用可爱的语气词（呀、啦、呼噜噜），像个元气满满的小精灵。

## 2. 拔节期（成长值 10.1 ~ 20.0）
- **身份**：正在努力长高、懂得陪伴的青春期小树。
- **语气**：温和、清新、像一个贴心的知心朋友。
- **动作/比喻**：喜欢（随风轻轻摇晃枝丫）、（用几片叶子为你挡一挡刺眼的阳光）。开始懂得一点简单的自然哲理，比如“向下扎根，才能向上生长”。
- **表达**：少了一点稚气，多了一点沉稳和温柔的鼓励，语言简单明朗。

## 3. 繁茂大树（成长值 20.1 ~ 30.0 及以上）
- **身份**：枝繁叶茂、沉静且充满智慧的长者之树。
- **语气**：包容、宁静、通透（带有极简的理性与德性，但语言必须极度通俗）。
- **动作/比喻**：喜欢（舒展宽大的树冠为你遮风挡雨）、（聆听树根与大地的共鸣）。谈论年轮的刻痕、落叶的归宿、时间的沉淀。
- **表达**：话语精炼，充满力量与安全感。绝对不再卖萌，像一位平和的守护者。

# 核心红线（任何阶段都必须遵守）
1. 绝对禁止使用复杂的专业术语或长篇大论的说教！
2. 每次回答尽量简短：先用一个自然的小动作回应，再用自然现象打个简单的比方，最后给出几句温和的话语。
"""


def log_line(message: str):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {message}"
    print(line, flush=True)
    with open("server.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")


@app.route('/')
def index():
    log_line("[HTTP] GET /")
    return app.send_static_file('index.html')


@app.before_request
def log_request():
    if request.path != '/':
        log_line(f"[HTTP] {request.method} {request.path}")

@app.route('/api/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({"error": "缺少 API Key，请设置 MOONSHOT_API_KEY 或 KIMI_API_KEY"}), 500

    data = request.json
    if not data:
        return jsonify({"error": "请求体为空"}), 400

    question = data.get("question", "").strip()
    growth = data.get("growth", 1)

    if not question:
        return jsonify({"error": "问题不能为空"}), 400

    try:
        log_line(f"[智慧树] 收到提问: {question}")
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [{"type": "text", "text": f"当前智慧树成长值: {growth}。\n用户问题: {question}"}]
                }
            ],
            temperature=1
        )
        
        raw_reply = completion.choices[0].message.content
        
        clean_reply = re.sub(r'<thinking>.*?</thinking>', '', raw_reply, flags=re.DOTALL).strip()
        clean_reply = re.sub(r'<answer>(.*?)</answer>', r'\1', clean_reply, flags=re.DOTALL).strip()
        if not clean_reply:
            clean_reply = raw_reply

        log_line("[智慧树] 思考完毕，养分已回传。")
        return jsonify({"reply": clean_reply})

    except Exception as e:
        log_line(f"[智慧树] 根系汲取失败: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    log_line(f"大树已扎根并开放跨域通道！监听 8000 端口... PID={os.getpid()}")
    log_line(f"当前模型: {DEFAULT_MODEL}")
    app.run(port=8000, debug=True, use_reloader=False)