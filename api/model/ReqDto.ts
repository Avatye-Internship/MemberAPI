
import Social from "./Social";
import Users from "./Users";
import User_Details from "./User_Details";
import User_Term from "./User_Term";

export class SignUpDto {
    email:string;
    pwd:string;
    name:string;
    gender:string;
    birth:string;
    nickname:string;
    profile_img:string;
    terms:User_Term[];

    constructor(users:Users,userdetail:User_Details,userterm:User_Term[]) {
        this.email=users.email,
        this.pwd=users.pwd,
        this.name=userdetail.name, 
        this.gender=userdetail.gender, 
        this.birth=userdetail.birth, 
        this.nickname=userdetail.nickname, 
        this.profile_img=userdetail.profile_img
        this.terms=userterm
    }
}

export class SocialLoginDto{
    email;
    open_id;
    login_type;
    nickname;

    constructor(users:Users,social:Social,userdetail:User_Details) {
        this.email=users.email,
        this.open_id=social.open_id,
        this.login_type=users.login_type,
        this.nickname=userdetail.nickname
    }
}