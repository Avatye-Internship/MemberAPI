const passport = require("passport");
const { BadRequestError } = require("restify-errors");
const bcrypt = require("bcrypt");
const ResponseDto = require("../model/ResponseDto.js");
const jwt = require("jsonwebtoken");
const {
  createLocalUser,
  findByEmail,
  validByEmail,
  findByVerificationCode,
  deleteEmailCode,
  updateUserDetails,
  deleteUser,
  findUserDetailById,
  findLocalById,
  agreeTerm,
  createUserAddress,
  updateUserAddress,
  findAllUserAddress,
  findUserAddressById,
  deleteUserAddress,
  findAllUserTerms,
  findByTermId,
  updateUser,
  updatePwd,
  createSocialUser,
  updateExDefaultAddress,
  updateNewDefaultAddress,
  findUserProfileById,
  findUserBasicById,
} = require("../../database/user.query.js");
const nodemailer = require("nodemailer");
require("dotenv").config();
const smtpTransport = require("nodemailer-smtp-transport");
const db = require("../../database/pool.js");

//메일 보내는 user 생성
const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: "ngm9464@gmail.com",
      pass: process.env.PASS,
    },
  })
);

module.exports = {
  // 로컬 로그인
  // local login passport 실행후 user 반환
  signIn: async (req: Request, res: Response) => {
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
  socialLogin: async (req: Request, res: Response) => {
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
  getMyProfile: async (req: Requst, res: Response) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        // usertbl
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 유저테이블과 조인해서 i/o를 줄이는 쪽으로..
      const user = await findUserProfileById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 정보 조회 성공", req.user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 내 상세 정보 조회 (유저디테일) - 이름, 닉네임, 핸드폰번호, 성별, 생년월일
  getMyDetail: async (req: Requst, res: Response) => {
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
  getMyBasicInfo: async (req: Requst, res: Response) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        // usertbl
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const user = await findUserBasicById(user_id);
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

  updateTerm: async (req: Requst, res: Response) => {
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
      await agreeTerm(term_id, isAgree, user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 약관 동의 수정 성공"));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 배송지 조회
  getUserAddress: async (req, res) => {
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
      const address = await findAllUserAddress(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "배송지 리스트 조회", address));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 id로 조회
  getUserAddressById: async (req, res) => {
    try {
    } catch (error) {}
  },

  // 배송지 등록
  createUserAddress: async (req, res) => {
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
        await updateExDefaultAddress(user_id);
      }

      // 주소 삽입
      const address = await createUserAddress(req.body);
      return res.status(200).send(new ResponseDto(200, "배송지 생성 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 수정
  updateUserAddress: async (req, res) => {
    try {
      const user_id = req.user.id;
      const address_id = req.params.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isExist = await findUserAddressById(address_id, user_id);
      if (!isExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 배송지가 없습니다"));
      }

      // 일반배송지 -> 기본배송지
      if (req.body.status == 1 && isExist.status == 0) {
        // 기존 배송지를 찾아서 일반으로 바꿈
        await updateExDefaultAddress(user_id);
      }

      // 주소 수정
      await updateUserAddress(id, req.body);
      return res.status(200).send(new ResponseDto(200, "배송지 수정 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 삭제
  deleteUserAddress: async (req, res) => {
    try {
      const address_id = req.params.id;
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isExist = await findUserAddressById(address_id, user_id);
      if (!isExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 배송지가 없습니다"));
      }

      // 기본 배송지 삭제하는 경우
      if (isExist.status == 1) {
        // 제일 최근 수정 배송지를 기본으로 등록
        await updateNewDefaultAddress(address_id);
      }

      await deleteUserAddress(address_id, user_id);
      return res.status(200).send(new ResponseDto(200, "배송지 삭제 성공"));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 사용자가 동의/비동의한 약관 전체 조회 (유저인증 필요)
  getTerms: async (req, res) => {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const userTerms = await findAllUserTerms(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", userTerms));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 사용자가 동의/비동의한 약관 id로 조회 (유저인증 필요)
  getTerm: async (req: Request, res: Response) => {
    try {
      const user_id = req.user.id;
      const term_id = req.params.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const term = await findByTermId(user_id, term_id);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 로컬 회원가입
  signUp: async (req, res) => {
    try {
      const userReq = req.body;
      const termReq = req.body.terms;

      //회원 정보 insert
      const insertId = await createLocalUser(userReq, termReq);
      return res
        .status(201)
        .send(new ResponseDto(201, "회원가입 성공", { id: insertId }));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  //이메일 유효성 인증(로컬 회원가입 시)
  emailValid_signUp: async (req, res) => {
    try {
      const email = req.body.email;
      const subject = "Avatye 이메일 인증";
      const verificationCode = generateVerificationCode(); //인증코드 생성

      //1. email db에 존재하는지 확인
      const emailExists = await findByEmail(email);
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

      return res.status(201).send(
        new ResponseDto(201, "이메일 인증 전송 성공", {
          email: email,
          verificationCode: verificationCode,
        })
      );
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  //이메일 유효성 인증(비밀번호 변경 시)
  emailValid_updatePwdByDB: async (req, res) => {
    try {
      const email = req.body.email;
      const subject = "Avatye 이메일 인증";
      const verificationCode = generateVerificationCode(); //인증코드 생성

      //1. email db에 존재하는지 확인
      const emailExists = await findByEmail(email);
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

      return res.status(201).send(
        new ResponseDto(201, "이메일 인증 전송 성공", {
          email: email,
          verificationCode: verificationCode,
        })
      );
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

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
  updateMyUserDetails: async (req, res) => {
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
  },

  // 비밀번호 변경 ( 로그인한 상태에서 )
  updatePwdByLogin: async (req, res) => {
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
  },

  // 비밀번호 찾기 ( 로그인 X )
  updatePwdByDB: async (req, res) => {
    try {
      const userReq = req.body;

      //2. 이메일 해당하는 pwd 찾기
      const UserEmail = await findByEmail(userReq.email);
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

      const updatedPwd = await updatePwd(UserEmail.user_id, userReq.newPwd);
      return res.status(200).send(new ResponseDto(200, "비밀번호 변경 성공"));
    } catch (err) {
      return res.status(500).json(err.message);
    }
  },

  // 회원 탈퇴
  deleteUser: async (req, res) => {
    try {
      const reason_text = req.body.reason_text;
      // 권한 검사
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const isDeleted = await deleteUser(req.user.id, reason_text);
      return res.status(200).send(new ResponseDto(200, "회원 탈퇴 완료"));
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  },

  // // 내 계정 조회 (로컬, 소셜)
  // getMyAccount: async (req: Requst, res: Response) => {
  //   try {
  //     const user_id = req.user.id; // usertbl
  //     if (user_id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     // 로컬 유저면
  //     if (req.user.login_type == "LOCAL") {
  //       const localUser = await findLocalById(user_id);
  //       return res
  //         .status(200)
  //         .send(new ResponseDto(200, "내 계정 조회 성공", localUser));
  //     }

  //     if (req.user.login_type == "SOCIAL") {
  //       const socialUser = await findSocialById(user_id);
  //       return res
  //         .status(200)
  //         .send(new ResponseDto(200, "내 계정 조회 성공", socialUser));
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).send(err.message);
  //   }
  // },
};

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