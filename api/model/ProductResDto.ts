import { Category } from './Product';

class ProductResDto {
  product_id;

  name;

  description;

  product_point;

  category;

  status;

  main_img;

  constructor(
    product_id: number,
    name: string,
    description: string,
    product_point: number,
    category: Category,
    main_img: string,
    status?: string,
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.product_point = product_point;
    this.category = category;
    this.status = status;
    this.main_img = main_img;
  }
}

export default ProductResDto;
