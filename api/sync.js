export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "数据库未配置" });
  }

  if (req.method === 'GET') {
    const response = await fetch(`${url}/get/safetystock`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    
    try {
      let parsed = data.result;
      // 容错处理：确保无论怎么嵌套都能正确解析成对象
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed); 
      return res.status(200).json(parsed);
    } catch (e) {
      return res.status(200).json(null);
    }
  }

  if (req.method === 'POST') {
    const valueToStore = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    await fetch(`${url}/set/safetystock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: valueToStore
    });
    return res.status(200).json({ success: true });
  }
}
