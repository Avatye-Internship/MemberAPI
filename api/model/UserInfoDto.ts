import Address from './Address';
import { Users } from './Users';
import User_Details from './UserDetails';

class UserInfoDto {
  user;

  userDetails;

  address;

  constructor(user:Users, userDetails:User_Details, address:Address) {
    this.user = user;
    this.userDetails = userDetails;
    this.address = address;
  }
}

export default UserInfoDto;
