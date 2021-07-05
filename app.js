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

const indexRouter = require('./routers/index');
const signupRouter = require('./routers/signup');
const signinRouter = require('./routers/signin');
app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/signin', signinRouter);

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
// app.get('/', function(req,res){
//     res.render('index',{
//         title : ejs.render('title')
//     });
// });

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
            console.log("getblockchaininfo", data);
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
            console.log("getnetworkinfo", data);
            res.render('getnetworkinfo',{
                data : data.result,
                title : ejs.render('title')
            });
            // res.send(data);
        }
    };
    request(options, callback);
});

// 제공된 높이에서 최상의 블록 체인의 블록 해시를 반환하고 블록 정보를 받아옴
app.get('/getblockhash', function(req,res){
    res.render('getblockhash',{
        data : "",
        title : ejs.render('title')
    });
});

app.post('/getblockhash', function(req,res,next){
    if(req.body.blocknum < 0) res.send('<script>alert("음수는 입력할 수 없습니다");history.back();</script>')
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${req.body.blocknum}]}`;
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
            console.log("getblockhash", data);
            req.blockhash = data.result;
            next();
        }
    };
    request(options, callback);
});
app.post('/getblockhash', function(req,res,next){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${req.blockhash}"]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };
    callback = (error, response, body) => {
        if(error) console.log(error);
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("getblock", data);
            res.render('getblockhash', {
                data: data.result,
                title: ejs.render('title')
            })
        }
    };
    request(options, callback);
});

//채굴 관련 정보를 포함하는 json 객체를 반환
app.get("/getmininginfo", (req, res) => {
    var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
    var options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("getmininginfo", data);
            res.render('getmininginfo', {
                data: data.result,
                title : ejs.render('title')
            })
        }
    };
    request(options, callback);
});

//지갑 정보
app.get("/getwalletinfo", (req, res) => {
    var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getwalletinfo","params":[]}`;
    var options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("getwalletinfo", data);
            res.render('getwalletinfo', {
                data: data.result,
                title : ejs.render('title')
            })
        }
    };
    request(options, callback);
});

//지갑 리스트
app.get("/listwallets", (req, res) => {
    var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listwallets","params":[]}`;
    var options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("listwallets", data);
            res.render('listwallets', {
                data: data.result,
                title : ejs.render('title')
            })
        }
    };
    request(options, callback);
});

//거래내역 리스트
//parmas:[] 면 최근 10개, "*" 20 100면 100~120
app.get("/listtransactions", (req, res) => {
    var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listtransactions","params":[]}`;
    var options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("listtransactions", data);
            res.render('listtransactions', {
                data: data.result,
                title : ejs.render('title')
            })
        }
    };
    request(options, callback);
});

// 서버 연결 상태 확인
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});