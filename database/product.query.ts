import ProductResDto from '../api/model/ProductResDto';
import pool from './pool';

class ProductQuery {
  private pool = pool;

  private db = this.pool.promise();

  public async findProductByCategory(userId: string, category: string): Promise<ProductResDto[]> {
    const sql = 'call select_all_user_product (?,?)';
    const results: ProductResDto[] = await this.db
      .query(sql, [userId, category])
      .then((data: any) => data[0][0]);
    console.log(results);
    console.log(results.length);
    return results;
  }

  public async findProductById(productId: string, userId: string)
    : Promise<ProductResDto> {
    const sql = 'call select_user_product_by_id (?,?)';
    const results: ProductResDto = await this.db.query(sql, [productId, userId])
      .then((data:any) => data[0][0][0]);
    return results;
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
