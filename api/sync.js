import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // 1. 初始化：如果数据库里没有表，就自动建一个叫 inventory_data 的表
    await sql`CREATE TABLE IF NOT EXISTS inventory_data (id INT PRIMARY KEY, content JSONB)`;

    // 2. GET 请求：读取数据
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT content FROM inventory_data WHERE id = 1`;
      if (rows.length > 0) {
        return res.status(200).json(rows[0].content);
      } else {
        return res.status(200).json(null); // 表是空的
      }
    }

    // 3. POST 请求：更新数据
    if (req.method === 'POST') {
      const data = req.body;
      
      // SQL 语法：插入数据，如果 id=1 已经存在，就覆盖更新它
      await sql`
        INSERT INTO inventory_data (id, content)
        VALUES (1, ${JSON.stringify(data)})
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
      `;
      
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error("数据库操作失败:", error);
    return res.status(500).json({ error: error.message });
  }
}
