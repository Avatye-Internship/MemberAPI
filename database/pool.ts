import mysql from 'mysql2';

// getConnection으로 연결하는 것보다 전에 있던 pool을 이용해서 연결해서 속도가 더 빠름
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'shoppingdb',
  multipleStatements: true,
});

// const db = pool.promise();

export default pool;
