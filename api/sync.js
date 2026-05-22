export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "数据库环境变量未配置" });
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${url}/get/safetystock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      let parsed = data.result;
      
      if (!parsed) return res.status(200).json(null);
      
      // 暴力剥离嵌套的字符串，还原成真实对象
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      
      return res.status(200).json(parsed);
    } catch (error) {
      return res.status(500).json({ error: "读取失败" });
    }
  }

  if (req.method === 'POST') {
    try {
      const valueStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      
      // 使用最底层的强制指令格式：["SET", "key", "value"]，这个格式 Vercel 绝对不会拒收
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(["SET", "safetystock", valueStr])
      });
      
      const result = await response.json();
      
      // 如果数据库报错，把它抓出来丢给前端
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }
      return res.status(200).json({ success: true });
      
    } catch (error) {
      return res.status(500).json({ error: "保存失败" });
    }
  }
}
