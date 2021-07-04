const http = require('http'); // http 서비스
const express = require('express'); // express로 프로젝트 제작 express-generator 사용안함
const bodyParser = require('body-parser'); // 데이터 변환
const path = require('path'); // 패치하기
const ejs = require('ejs'); // ejs 사용
const request = require('request'); // 요청데이터 처리
const dotenv = require("dotenv"); // 환경변수 .env사용
dotenv.config(); //  dotenv 적용

// express 연결
const app = express();
const server = http.createServer(app);

// bodyParser 데이터 안깨지기 위한 설정
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// 호스트와 포트 설정
const hostname = '127.0.0.1'; // 로컬 호스트
const port = 3001; // node.js 포트 설정

// 블록체인 qt 설정
const USER = "minki"; // 연결 아이디
const PASS = 1234; // 연결 비번
const PORT = 9636;
const ID_STRING = "minki"; // 해당 아이디 (로그인 시 그 아이디 적용)
const headers = {
    "content-type": "text/plain;"
}; // 해당 데이터 타입 설정

// ejs 설정 및 디렉토리 경로 설정
app.set('view engine', 'ejs'); // ejs 모듈 사용
app.set('views', './views'); // views 폴더 설정
app.use(express.static(path.join(__dirname, 'routes'))); // routes 폴더 설정
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더 설정

// 처음 시작시 렌더링 되는 곳
app.get('/', function(req,res){
    res.render('index',{
        title : ejs.render('title')
    });
});

// exchange 클릭시 mincho 거래소 ejs 렌더링
app.get('/exchange', function(req,res){
    res.render('exchange',{
        title : ejs.render('title')
    });
});

// 블록체인 처리와 관련된 다양한 상태 정보가 포함된 개체를 반환
app.get('/getblockchaininfo', function(req,res){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockchaininfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        console.log('실행');
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            console.log(data);
            res.render('getblockchaininfo',{
                data : data.result,
                title : ejs.render('title')
            });
            // res.send(data);
        }
    };
    request(options, callback);
})

// P2P 네트워킹과 관련된 다양한 상태 정보가 포함된 개체를 반환
app.get('/getnetworkinfo', function(req,res){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        console.log('실행');
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            console.log(data);
            res.render('getnetworkinfo',{
                data : data.result,
                title : ejs.render('title')
            });
            // res.send(data);
        }
    };
    request(options, callback);
});

// 서버 연결 상태 확인
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});