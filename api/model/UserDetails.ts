class UserDetails {
  user_detail_id: number;

  user_id: number;

  name: string;

  phone: string;

  gender: string;

  birth: string;

  point: number;

  total_order_amount: number;

  nickname: string;

  profileImg: string;

  created_at: Date;

  updated_at: Date;

  constructor(
    user_detail_id: number,
    user_id: number,
    name: string,
    phone: string,
    gender: string,
    birth: string,
    point: number,
    total_order_amount: number,
    nickname: string,
    profileImg: string,
    created_at: Date,
    updated_at: Date,
  ) {
    this.user_detail_id = user_detail_id;
    this.name = name;
    this.user_id = user_id;
    this.phone = phone;
    this.gender = gender;
    this.birth = birth;
    this.point = point;
    this.total_order_amount = total_order_amount;
    this.nickname = nickname;
    this.profileImg = profileImg;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export default UserDetails;
