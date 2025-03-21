import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'database name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export const query = async (sql, values = []) => {
  try {
    const [rows] = await pool.execute(sql, values)

    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}



