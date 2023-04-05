import 'dotenv/config';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import { NextFunction, Request, Response } from 'express';
import console from 'console';
import userQuery from '../../database/user.query';
import ResponseDto from '../model/ResponseDto';
import {
  Users,
  UpdatePwdByLoginDto,
  UpdatePwdByDBDto,
} from '../model/Users';
import User_Details from '../model/UserDetails';
import Address from '../model/Address';
import User_Term from '../model/UserTerm';
import PassportUserDto from '../model/PassportUserDto';
import UserProfileDto from '../model/UserProfileDto';
import UserBasicDto from '../model/UserBasicDto';
import SignUpDto from '../model/SignUpDto';

// 인증코드 생성
const generateVerificationCode = ():string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// 메일 보내는 user 생성
const transporter:any = nodemailer.createTransport(
  smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: 'ngm9464@gmail.com',
      pass: process.env.PASS,
    },
  }),
);

// 로컬 로그인
// local login passport 실행후 user 반환
const signIn = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user;

    console.log(passportuser);
    // 로그인 실패시 에러 반환
    console.log(req.user);
    if (passportuser.users?.user_id == null) {
      return res.send(new ResponseDto(passportuser.code!, passportuser.msg!));
    }
    // 로그인 성공시 jwt 토큰 반환
    const jwtToken:string = await userQuery.generateJWTToken(
      passportuser.users.user_id,
      passportuser.users.role,
    );
    return res.send(
      new ResponseDto(200, '로그인 성공', { token: jwtToken }),
    );
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 소셜 로그인
const socialLogin = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user; // socialtbl

    // 로그인 실패시 에러 반환
    if (passportuser.users?.user_id == null) {
      return res.send(new ResponseDto(passportuser.code!, passportuser.msg!));
    }
    // 로그인 성공시 토큰 반환
    const jwtToken:string = await userQuery.generateJWTToken(
      passportuser.users.user_id,
      passportuser.users.role,
    );

    return res.send(
      new ResponseDto(200, '로그인 성공', { token: jwtToken }),
    );
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// email 중복 확인
// checkEmail: async (req: any, res: Response, next: NextFunction) => {
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
//     return res.json(error);
//   }
// },

// 내 정보 조회 (유저)
const getMyProfile = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    // const user_id:number = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    if (passportuser.users?.user_id == null) {
      // usertbl
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    // 유저테이블과 조인해서 i/o를 줄이는 쪽으로..
    const userprofile:UserProfileDto = await userQuery.findUserProfileById(
      passportuser.users.user_id,
    );

    return res.send(new ResponseDto(200, '내 정보 조회 성공', userprofile));
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 내 상세 정보 조회 (유저디테일) - 이름, 닉네임, 핸드폰번호, 성별, 생년월일
const getMyDetail = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    // const user_id:number = req.passportUserDto.id; // usertbl
    const passportuser:PassportUserDto = req.user;
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }
    // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
    const userdetails:User_Details = await userQuery.findUserDetailById(
      passportuser.users.user_id,
    );
    return res.send(
      new ResponseDto(200, '내 상세 정보 조회 성공', userdetails),
    );
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 프로필 이미지, 닉네임
const getMyBasicInfo = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    // const user_id:number = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    if (passportuser.users?.user_id == null) {
      // usertbl
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    const userbasic:UserBasicDto = await userQuery.findUserBasicById(
      passportuser.users.user_id,
    );
    return res.send(
      new ResponseDto(200, '프로필이미지, 닉네임 정보 조회 성공', userbasic),
    );
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

const updateTerm = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    const termId:string = req.params.id; // term_id
    const isAgree:boolean = req.body;
    // const user_id:number = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }
    // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
    await userQuery.agreeTerm(termId, isAgree, passportuser.users.user_id);
    return res.send(new ResponseDto(200, '내 약관 동의 수정 성공'));
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 배송지 조회
const getUserAddress = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user;
    // const user_id:number = req.passportUserDto.id;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      // usertbl
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    // 주소 리스트 반환
    const address:Address[] = await userQuery.findAllUserAddress(
      passportuser.users.user_id,
    );
    return res.send(new ResponseDto(200, '배송지 리스트 조회', address));
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 배송지 id로 조회
// const  getUserAddressById(req: any, res: Response, next: NextFunction) {
//   try {
//   } catch (error) {}
// }

// 배송지 등록
const createUserAddress = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user;
    const address:Address = req.body;
    // const user_id:number = req.passportUserDto.id;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    // 주소 리스트 반환
    const addresslist:Address[] = await userQuery.findAllUserAddress(
      passportuser.users.user_id,
    );

    if (addresslist.length) {
      // 기존 배송지를 찾아서 일반으로 바꿈
      await userQuery.updateExDefaultAddress(passportuser.users.user_id);
    }
    // 주소 삽입
    const addressId = await userQuery.createUserAddress(
      passportuser.users.user_id,
      address,
    );
    // console.log(addressId);
    return res.send(new ResponseDto(200, '배송지 생성 성공', addressId));
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 배송지 수정
const updateUserAddress = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    // const user_id:number = req.passportUserDto.id;
    const passportuser :PassportUserDto = req.user;
    const addressId:string = req.params.id;
    const address:Address = req.body;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(new ResponseDto(passportuser.code!, passportuser.msg!));
    }
    const isExist:Address = await userQuery.findUserAddressById(
      addressId,
      passportuser.users.user_id,
    );
    if (!isExist) {
      return res.send(new ResponseDto(404, '해당 배송지가 없습니다'));
    }

    // 일반배송지 -> 기본배송지(status=0 -> 1로 변경하는 경우)
    if (address.status === true && isExist.status === false) {
      // 기존 배송지를 찾아서 일반으로 바꿈
      await userQuery.updateExDefaultAddress(passportuser.users.user_id);
    }

    // 주소 수정
    await userQuery.updateUserAddress(addressId, address);
    return res.send(new ResponseDto(200, '배송지 수정 성공'));
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 배송지 삭제
const deleteUserAddress = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const addressId:string = req.params.id;
    // const user_id = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(new ResponseDto(passportuser.code!, passportuser.msg!));
    }
    const isExist:Address = await userQuery.findUserAddressById(
      addressId,
      passportuser.users.user_id,
    );
    if (!isExist) {
      return res.send(new ResponseDto(404, '해당 배송지가 없습니다'));
    }

    // 기본 배송지 삭제하는 경우
    // if (isExist.status == true) {
    //   // 제일 최근 수정 배송지를 기본으로 등록
    //   await userQuery.updateNewDefaultAddress(passportuser.users.user_id);
    // }

    await userQuery.deleteUserAddress(addressId, passportuser.users.user_id);
    return res.send(new ResponseDto(200, '배송지 삭제 성공'));
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 사용자가 동의/비동의한 약관 전체 조회 (유저인증 필요)
const getTerms = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    // const user_id = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    const userTerms:User_Term = await userQuery.findAllUserTerms(
      passportuser.users.user_id,
    );
    return res.send(new ResponseDto(200, '약관 조회 성공', userTerms));
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 사용자가 동의/비동의한 약관 id로 조회 (유저인증 필요)
const getTerm = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    // onst user_id = req.passportUserDto.id;
    const passportuser:PassportUserDto = req.user;
    const termId:string = req.params.id;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    const term:User_Term = await userQuery.findByTermId(
      passportuser.users.user_id,
      termId,
    );
    return res.send(new ResponseDto(200, '약관 조회 성공', term));
  } catch (err) {
    console.log(err);
    return res.send(err);
    next();
  }
};

// 로컬 회원가입
const signUp = async (req: Request, res: Response, next: NextFunction) :Promise<Response> => {
  try {
    const userReq:SignUpDto = req.body;

    console.log(userReq);
    // 회원 정보 insert
    const insertId:number = await userQuery.createLocalUser(userReq);
    return res.send(
      new ResponseDto(201, '회원가입 성공', { id: insertId }),
    );
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 이메일 유효성 인증(로컬 회원가입 시)
const emailValidSignUp = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const { email } = req.body;
    const subject = 'Avatye 이메일 인증';
    const verificationCode:string = generateVerificationCode(); // 인증코드 생성

    // 1. email db에 존재하는지 확인
    const emailExists:Users = await userQuery.findByEmail(email);
    if (emailExists) {
      return res.send(
        new ResponseDto(
          409,
          `이미 '${emailExists.login_type}'로 가입된 이메일입니다.`,
        ),
      );
    }
    // 2. 이메일 인증코드 전송

    const text = `인증코드는 ${verificationCode} 입니다.`;
    const mailOptions:object = {
      from: 'ngm9464@gmail.com',
      to: email,
      subject,
      text,
    };

    const info:any = await transporter.sendMail(mailOptions); // 이메일 전송
    console.log(`Email sent: ${info.response}`);

    return res.send(
      new ResponseDto(201, '이메일 인증 전송 성공', {
        email,
        verificationCode,
      }),
    );
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 이메일 유효성 인증(비밀번호 변경 시)
const emailValidUpdatePwdByDB = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const { email } = req.body;
    const subject = 'Avatye 이메일 인증';
    const verificationCode:string = generateVerificationCode(); // 인증코드 생성

    // 1. email db에 존재하는지 확인
    const emailExists:Users = await userQuery.findByEmail(email);
    if (!emailExists) {
      return res.send(
        new ResponseDto(401, '존재하지 않는 이메일입니다.'),
      );
    }
    // 2. 이메일 인증코드 전송
    const text = `인증코드는 ${verificationCode} 입니다.`;
    const mailOptions:object = {
      from: 'ngm9464@gmail.com',
      to: email,
      subject,
      text,
    };

    const info:any = await transporter.sendMail(mailOptions); // 이메일 전송
    console.log(`Email sent: ${info.response}`);

    return res.send(
      new ResponseDto(201, '이메일 인증 전송 성공', {
        email,
        verificationCode,
      }),
    );
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 내 프로필 수정
// updateMyUsers: async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const userReq = req.body;
//     // 권한 검사
//     if (req.passportUserDto.id == null) {
//       return res
//         .status(req.passportUserDto.code)
//         .send(new ResponseDto(req.passportUserDto.code, req.passportUserDto.msg));
//     }
//     const newUser = await updateUser(req.passportUserDto.id, userReq);
//     return res
//       .status(200)
//       .send(new ResponseDto(200, "내 프로필 수정 성공"));
//   } catch (error) {
//     return res.json(error);
//   }
// },

// 내 정보 수정
const updateMyUserDetails = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const userReq = req.body;
    const passportuser:PassportUserDto = req.user;

    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }

    await userQuery.updateUserDetails(
      passportuser.users.user_id,
      userReq,
    );
    return res.send(new ResponseDto(200, '내 정보 수정 성공'));
  } catch (error) {
    return res.json(error);
    next();
  }
};

// 비밀번호 변경 ( 로그인한 상태에서 )
const updatePwdByLogin = async (req: Request, res: Response, next: NextFunction)
:Promise<Response> => {
  try {
    const userReq:UpdatePwdByLoginDto = req.body;
    const passportuser:PassportUserDto = req.user;

    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }
    // console.log(req.passportUserDto);
    const User:Users = await userQuery.findById(passportuser.users.user_id);
    // 해쉬된 비밀번호 비교
    const isSame:boolean = await bcrypt.compare(userReq.oldPwd, User.pwd);

    // 비번 같으면 변경 가능
    if (isSame) {
      await userQuery.updatePwd(
        passportuser.users.user_id,
        userReq.newPwd,
      );
      return res.send(new ResponseDto(200, '비밀번호 변경 성공'));
    }
    return res.send(
      new ResponseDto(400, '현재 비밀번호가 올바르지 않습니다'),
    );
  } catch (err) {
    return res.json(err);
    next();
  }
};

// 비밀번호 찾기 ( 로그인 X )
const updatePwdByDB = async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
  try {
    const userReq:UpdatePwdByDBDto = req.body;

    // 2. 이메일 해당하는 pwd 찾기
    const UserEmail:Users = await userQuery.findByEmail(userReq.email);
    if (!UserEmail) {
      return res.send(new ResponseDto(401, '존재하지 않는 이메일'));
    }
    const isSame:boolean = await bcrypt.compare(userReq.newPwd, UserEmail.pwd);
    // 비번 같으면 변경 불가능
    if (isSame) {
      return res.send(
        new ResponseDto(
          400,
          '이전 비밀번호와 일치합니다. 다른 비밀번호를 입력해주세요',
        ),
      );
    }
    await userQuery.updatePwd(
      UserEmail.user_id,
      userReq.newPwd,
    );
    return res.send(new ResponseDto(200, '비밀번호 변경 성공'));
  } catch (err) {
    return res.json(err);
    next();
  }
};

// 회원 탈퇴
const deleteUser = async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user;
    // 권한 검사
    if (passportuser.users?.user_id == null) {
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }
    await userQuery.deleteUser(passportuser.users.user_id);
    return res.send(new ResponseDto(200, '회원 탈퇴 완료'));
  } catch (err) {
    console.log(err);
    return res.json(err);
    next();
  }
};

export default {
  signIn,
  socialLogin,
  getMyProfile,
  getMyDetail,
  getMyBasicInfo,
  updateTerm,
  getUserAddress,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getTerms,
  getTerm,
  signUp,
  emailValidSignUp,
  emailValidUpdatePwdByDB,
  updateMyUserDetails,
  updatePwdByLogin,
  updatePwdByDB,
  deleteUser,
};
