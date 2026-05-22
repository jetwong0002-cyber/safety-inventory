export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "环境变量 KV_REST_API_URL 或 KV_REST_API_TOKEN 缺失" });
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${url}/get/safetystock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      let parsed = data.result;
      
      if (!parsed) return res.status(200).json(null);
      
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      
      return res.status(200).json(parsed);
    } catch (error) {
      return res.status(500).json({ error: "GET 读取异常: " + error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const valueStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(["SET", "safetystock", valueStr])
      });
      
      const text = await response.text(); // 先读取纯文本，防止 JSON 解析报错
      
      try {
        const result = JSON.parse(text);
        if (result.error) {
           return res.status(500).json({ error: "KV 数据库返回错误: " + result.error });
        }
        return res.status(200).json({ success: true, debug: text });
      } catch (parseErr) {
        return res.status(500).json({ error: "KV 数据库返回了非 JSON 格式: " + text });
      }
      
    } catch (error) {
      return res.status(500).json({ error: "POST 写入异常: " + error.message });
    }
  }
}
