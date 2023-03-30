class Social{
    social_id;
    user_id;
    open_id;
    created_at;
    updated_at;

    constructor(social_id:number,user_id:number,open_id:string,created_at:Date,updated_at:Date,) {
        this.social_id=social_id,
        this.user_id=user_id,
        this.open_id=open_id,
        this.created_at=created_at,
        this.updated_at=updated_at
    }
}

export default Social;