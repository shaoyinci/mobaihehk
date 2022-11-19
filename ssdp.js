const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const os = require('os');
var fs = require('fs');														//加载fs摸块


var HB_os = "/var/lib/homebridge/package.json";				//默认版本路径
var HBV ={};					//获取块文件版本
function getversion(load){
		var loadway = load;
		fs.readFile(loadway,'utf8',function(err,dataStr){
    	if(err){
				console.log('读取文件失败！'+err.message)
    	}
			var jsonstr =  JSON.parse(dataStr);
 			HBV = jsonstr.dependencies;
		})
}
getversion(HB_os);

server.on('close',()=>{
	console.log('socket已关闭');
});

server.on('error',(err)=>{
	console.log(err);
});

server.on('listening',()=>{
	server.setBroadcast(!0);//开启广播
	server.setTTL(128);
	setInterval(()=>{
		var iface  =getIpAddress();
		server.send('Homebridge broadcast, ip = '+ iface.address +",mac = "+ iface.mac + ",HB:"+ HBV["homebridge"] + ",HBS:"+ HBV["homebridge-shao"] +",HBU"+ HBV["homebridge-update-server"],2042,'255.255.255.255');
	}, 60000);
});


server.on('message',(msg,rinfo)=>{
	//console.log(`receive message from ${rinfo.address}:${rinfo.port}`);
});

server.bind(2041);

function getIpAddress() {           				//获取ip
  var ifaces=os.networkInterfaces()
  for (var dev in ifaces) {
    let iface = ifaces[dev]

    for (let i = 0; i < iface.length; i++) {
      let {family, address, mac, internal} = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return iface[i];
      }
    }
  }
}
