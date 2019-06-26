
		$(document).ready(function(){
		
			var userName = prompt("What's your name?")||"User"; 
			
			var socket = io(); //connect to the server that sent this page
			socket.on('connect', function(){
				socket.emit("intro", userName);
			});
			// Allows user to interact with everyone. 
			$('#inputText').keypress(function(ev){
					if(ev.which===13){
						//send message
						socket.emit("message",$(this).val());
						ev.preventDefault(); //if any
						$("#chatLog").append((new Date()).toLocaleTimeString()+", "+userName+": "+$(this).val()+"\n") 
						$(this).val(""); //empty the input
					}
			});
			
			socket.on("message",function(data){
				$("#chatLog").append(data+"\n");
				$('#chatLog')[0].scrollTop=$('#chatLog')[0].scrollHeight; //scroll to the bottom
			});
			// creates uselist on the right side of chat log 
			socket.on("userList",function(data){
			$("#userList").empty();
			// checks to see if double click has been clicked and cotrol key was held down. If yes, then block user. If not, then let provate message happen. 
			for(var index =0;index<data.length;index++){
				var listitem = $('<li>'+data[index]+'</li>'); //http://www.w3schools.com/Tags/tag_li.asp
				listitem.dblclick(function(ev){ // 
				if(ev.ctrlKey){ // used https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/ctrlKey 
					var nameToBlock = $(this).html(); // used line 74 
					var nameToSecure = userName; 
					var destroy = {"block":nameToBlock,"Secure":nameToSecure};
					socket.emit("blockUser",destroy);
				}
				else{
					var message = prompt("Enter Your Message for " + $(this).html()); // used https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt for prompt and line 73
					var priv ={"username":$(this).html(), "message": message}; // line 74 for $(this).html()
					socket.emit("privateMessage",priv);
				}
			});
				$("#userList").append(listitem); //line 76
				console.log(data[index]);
				console.log("\n");
			}
		
			});
			// deals with sending private message to intended user and a reply from the intended user. Goes on until one of them quits
			socket.on("privateMessage",function(data){
				var message = prompt("message received from "+ data.userName + " : " + data.message); // used https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt for prompt 
				var reply = {"username": data.userName, "message": message}; 
				socket.emit("privateMessage", reply);
			});
			
			socket.on("beenBlocked",function(data){
				var message = alert(data.messageForBlocked);
				
			});
			
		 
				
		});
	
//Citations/Quick lookups
//http://www.w3schools.com/js/js_popup.asp
// http://stackoverflow.com/questions/9219346/jquery-this-html-returns-undefined
//http://stackoverflow.com/questions/9918203/remove-objects-on-disconnect-socket-io
//http://stackoverflow.com/questions/10641955/jquery-append-ajax
//https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes