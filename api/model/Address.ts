class Address{
    address_id;
    user_id;
    zip_code;
    address;
    address_detail;
    request_msg;
    created_at;
    status;
    updated_at;
    receiver_name;
    receiver_phone;
    constructor(address_id:number,user_id:number,zip_code:string,address:string,address_detail:string,request_msg:string,
        created_at:Date,status:boolean,updated_at:Date,receiver_name:string,receiver_phone:string) {
        this.address_id=address_id,
        this.user_id=user_id,
        this.zip_code=zip_code,
        this.address=address,
        this.address_detail=address_detail,
        this.request_msg=request_msg,
        this.created_at=created_at,
        this.status=status,
        this.updated_at=updated_at,
        this.receiver_name=receiver_name,
        this.receiver_phone=receiver_phone
    }
}

export default Address