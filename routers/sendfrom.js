const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require('./mysql');
const session = require('./session');
const request = require('request');

const USER = process.env.RPC_USER; // conf파일에 적은 rpcuser
const PASS = process.env.RPC_PASSWORD; // conf파일에 적은 rpcpass
const PORT = 9636; // 코인 만들때 지정해둔 포트 (rpcport)
const ID_STRING = "TimoCoin"; // 의미 없는 스트링
const headers = {
    "content-type": "text/plain;"
};

router.use(session);

router.get('/', function(req,res) {
    if(req.session.userId != undefined) {
        res.render('sendfrom',{
            title : ejs.render('title'),
        });
    }
    else {
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Please Sign In'); location.replace('/signin');</script>");
    }
});

/*
{"jsonrpc": "1.0", "id":"curltest", "method": "sendfrom", "params": ["tabby"(주는사람), "LEr4HnaefWYHbMGXcFp2Po1NPRUeIk8km2"(받는사람), 0.01(송금액에서 수수료 공제), 6(보낼 코인수), "donation"(그냥 대충 메시지), "seans outpost"] }
송금액에서 수수료 공제 O ==> 보내는 사람한테서 수수료 빠짐
송금액에서 수수료 공제 X ==> 받는 사람한테서 수수료 빠짐
{"jsonrpc": "1.0", "id":"curltest", "method": "sendfrom", "params": ["mingsu", "LEr4HnaefWYHbMGXcFp2Po1NPRUeIk8km2", 24(보낼 코인 수)] }
*/

router.post('/', function(req, res) {
    const account = req.session.userId;
    const coinCount = req.body.coinCount;
    const recvAddr = req.body.recvAddr;
    console.log("샌드프롬 ==>", account);
    console.log("샌드프롬 ==>", coinCount);
    console.log("샌드프롬 ==>", recvAddr);

    const dataString = `{"jsonrpc": "1.0", "id":"${ID_STRING}", "method": "sendfrom", "params": ["${account}", "${recvAddr}", ${coinCount}] }`;
    // const dataString = `{"jsonrpc": "1.0", "id":"${ID_STRING}", "method": "sendfrom", "params": ["yu", "${recvAddr}", ${coinCount}] }`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };
    
    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("코인이 잘 보내졌음");
            res.redirect('/');
        }
        else {
            console.log("코인 안 보내짐");
            res.redirect('/sendfrom');
        }
    };
    request(options, callback);
});

module.exports = router;