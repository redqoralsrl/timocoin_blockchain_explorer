const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require('./mysql');
const session = require('./session');
const crypto = require('crypto');
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
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Already Login'); location.replace('/');</script>");
    }
    else {
        res.render('signup',{
            title : ejs.render('title'),
        });
    }
});

router.post('/', function(req, res) {
    const body = req.body;
    const id = req.body.id;
    const cryptoPw = crypto.createHash('sha512').update(body.password).digest('base64');

    if(id == null || body.password == null)
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Please enter all fields'); location.replace('/signup');</script>");

    client.query("select * from users where id=?", [id], (error, result1) => {
        console.log(result1);
        if(result1 != "" ) {
            res.send("<script language=\"javascript\">alert('[ ERROR ] : ID Already exists'); location.replace('/signup');</script>");
        }
        else {
            const account = id;
            const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnewaddress","params":["${account}"]}`;
            const options = {
                url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
                method: "POST",
                headers: headers,
                body: dataString
            };
            
            callback = (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const data = JSON.parse(body);
                    client.query("insert into users (id, pw, addr) values (?, ?, ?)", [id, cryptoPw, data.result], (error) => {
                        if(error) console.log(error);
                        else console.log("회원가입 완료");
                        res.send("<script language=\"javascript\">location.replace('/signin');</script>");
                    });
                }
            };
            request(options, callback);

        }
    });
});

module.exports = router;