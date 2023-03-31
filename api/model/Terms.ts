class Terms{
    term_id;
    name;
    is_required;
    created_at;
    updated_at;
    constructor(term_id:number,name:string,is_required:boolean,created_at:Date,updated_at:Date
    ){
        this.term_id=term_id,
        this.name=name,
        this.is_required=is_required,
        this.created_at=created_at,
        this.updated_at=updated_at
    }
}
export default Terms