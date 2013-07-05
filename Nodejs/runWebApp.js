/*
	Purpose of this script:
	[x] Runs the web app
	[x] Logs everything
	[x] Restarts on crash
	[x] Sends email on crash
*/
var util = require('util')
var program = require('commander');
var fs = require('fs');
var mailer = require('nodemailer')
var postageapp = require('postageapp')('');
var exec = require('child_process').exec;
var app;
var CRASH_COUNT = 0;

run = {
	p : function(){
		settings.email = true;
		settings.MAX_CRASH_COUNT = 200;
		settings.logging = true;
		settings.mode = "Production"
		this.runApp()
	},
	d : function () {
		settings.email = false;
		settings.MAX_CRASH_COUNT=2;
		settings.logging = false;
		settings.mode = "Development"
		this.runApp();
	},
	runApp : function () {
		runApp();
		cl(settings.mode+" Mode")

	}
}

settings = {
	email : "",
	MAX_CRASH_COUNT : "",
	logging : "",
	mode: ""

}

program
  .version('0.0.1')
  .option('-p, --Production', 'Start App Production')
  .option('-d, --Development', 'Start App Development')
  .parse(process.argv);

if (program.Production) run.p();
if (program.Development) run.d()
else{
	console.log("Enter run.js -help")
}


function cl (msg) {
	console.log(">>> RunJS:")
	console.log(msg)
	console.log("___")
}

function restartApp () {
	if(typeof app != "undefined"){
		app.disconnect();
		runApp();
	}
}

function executeString(){
	if(process.env.OS == "Windows_NT"){
	  return "node app.js";
	}else{
	  return "sudo node app.js"
	}	
}

function runApp () {
	app = exec(executeString())

	cl("APP IS RUNNING")
	//App STDOUT stream
	app.stdout.on('data', function (data) {
		if(settings.logging){
			fs.appendFile(filename.out(), "<p class='stdout'>"+data+"</p>")
		}
		console.log(data)
	});

	//App Crash/Close
	app.on("exit",function (code, signal) {
		if(CRASH_COUNT<=settings.MAX_CRASH_COUNT){
			cl("App Crashed")
			cl("Crash Count:"+CRASH_COUNT)
			cl("Restarting....")
			crashed(code, signal)
			runApp();
			CRASH_COUNT = CRASH_COUNT + 1;
		}else{
			console.log("Crash count reached.")
			if(settings.email){
				sendCrashEmail(code, signal)
			}
		}
	});

	//Manual Restart
	app.on('disconnect', function () {

	});
}

function  crashed(code,signal) {
	if(settings.logging){
		fs.appendFile(filename.err(),"Signal: "+signal+"\n Code:"+code);
	}
}


filename = {
	path : "logs/",
	format : ".html",
	out : function(){
		return this.path+"Logs"+this.fileId()+this.format
	},
	err : function () {
		return this.path+"Error"+this.fileId()+this.format
	},
	fileId : function  () {
		d = new Date();
		return "--"+d.getDay()+"-"+d.getDate()+"-"+d.getFullYear()
	}
}


function sendCrashEmail (code, signal) {
	options =  { 
		recipients: "contact@classfy.com",

		subject: "Classfy Crashed",
		from: "classfy_app@classfy.com",

		content: {
		    'text/html': 
		    	"Code :"+code+"\n Signal:"+signal,
		}
	}

	postageapp.sendMessage(options, function callback() {
	});
}

