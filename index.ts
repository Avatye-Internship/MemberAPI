import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './api/routes/router';
import passportfunc from './api/passport/passport';

// 서버 생성
const app = express();
// 미들웨어
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
passportfunc();
// 라우터
app.use('/api', userRouter);

app.listen(3000, () => {
  console.log('----server on------');
});
