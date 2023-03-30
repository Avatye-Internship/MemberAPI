class User_Term{
    user_term_id;
    term_id;
    is_agree;
    created_at;
    user_id;
    updated_at;
    constructor(user_term_id:number,term_id:number,is_agree:boolean,created_at:Date,user_id:number,updated_at:Date) {
        this.user_term_id=user_term_id,
        this.term_id=term_id,
        this.is_agree=is_agree,
        this.created_at=created_at,
        this.user_id=user_id,
        this.updated_at=updated_at
    }
}

export default User_Term