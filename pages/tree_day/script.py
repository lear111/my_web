from openai import OpenAI

# 填入你刚才提供的测试密钥
API_KEY = ""

client = OpenAI(
    api_key=API_KEY,
    base_url="https://api.moonshot.cn/v1",
)

try:
    print("正在尝试连接 kimi-k2.5 ...")
    completion = client.chat.completions.create(
        model="kimi-k2.5",
        messages=[
            {
                "role": "user",
                "content": [{"type": "text", "text": "这是一条联通性测试，请回复收到。"}]
            }
        ]
    )
    print("✅ 调用成功！回复内容：")
    print(completion.choices[0].message.content)
except Exception as e:
    print("❌ 调用失败！官方返回的精确错误信息如下：")
    print(e)