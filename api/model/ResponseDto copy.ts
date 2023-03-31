class ResponseDto {
  statusCode;
  message;
  data;

  constructor(statusCode:number, message:string, data:any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ResponseDto;
