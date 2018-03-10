'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const pg = require("pg");
const path = require('path');
const app = express()


var conString = 'postgres://gbkzckaulxtjsl:6644f39f130ae51002574f0456370c00c8b9d51f10d05323d571ec65fa1c7360@ec2-107-20-176-27.compute-1.amazonaws.com:5432/d30eojds540fma';
var client = new pg.Client(conString);
client.connect();

client.query("CREATE TABLE IF NOT EXISTS BOTUSERS(UserID varchar(120) PRIMARY KEY, firstname varchar(100))");


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// Process application/json
app.use(bodyParser.json())


const token = 'EAAFEZCIhueukBAPHq0103gAZCV6c0tW9EkUCgojS5jp3dMf6atpSWphiwZAA1DPPDRkKNuHM3i16qZBDrmw3oqldmCuPZBc4lZCS5xF1mF0PYac5YNO6GQZAdchESkXjvoye4Du4qeegFkxOeWo7BiuxhIJyCxI9FmlsQNsAo0niwZDZD';

// Index route
app.get('/', function(req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/privacy-policy', function(req, res) {
    res.sendFile(path.join(__dirname + '/privacy-policy.html'))
})

// for Facebook verification
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'hello') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        request({
            url: "https://graph.facebook.com/v2.6/" + sender,
            qs: {
                access_token: token,
                fields: "first_name"
            },
            method: "GET",

        }, function(error, response, body) {
            if (error) {
                console.log("error getting username")
            } else {
                var bodyObj = JSON.parse(body)
                let name = bodyObj.first_name
				if(event.message && event.message.attachments) {
					    if(sender == 998500193632330) {
						return;
					}
						var imgurl = event.message.attachments[0].payload.url;
						client.query("SELECT * FROM botusers", function(err, result) {
                            console.error("error", err);
							if (err) throw err;
							else
							{
								console.log("result",result);
								console.log(result.rows);
								//console.log(result.rows.anonymous);
								for(var i = 0;i<result.rows.length;i++){
									sendTextMessage(sender,"New Pic");
									sendimageMessage(result.rows[i].userid,imgurl);
								}
							}
						});
						sendTextMessage(sender, "Thanx for the pic! We appreciate your small initiative towards a big Change!");

				}
                else if (event.message && event.message.text) {
                    let text = event.message.text
                    console.log("Sender ID: " + sender + " " + name);
					
					if(sender == 998500193632330) {
						return;
					}
                    var line = text.toLowerCase();
                    if (line.match(/hi/g) || line.match(/hello/g) || line.match(/heioy/g) || line.match(/get/g)) {
						client.query("CREATE TABLE IF NOT EXISTS BOTUSERS(UserID varchar(120) PRIMARY KEY, firstname varchar(100))");
						client.query("INSERT INTO botusers(UserID, firstname) values($1, $2)", [sender, name]);
						
                        sendTextMessage(sender, "Hey " + name + "Welcome to a world of exposing the wrong doers anonymously");
                        // setTimeout(function() {
                        // 	sendTextMessage(sender, "I can help you keep track of your daily routine and make sure they're done in time!");
                        // }, 200);
                        setTimeout(function() {	
                            sendTextMessage(sender, "Welcome!");
                        }, 300);

                    }  
                    else {
                        sendTextMessage(sender, "I don't seem to understand your query ... :/ Please Try Again");
                    }

                }
				
				
            }
        })
    }
    res.sendStatus(200)
})



function sendTextMessage(sender, text) {
    let messageData = {
        text: text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}



// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
function sendimageMessage(sender, url1) {
    let messageData = {
            "attachment":{
			  "type":"image", 
			  "payload":{
				"url":url1, 
				"is_reusable":true
			  }
			}

    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}