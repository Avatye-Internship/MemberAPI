import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './api/routes/user.router';
import passportfunc from './api/passport/passport';
import productRouter from './api/routes/product.router';

// 서버 생성
const app = express();
// 미들웨어
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
passportfunc();
// 라우터
app.use('/api', userRouter);
app.use('/api', productRouter);

app.listen(8000, () => {
  console.log('----server on------');
});

const termsids = [{ term_id: 4 }, { term_id: 5 }, { term_id: 6 }];
const termidsinput = termsids.map((term) => term.term_id).join(',');
console.log(typeof termidsinput);
