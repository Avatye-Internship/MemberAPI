import { Category } from './Product';

class ProductResDto {
  product_id;

  name;

  description;

  product_point;

  category;

  status;

  main_img;

  detail_img;

  start_at;

  end_at;

  constructor(
    product_id: number,
    name: string,
    description: string,
    product_point: number,
    category: Category,
    main_img: string,
    status?: string,
    detail_img?: string,
    start_at?: Date,
    end_at?: Date,
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.product_point = product_point;
    this.category = category;
    this.status = status;
    this.main_img = main_img;
    this.detail_img = detail_img;
    this.start_at = start_at;
    this.end_at = end_at;
  }
}

export default ProductResDto;
