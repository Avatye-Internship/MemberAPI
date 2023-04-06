class Product {
  product_id;

  name;

  description;

  product_point;

  category;

  start_date;

  end_date;

  created_at;

  updated_at;

  constructor(
    product_id: number,
    name: string,
    description: string,
    product_point: number,
    category: Category,
    start_date: Date,
    end_date: Date,
    created_at: Date,
    updated_at: Date
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.product_point = product_point;
    this.category = category;
    this.start_date = start_date;
    this.end_date = end_date;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export type Category = "all" | "shopping" | "card" | "life" | "join";

export default Product;
