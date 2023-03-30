import userQuery from "../../database/user.query";


class UserController {
    // 로컬 로그인
  // local login passport 실행후 user 반환
  public async signIn (req: Request, res: Response) {
    try {
      const user = req.user; // usertbl
      // 로그인 실패시 에러 반환
      if (user.user_id == null) {
        return res.status(user.code).send(new ResponseDto(user.code, user.msg));
      } else {
        // 로그인 성공시 jwt 토큰 반환
        const jwtToken = await generateJWTToken(user.user_id, user.role);
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      return res.status(500).json(err.message);
    }
  },

  // 소셜 로그인
  public async  socialLogin (req: Request, res: Response) {
    try {
      const user = req.user; // socialtbl
      // 로그인 실패시 에러 반환
      if (user.user_id == null) {
        return res.status(user.code).send(new ResponseDto(user.code, user.msg));
      } else {
        // 로그인 성공시 토큰 반환
        const jwtToken = await generateJWTToken(user.user_id, user.role);
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  },

  //email 중복 확인
  // checkEmail: async (req, res) => {
  //   try {
  //     const email = req.body.email;
  //     // email 중복 확인
  //     const isExist = await findByEmail(email);
  //     if (isExist) {
  //       return res.status(409).send(new ResponseDto(409, "이미 가입된 이메일"));
  //     } else {
  //       return res.status(200).send(new ResponseDto(200, "가입 가능한 이메일"));
  //     }
  //   } catch (error) {
  //     console.log(err);
  //     return res.status(500).json(error.message);
  //   }
  // },

  // 내 정보 조회 (유저)
  public async getMyProfile (req: Requst, res: Response) {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        // usertbl
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 유저테이블과 조인해서 i/o를 줄이는 쪽으로..
      const user = await userQuery.findUserProfileById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 정보 조회 성공", req.user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }

  // 내 상세 정보 조회 (유저디테일) - 이름, 닉네임, 핸드폰번호, 성별, 생년월일
  public async getMyDetail async (req: Requst, res: Response) {
    try {
      const user_id = req.user.id; // usertbl
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
      const user = await findUserDetailById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 상세 정보 조회 성공", user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 프로필 이미지, 닉네임
  public async getMyBasicInfo (req: Requst, res: Response)  {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        // usertbl
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const user = await userQuery.findUserBasicById(user_id);
      return res
        .status(200)
        .send(
          new ResponseDto(200, "프로필이미지, 닉네임 정보 조회 성공", user)
        );
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  public async  updateTerm (req: Requst, res: Response)  {
    try {
      const term_id = req.params.id; // term_id
      const { isAgree } = req.body;
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
      await userQuery.agreeTerm(term_id, isAgree, user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 약관 동의 수정 성공"));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 배송지 조회
  public async getUserAddress(req, res)  {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        //usertbl
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 주소 리스트 반환
      const address = await userQuery.findAllUserAddress(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "배송지 리스트 조회", address));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 id로 조회
  public async getUserAddressById (req, res) {
    try {
    } catch (error) {}
  },

  // 배송지 등록
  public async createUserAddress (req, res) {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 기본 배송지로 저장 체크했는지 확인
      if (req.body.status == 1) {
        // 기존 배송지를 찾아서 일반으로 바꿈
        await userQuery.updateExDefaultAddress(user_id);
      }

      // 주소 삽입
      const address = await userQuery.createUserAddress(req.body);
      return res.status(200).send(new ResponseDto(200, "배송지 생성 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 수정
  public async updateUserAddress (req, res) {
    try {
      const user_id = req.user.id;
      const address_id = req.params.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isExist = await userQuery.findUserAddressById(address_id, user_id);
      if (!isExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 배송지가 없습니다"));
      }

      // 일반배송지 -> 기본배송지
      if (req.body.status == 1 && isExist.status == 0) {
        // 기존 배송지를 찾아서 일반으로 바꿈
        await userQuery.updateExDefaultAddress(user_id);
      }

      // 주소 수정
      await userQuery.updateUserAddress(id, req.body);
      return res.status(200).send(new ResponseDto(200, "배송지 수정 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  // 배송지 삭제
  public async deleteUserAddress (req, res) {
    try {
      const address_id = req.params.id;
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isExist = await userQuery.findUserAddressById(address_id, user_id);
      if (!isExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 배송지가 없습니다"));
      }

      // 기본 배송지 삭제하는 경우
      if (isExist.status == 1) {
        // 제일 최근 수정 배송지를 기본으로 등록
        await userQuery.updateNewDefaultAddress(address_id);
      }

      await userQuery.deleteUserAddress(address_id, user_id);
      return res.status(200).send(new ResponseDto(200, "배송지 삭제 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  // 사용자가 동의/비동의한 약관 전체 조회 (유저인증 필요)
  public async getTerms(req, res)  {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const userTerms = await userQuery.findAllUserTerms(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", userTerms));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 사용자가 동의/비동의한 약관 id로 조회 (유저인증 필요)
  public async getTerm (req: Request, res: Response)  {
    try {
      const user_id = req.user.id;
      const term_id = req.params.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const term = await userQuery.findByTermId(user_id, term_id);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
  // 로컬 회원가입
  public async signUp (req, res) {
    try {
      const userReq = req.body;
      const termReq = req.body.terms;

      //회원 정보 insert
      const insertId = await userQuery.createLocalUser(userReq, termReq) 
      return res
        .status(201)
        .send(new ResponseDto(201, "회원가입 성공", { id: insertId }));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  //이메일 유효성 인증(로컬 회원가입 시)
  public async emailValid_signUp (req, res) {
    try {
      const email = req.body.email;
      const subject = "Avatye 이메일 인증";
      const verificationCode = generateVerificationCode(); //인증코드 생성

      //1. email db에 존재하는지 확인
      const emailExists = await userQuery.findByEmail(email);
      if (emailExists) {
        return res
          .status(409)
          .send(
            new ResponseDto(
              409,
              `이미 '${emailExists.login_type}'로 가입된 이메일입니다.`
            )
          );
      }
      //2. 이메일 인증코드 전송

      const text = `인증코드는 ${verificationCode} 입니다.`;
      let mailOptions = {
        from: "ngm9464@gmail.com",
        to: email,
        subject: subject,
        text: text,
      };

      const info = await transporter.sendMail(mailOptions); //이메일 전송
      console.log("Email sent: " + info.response);

      return res
        .status(201)
        .send(
          new ResponseDto(201, "이메일 인증 전송 성공", {
            email: email,
            verificationCode: verificationCode,
          })
        );
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  //이메일 유효성 인증(비밀번호 변경 시)
  public async emailValid_updatePwdByDB (req, res) {
    try {
      const email = req.body.email;
      const subject = "Avatye 이메일 인증";
      const verificationCode = generateVerificationCode(); //인증코드 생성

      //1. email db에 존재하는지 확인
      const emailExists = await userQuery.findByEmail(email);
      if (!emailExists) {
        return res
          .status(401)
          .send(new ResponseDto(401, "존재하지 않는 이메일입니다."));
      }
      //2. 이메일 인증코드 전송
      const text = `인증코드는 ${verificationCode} 입니다.`;
      let mailOptions = {
        from: "ngm9464@gmail.com",
        to: email,
        subject: subject,
        text: text,
      };

      const info = await transporter.sendMail(mailOptions); //이메일 전송
      console.log("Email sent: " + info.response);

      return res
        .status(201)
        .send(
          new ResponseDto(201, "이메일 인증 전송 성공", {
            email: email,
            verificationCode: verificationCode,
          })
        );
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  //내 프로필 수정
  // updateMyUsers: async (req, res) => {
  //   try {
  //     const userReq = req.body;
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     const newUser = await updateUser(req.user.id, userReq);
  //     return res
  //       .status(200)
  //       .send(new ResponseDto(200, "내 프로필 수정 성공"));
  //   } catch (error) {
  //     return res.status(500).json(error.message);
  //   }
  // },

  //내 정보 수정
  public async updateMyUserDetails (req, res) {
    try {
      const userReq = req.body;
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const newUser = await updateUserDetails(req.user.id, userReq.users);
      return res.status(200).send(new ResponseDto(200, "내 정보 수정 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  // 비밀번호 변경 ( 로그인한 상태에서 )
  public async updatePwdByLogin (req, res) {
    try {
      const userReq = req.body;

      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      console.log(req.user);
      const User = await findById(req.user.id);
      // 해쉬된 비밀번호 비교
      const isSame = await bcrypt.compare(userReq.oldPwd, User.pwd);

      // 비번 같으면 변경 가능
      if (isSame) {
        const updatedPwd = await updatePwd(req.user.id, userReq.newPwd);
        return res.status(200).send(new ResponseDto(200, "비밀번호 변경 성공"));
      } else {
        return res
          .status(400)
          .send(new ResponseDto(400, "현재 비밀번호가 올바르지 않습니다"));
      }
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }

  // 비밀번호 찾기 ( 로그인 X )
  public async updatePwdByDB (req, res) {
    try {
      const userReq = req.body;

      //2. 이메일 해당하는 pwd 찾기
      const UserEmail = await userQuery.findByEmail(userReq.email);
      if (!UserEmail) {
        return res
          .status(401)
          .send(new ResponseDto(401, "존재하지 않는 이메일"));
      }
      const isSame = await bcrypt.compare(userReq.newPwd, UserEmail.pwd);
      // 비번 같으면 변경 불가능
      if (isSame) {
        return res
          .status(400)
          .send(
            new ResponseDto(
              400,
              "이전 비밀번호와 일치합니다. 다른 비밀번호를 입력해주세요"
            )
          );
      }

      const updatedPwd = await userQuery.updatePwd(UserEmail.user_id, userReq.newPwd);
      return res.status(200).send(new ResponseDto(200, "비밀번호 변경 성공"));
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }

  // 회원 탈퇴
  public async deleteUser (req, res)  {
    try {
      const reason_text = req.body.reason_text;
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isDeleted = await userQuery.deleteUser(req.user.id, reason_text);
      return res.status(200).send(new ResponseDto(200, "회원 탈퇴 완료"));
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  }
}

// 토큰 만들기
const generateJWTToken = async (id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

//인증코드 생성
const generateVerificationCode = () => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default new UserController();

