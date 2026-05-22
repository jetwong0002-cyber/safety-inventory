import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 1. 强制检查：看看 Vercel 到底有没有把 Neon 的密码给这个文件
  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({ error: "致命错误：找不到 POSTGRES_URL，Vercel 没有把数据库密码传过来！" });
  }

  try {
    // 2. 尝试建表
    await sql`CREATE TABLE IF NOT EXISTS inventory_data (id INT PRIMARY KEY, content JSONB)`;

    // 3. GET 读取数据
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT content FROM inventory_data WHERE id = 1`;
      return res.status(200).json(rows.length > 0 ? rows[0].content : null);
    }

    // 4. POST 写入数据
    if (req.method === 'POST') {
      await sql`
        INSERT INTO inventory_data (id, content)
        VALUES (1, ${JSON.stringify(req.body)})
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
      `;
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    // 如果是 SQL 报错，把完整的英文错误信息抓出来
    return res.status(500).json({ error: "Neon 数据库运行报错: " + error.message });
  }
}
