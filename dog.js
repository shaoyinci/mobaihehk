
var fs = require('fs');														//加载fs摸块
var net = require("net");													//加载net模块
const url = require("url");
var request = require('request');
const os = require('os');
var servernet = net.createServer();											//创建tcp服务
var localportnet = 2040;													//tcp端口
let loginAuth = {};

/////////////////////------------------网络监听、回调函数--------------------------------

servernet.listen(localportnet, function(){									//创建tcp监听端口
  console.log('打开端口：'+ localportnet);
});

servernet.on('close', function(){											//tcp关闭
  console.log('本地端口关闭');
});

servernet.on('error',function(error){										//错误报告02
    console.log('本地端口error02');
    console.error(error);
});

servernet.on('connection', function(socket){								 //tcp连接成功
    console.log('本地设备连接成功！')
    console.log("远程socket端口：" + socket.remotePort);					 //客户端port
    console.log("远程socket地址：" + socket.remoteAddress);					 //客户端IP

  socket.on('data',function(data){
    var nowDate = new Date();
    var timenow = nowDate.toLocaleDateString() + " "+ nowDate.toLocaleTimeString()+' ';
    //  console.log("接收到数据：" + data);					 //客户端IP
	if (data == "fGfIOHhuifdh4rr8r5fjii1100ooq0vdh" ){
		N1Login("admin","1234567A");
	 	setTimeout(function () {
         		if (loginAuth.access_token){
              		N1Restart();
              		socket.write('reboot success!');
          	}else{
              		console.log("==> Restart fail!")
              		socket.write('reboot fail!');
          	}
      	},3000);
	}else if (data == "FGfghgfrtjkbsfd8956879fjii1100ooq0vdh" ){
    fs.rm('/var/lib/homebridge',{recursive:true},err => {
        if  (err){
          console.error("删除homebridge文件出错！");
          console.error(err);
        }else {
          fs.mkdir("/var/lib/homebridge", err => {
            if (err){
              console.error("创建homebridge文件夹出错！");
              console.error(err);
            }else {
              fs.cp('/home/inithomebridge/homebridge', '/var/lib/homebridge', { recursive: true }, (err) => {
                if (err) {
                  console.error("复制homebridge文件出错！");
                  console.error(err);
                }else{
                  console.log("强制重置homebridge完成");
                  N1Login("admin","1234567A");
              	 	setTimeout(function () {
                       		if (loginAuth.access_token){
                            		N1Restart();
                            		socket.write('reboot success!');
                        	}else{
                            		console.log("==> Restart fail!")
                            		socket.write('reboot fail!');
                        	}
                    	},3000);
                }
              });
            }
          })
        }
    })
	}else if (data == "dfgGFGRr8975e7g5sgj7865tdff710o0ovv" ){
		N1Login("admin","1234567A");
        setTimeout(function () {
          if (loginAuth.access_token){
            N1ReSet();
            socket.write('reset wait!');
          }else{
            log("==> Reset fail!")
            socket.write('reset fail!');
          }
        },3000);
        setTimeout(function () {
            if (loginAuth.access_token){
              N1Restart();
              socket.write('reset success!');
            }else{
              log("==> Restart fail!")
              socket.write('reset fail!');
            }
          },10000);
	}
  });

  socket.on('error',function(error){		//错误报告01
	    console.log('断开本地连接1.');
       // console.error(error);
  });
});

function N1ReSet(){                         //重置
	var ipAddress = getIpAddress();
  request({
      url: "http://"+ ipAddress +":8581/api/server/reset-homebridge-accessory",
      method: "PUT",
      headers: { "accept": "*/*","Authorization": "Bearer " + loginAuth.access_token }
  }, function(error, response) {
      if (!error && response.statusCode == 200) {
        console.log( '==> Reset ok') ;
      } else {
        console.log( '==> Reset error');
      }
  });
}
function N1Restart(){                           //重启
	var ipAddress = getIpAddress();
  request({
      url: "http://"+ ipAddress +":8581/api/backup/restart",
      method: "PUT",
      headers: { "accept": "*/*","Authorization": "Bearer " + loginAuth.access_token }
  }, function(error, response) {
      if (!error && response.statusCode == 200) {
        console.log( '==> Restart ok') ;
      } else {
        console.log( '==> Restart error');
      }
  });
}
function N1Login(username,keyword){				//登录login
	var ipAddress = getIpAddress();
	let requestData={
    "username": username,
    "password": keyword,
    "otp": "string"
	};
	request({
    	url: "http://"+ ipAddress +":8581/api/auth/login",
		  method: "POST",
    	json: true,
    	headers: { "content-type": "application/json","accept": "*/*"},
    	body: requestData
	}, function(error, response, body) {
    	if (!error && response.statusCode == 201) {
        	if (response.body.token_type =='Bearer'){
            loginAuth = response.body;
            console.log( '==> Login ok') ;
        	}
    	} else {
    		console.log( '==> Login:error');
    	}
	});
}
function getIpAddress() {           				//获取ip
  var ifaces=os.networkInterfaces()
  for (var dev in ifaces) {
    let iface = ifaces[dev]

    for (let i = 0; i < iface.length; i++) {
      let {family, address, internal} = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}
