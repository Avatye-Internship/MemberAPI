class User_Details{
    user_detail_id;
    user_id;
    name;
    phone;
    gender;
    birth;
    point;
    total_order_amount;
    nickname;
    profile_img;
    created_at;
    updated_at;
    constructor(user_detail_id:number,user_id:number,name:string,phone:string,gender:string,birth:string,point:number,total_order_amount:number,nickname:string,profile_img:string,created_at:Date,updated_at:Date
    )
    {
        this.user_detail_id=user_detail_id,
        this.name=name,
        this.user_id=user_id,
        this.phone=phone,
        this.gender=gender,
        this.birth=birth,
        this.point=point,
        this.total_order_amount=total_order_amount,
        this.nickname=nickname,
        this.profile_img=profile_img,
        this.created_at=created_at,
        this.updated_at=updated_at
    }
}

export default User_Details