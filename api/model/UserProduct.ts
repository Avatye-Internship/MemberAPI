class UserProduct {
  user_product_id;

  product_id;

  user_id;

  status;

  created_at;

  updated_at;

  constructor(
    user_product_id : number,
    product_id : number,
    user_id : number,
    status : Status,
    created_at : Date,
    updated_at : Date,
  ) {
    this.user_product_id = user_product_id;
    this.product_id = product_id;
    this.user_id = user_id;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export type Status = '참여 전' | '참여 완료';

export default UserProduct;
