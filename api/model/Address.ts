class Address {
  addressId: number;

  userId: number;

  zipCode: string;

  address: string;

  addressDetail: string;

  requestMsg: string;

  createdAt: Date;

  status: boolean;

  updatedAt: Date;

  receiverName: string;

  receiverPhone: string;

  constructor(
    addressId: number,
    userId: number,
    zipCode: string,
    address: string,
    addressDetail: string,
    requestMsg: string,
    createdAt: Date,
    status: boolean,
    updatedAt: Date,
    receiverName: string,
    receiverPhone: string,
  ) {
    this.addressId = addressId;
    this.userId = userId;
    this.zipCode = zipCode;
    this.address = address;
    this.addressDetail = addressDetail;
    this.requestMsg = requestMsg;
    this.createdAt = createdAt;
    this.status = status;
    this.updatedAt = updatedAt;
    this.receiverName = receiverName;
    this.receiverPhone = receiverPhone;
  }
}

export default Address;
