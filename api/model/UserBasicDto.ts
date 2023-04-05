class UserBasicDto {
  nickname;

  profile_img;

  constructor(nickname:string, profile_img:string) {
    this.nickname = nickname;
    this.profile_img = profile_img;
  }
}

export default UserBasicDto;
