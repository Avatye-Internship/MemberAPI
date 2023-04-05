class Terms {
  termId;

  name;

  isRequired;

  createdAt;

  updatedAt;

  constructor(termId:number, name:string, is_required:boolean, createdAt:Date, updatedAt:Date) {
    this.termId = termId;
    this.name = name;
    this.isRequired = is_required;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
export default Terms;
