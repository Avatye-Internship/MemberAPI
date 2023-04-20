class Product {
  product_id;

  name;

  description;

  product_point;

  category;

  start_at;

  end_at;

  created_at;

  updated_at;

  constructor(
    product_id: number,
    name: string,
    description: string,
    product_point: number,
    category: Category,
    start_at: Date,
    end_at: Date,
    created_at: Date,
    updated_at: Date,
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.product_point = product_point;
    this.category = category;
    this.start_at = start_at;
    this.end_at = end_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export type Category = 'all' | 'shopping' | 'card' | 'life' | 'join';

export default Product;
