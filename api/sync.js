// api/sync.js
// 这是一个运行在云端的 Vercel Serverless Function
export default async function handler(req, res) {
  // 获取 Vercel 自动注入的数据库链接和密钥
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "数据库未连接" });
  }

  // GET 请求：读取库存数据
  if (req.method === 'GET') {
    const response = await fetch(`${url}/get/safetystock`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    // 如果数据库是空的，返回 null；如果有数据，解析并返回
    return res.status(200).json(data.result ? JSON.parse(data.result) : null);
  }

  // POST 请求：更新库存数据
  if (req.method === 'POST') {
    await fetch(`${url}/set/safetystock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // Vercel KV 要求存入的 JSON 必须转换成字符串
      body: JSON.stringify(JSON.stringify(req.body)) 
    });
    return res.status(200).json({ success: true });
  }
}
