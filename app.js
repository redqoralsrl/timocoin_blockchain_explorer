const http = require('http'); // http 서비스
const express = require('express'); // express로 프로젝트 제작 express-generator 사용안함
const bodyParser = require('body-parser'); // 데이터 변환
const path = require('path'); // 패치하기
const ejs = require('ejs'); // ejs 사용
const request = require('request'); // 요청데이터 처리
const dotenv = require("dotenv"); // 환경변수 .env사용
const session = require('./routers/session'); // 세션 설정
const moment = require('moment');

dotenv.config(); //  dotenv 적용
// moment.locale('ko'); //moment 한국어

// express 연결
const app = express();
const server = http.createServer(app);

app.use(session); //세션 사용

// bodyParser 데이터 안깨지기 위한 설정
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const indexRouter = require('./routers/index');
const signupRouter = require('./routers/signup');
const signinRouter = require('./routers/signin');
const sendfromRouter = require('./routers/sendfrom');
// app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/signin', signinRouter);
app.use('/sendfrom', sendfromRouter);

// 호스트와 포트 설정
const hostname = '127.0.0.1'; // 로컬 호스트
const port = 3001; // node.js 포트 설정

// 블록체인 qt 설정
const USER = "kbpark"; // 연결 아이디
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

function Unix_timestamp(t){
    t = Number(t);
    var date = new Date(t*1000);
    var hour = date.getHours()-9;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return hour == 0 ? minute == 0 ? second + 's' : minute + '.' + second + 'm' : hour + '.' + minute + 'h';
    // return hour + ":" + minute + ":" + second;
}

function Unix_timestamp_lower(t){
    t = Number(t);
    var date = new Date(t*1000);
    var year = date.getFullYear();
    var month = "0" + (date.getMonth()+1);
    var day = "0" + date.getDate();
    var hour = "0" + date.getHours();
    var minute = "0" + date.getMinutes();
    var second = "0" + date.getSeconds();
    return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2);
}

// 처음 시작시 렌더링 되는 곳
app.get('/', function(req,res,next){
    const da = [];
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockchaininfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            da.push(data);
            req.datas = da;
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    let time_sum = 0;
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listtransactions","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            // data.result[0].blockheight = 1;  //이런식으로 블록height 넣어주자!
            for(let i = 9; i > 0; i--){
                time_sum += data.result[i].blocktime - data.result[i-1].blocktime;
            }
            req.blocktime = time_sum / 10;
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req, res, next){
    res.render('index',{
        title : ejs.render('title'),
        logined : req.session.logined,
        userId : req.session.userId,
        getblockchaininfo : req.datas[0].result,
        getnetworkinfo : req.datas[1].result,
        getmininginfo : req.datas[2].result,
        // listtransactions : req.datas[3].result,
        difficulty : Math.round(req.datas[0].result.difficulty * 100000)/100000,
        // blocktime: Unix_timestamp(req.blocktime),
        moment: moment
        // transaction: undefined,
    });
});
// options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${data.result}]}`;
//             callback1 = (error, response, body) => {
//                 if (error) console.log(error);
//                 if (!error && response.statusCode == 200) {
//                     const _data = JSON.parse(body);
//                 }
//             }
//             request(options, callback1);
app.get('/block_transaction', function (req, res, next) {
    const list = [];
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockcount","params":[]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            const num = Number(data.result)-19;
            // list.push(data.result);
            // data.result => 1351
            // for문 위치
            let result_num = Number(data.result);
            for(let i = result_num; i > result_num-20; i--){
                options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${i}]}`;
                callback1 = (error, response, body) => {
                    if (error) console.log(error);
                    if (!error && response.statusCode == 200) {
                        data = JSON.parse(body);
                        // _data.result => blockhash
                        options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${data.result}"]}`;
                        callback2 = (error, response, body) => {
                            if (error) console.log(error);
                            if (!error && response.statusCode == 200) {
                                data = JSON.parse(body);
                                // console.log(i,' : ',data);
                                // data.result.tx
                                options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getrawtransaction","params":["${data.result.tx[0]}", true]}`;
                                callback3 = (error, response, body) => {
                                    if (error) console.log(error);
                                    if (!error && response.statusCode == 200) {
                                        data = JSON.parse(body);
                                        // console.log(data.result);
                                        // data.result.blocktime = Unix_timestamp_lower(data.result.blocktime)
                                        data.result.mo_time = moment(Unix_timestamp_lower(data.result.blocktime)).startOf('sec').fromNow();
                                        data.result.blockheight = i;
                                        list.push(data.result);
                                        if(i == num) {
                                            let sort_list;
                                            sort_list = list.sort((a,b) => {
                                                return b.blockheight - a.blockheight;
                                            })
                                            let sum = 0;
                                            for(let i = 0; i< 9; i++) {  
                                                if(sort_list[i+1] != undefined) sum += Number(sort_list[i].blocktime) - Number(sort_list[i+1].blocktime);
                                            }
                                            avg_time = Unix_timestamp(sum/10);
                                            res.send({sort_list, avg_time});
                                        }
                                    }
                                }
                                request(options, callback3);
                            }
                        }
                        request(options, callback2);
                    }
                }
                request(options, callback1);
            }
        }
    }
    request(options, callback);
});

app.get('/block_interval', function (req, res, next) {
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body); // Object로 나옴
            options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
            callback = (error, response, body) => {
                if (error) console.log(error);
                if (!error && response.statusCode == 200) {
                    const _data = JSON.parse(body); // Object로 나옴   
                    data.result.difficulty = Math.round(data.result.difficulty * 100000)/100000 
                    data.result.connections = _data.result.connections;
                    res.send(data.result);
                }
            };
            request(options, callback);
        }
    };
    request(options, callback);
});

////////////검색///////////////
app.post('/search', function(req, res) {
    console.log('body', req.body);
    const blocknum = req.body.block_num;
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${blocknum}]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    let search_result;
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body); // Object로 나옴
            // console.log('검색', data.result);
            options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${data.result}"]}`;
            callback1 = (error, response, body) => {
                if (error) console.log(error);
                if (!error && response.statusCode == 200) {
                    data = JSON.parse(body);
                    search_result = data.result;
                    console.log('sae', search_result.tx[search_result.tx.length - 1])
                    options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getrawtransaction","params":["${search_result.tx[search_result.tx.length - 1]}", true]}`;
                    callback2 = (error, response, body) => {
                        if (error) console.log(error);
                        if (!error && response.statusCode == 200) {
                            data = JSON.parse(body);
                            search_result.amount = data.result.vout[0].value;
                            console.log('결과', search_result);
                            res.render('search',{
                                block_info : search_result,
                                title : ejs.render('title')
                            })
                        }
                    }
                    request(options, callback2);
                }
            }
            request(options, callback1);
        }
    }
    request(options, callback);
})

// exchange 클릭시 mincho 거래소 ejs 렌더링
app.get('/exchange', function(req,res){
    res.render('exchange',{
        title : ejs.render('title')
    });
});

// // 제공된 높이에서 최상의 블록 체인의 블록 해시를 반환
// app.get('/getblockhash', function(req,res){
//     res.render('getblockhash',{
//         data : "",
//         title : ejs.render('title')
//     });
// });

// app.post('/getblockhash', function(req,res,next){
//     if(req.body.blocknum < 0) res.send('<script>alert("음수는 입력할 수 없습니다");history.back();</script>')
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${req.body.blocknum}]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     }
//     callback = (error, response, body) => {
//         if(error) console.log(error);
//         console.log('실행');
//         if(!error && response.statusCode == 200){
//             const data = JSON.parse(body); // Object로 나옴
//             console.log("getblockhash", data);
//             req.blockhash = data.result;
//             next();
//         }
//     };
//     request(options, callback);
// });
// app.post('/getblockhash', function(req,res,next){
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${req.blockhash}"]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };
//     callback = (error, response, body) => {
//         if(error) console.log(error);
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             console.log("getblock", data);
//             res.render('getblockhash', {
//                 data: data.result,
//                 title: ejs.render('title')
//             })
//         }
//     };
//     request(options, callback);
// });

// // 블록체인 처리와 관련된 다양한 상태 정보가 포함된 개체를 반환
// app.get('/getblockchaininfo', function(req,res){
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockchaininfo","params":[]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     }
//     callback = (error, response, body) => {
//         if(error) console.log(error);
//         console.log('실행');
//         if(!error && response.statusCode == 200){
//             const data = JSON.parse(body); // Object로 나옴
//             console.log("getblockchaininfo", data);
//             res.render('getblockchaininfo',{
//                 data : data.result,
//                 title : ejs.render('title')
//             });
//             // res.send(data);
//         }
//     };
//     request(options, callback);
// })

// // P2P 네트워킹과 관련된 다양한 상태 정보가 포함된 개체를 반환
// app.get('/getnetworkinfo', function(req,res){
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     }
//     callback = (error, response, body) => {
//         if(error) console.log(error);
//         console.log('실행');
//         if(!error && response.statusCode == 200){
//             const data = JSON.parse(body); // Object로 나옴
//             console.log("getnetworkinfo", data);
//             res.render('getnetworkinfo',{
//                 data : data.result,
//                 title : ejs.render('title')
//             });
//             // res.send(data);
//         }
//     };
//     request(options, callback);
// });

// //채굴 관련 정보를 포함하는 json 객체를 반환
// app.get("/getmininginfo", (req, res) => {
//     var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
//     var options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             console.log("getmininginfo", data);
//             res.render('getmininginfo', {
//                 data: data.result,
//                 title : ejs.render('title')
//             })
//         }
//     };
//     request(options, callback);
// });

// //거래내역 리스트
// //parmas:[] 면 최근 10개, "*" 20 100면 100~120
// app.get("/listtransactions", (req, res) => {
//     var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listtransactions","params":[]}`;
//     var options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             console.log("listtransactions", data);
//             res.render('listtransactions', {
//                 data: data.result,
//                 title : ejs.render('title')
//             })
//         }
//     };
//     request(options, callback);
// });


// 상세도가 0이면 블록 '해시'에 대해 16진 인코딩된 직렬화된 문자열을 반환
// 상세도가 1이면 블록 '해시'에 대한 정보가 포함된 개체를 반환
// 세부 정보가 2이면 블록 '해시'에 대한 정보와 각 트랜잭션에 대한 정보가 포함된 개체를 반환
// app.get('/getblock', function(req,res){
//     res.render('getblock',{
//         data : "",
//         title : ejs.render('title')
//     });
// });

// app.post('/getblock', function(req,res){
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${req.body.blockhash}"]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     }
//     callback = (error, response, body) => {
//         if(error) console.log(error);
//         console.log('실행');
//         if(!error && response.statusCode == 200){
//             const data = JSON.parse(body); // Object로 나옴
//             console.log(data);
//             res.render('getblock',{
//                 data : data.result,
//                 title : ejs.render('title')
//             });
//             // res.send(data);
//         }
//     };
//     request(options, callback);
// });


// //지갑 정보
// app.get("/getwalletinfo", (req, res) => {
//     var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getwalletinfo","params":[]}`;
//     var options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             console.log("getwalletinfo", data);
//             res.render('getwalletinfo', {
//                 data: data.result,
//                 title : ejs.render('title')
//             })
//         }
//     };
//     request(options, callback);
// });

// //지갑 리스트
// app.get("/listwallets", (req, res) => {
//     var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listwallets","params":[]}`;
//     var options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             console.log("listwallets", data);
//             res.render('listwallets', {
//                 data: data.result,
//                 title : ejs.render('title')
//             })
//         }
//     };
//     request(options, callback);
// });

// 서버 연결 상태 확인
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});