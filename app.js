/*SocketIO based chat room. Extended to not echo messages
to the client that sent them.*/



var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./files";
http.listen(2406);

console.log("Chat server listening on port 2406");


function handler(req,res){

	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	
	fs.stat(filename,function(err, stats){	
	// adding a route for "/colors/user"
	// initiate client object 
		
	if(err){   //try and open the file and handle the error, handle the error
		console.log(err);
		respondErr(err);
	}else{
		if(stats.isDirectory())	filename+="/index.html";
			fs.readFile(filename,"utf8",function(err, data){
				if(err)respondErr(err);
				else respond(200,data);
		});
	}
	});			
	
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
		
};

var clients=[];

io.on("connection", function(socket){
	console.log("Got a connection");
	socket.on("intro",function(data){
		socket.username=data;
		socket.broadcast.emit("message", timestamp()+": "+socket.username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+socket.username+".");
		clients.push(socket);
		data = getUserList();
		console.log(data);
		for(var i=0;i<clients.length;i++){
			clients[i].emit("userList",data);
		}
		
	});
		
	socket.on("message", function(data){
		console.log("got message: "+data);
		socket.broadcast.emit("message",timestamp()+", "+socket.username+": "+data);
		
	});
	
	socket.on("privateMessage",function(data){
		console.log("got userName and Message: " + JSON.stringify(data));
		var message = data.message; 
		var userNme = data.username; 
		for(var i = 0; i < clients.length;i++){
			if(clients[i].username === userNme){
				clients[i].emit("privateMessage",{"userName": socket.username, "message": message}); 
			}
		}
	});
	// sends the user to be blocked an alert that they have been blocked. 
	socket.on("blockUser",function(data){
		console.log("User to be Blocked: " + JSON.stringify(data));
		var uBlock = data.block;
		console.log(uBlock);
		var uSecure = data.Secure;
		console.log(uSecure);
		var message = "You have been Blocked"; 
		for(var i = 0; i <clients.length;i++){
			if(clients[i].username === uBlock){
				clients[i].emit("beenBlocked",{"messageForBlocked" : message});
			}
		}
		
	});
	socket.on("disconnect", function(){
		console.log(socket.username+" disconnected");
		io.emit("message", timestamp()+": "+socket.username+" disconnected.");

		//deletes data[socket.username];
		clients = clients.filter(function(ele){  
			return ele!==socket;
			});
		data=getUserList();
		for(var i=0;i<clients.length;i++){
			clients[i].emit("userList",data);
		}
		
	});
	
});

// timestamp function 
function timestamp(){
	return new Date().toLocaleTimeString();
}

function getUserList(){
    var ret = [];
    for(var i=0;i<clients.length;i++){
        ret.push(clients[i].username);
    }
    return ret;
}
//Citations/Quick lookups
//http://www.w3schools.com/js/js_popup.asp
// http://stackoverflow.com/questions/9219346/jquery-this-html-returns-undefined
//http://stackoverflow.com/questions/9918203/remove-objects-on-disconnect-socket-io
//http://stackoverflow.com/questions/10641955/jquery-append-ajax
//https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
// used socketServerDemo.js from Prof's Notes 08-AsyncCollab -> code -> 08f_SocketIO demo
// used socketServerDemo_final.js 08-AsyncCollab -> code -> 08f_SocketIO demo
// used sseChatServer.js from Prof Notes 08-AsyncCollab\code\08e_SSE_chat