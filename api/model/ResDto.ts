import Address from "./Address";
import Users from "./Users";
import User_Details from "./User_Details";

export class UserBasicDto{
    nickname;
    profile_img;
    constructor(nickname:string,profile_img:string) {
        this.nickname=nickname,
        this.profile_img=profile_img
    }
}

export class UserInfoDto{
    user;
    userDetails;
    address;
    constructor(user:Users,userDetails:User_Details,address:Address) {
        this.user=user;
        this.userDetails=userDetails;
        this.address=address;
    }
}

export class UserProfileDto{
    id;
    user_grade_id;
    email;
    login_type;
    point;
    profile_img;
    nickname;
    constructor(users:Users,userDetails:User_Details) {
        this.id=users.user_id,
        this.user_grade_id=users.user_grade_id,
        this.email=users.email,
        this.login_type=users.login_type,
        this.point=userDetails.point,
        this.profile_img=userDetails.profile_img,
        this.nickname=userDetails.nickname
    }
}