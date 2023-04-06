import { Category } from './Product';

class ProductResDto {
  product_id;

  name;

  description;

  product_point;

  category;

  status;

  constructor(
    product_id: number,
    name: string,
    description: string,
    product_point: number,
    category: Category,
    status?: string,
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.product_point = product_point;
    this.category = category;
    this.status = status;
  }
}

export default ProductResDto;
