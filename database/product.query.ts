import pool from './pool';

class ProductQuery {
  private pool = pool;

  private db = this.pool.promise();

  public async findProductByCategory(category: string) {
    try {
      // const sql = 'select product_id, name, description, product_point,
      // category,start_date, end_date from Product ';
      await this.db.query('call ', [category]);
    } catch (error) {
      console.log(error);
    }
  }

  public async findProductById(id: string) {
    try {
      await this.db.query('call', [id]);
    } catch (error) {
      console.log(error);
    }
  }

  public async updatePointByStatus(id: string, product_id: string): Promise<void> {
    try {
      const sql = 'call update_user_status (?,?)';
      await this.db.query(sql, [id, product_id]);
    } catch (error) {
      console.log(error);
    }
  }
}

export default new ProductQuery();
