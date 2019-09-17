const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');
const request = require('request');

const dir = './memes'

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    const memeChannel = client.channels.get("601159584941342739");
    
    let totalMessages = [];
    let chunk = await memeChannel.fetchMessages();
    do
    {        
        console.log(`Found ${chunk.size} messages in chunk!`);

        let messages = Array.from(chunk.values())
        totalMessages = totalMessages.concat(messages);

        for (message of messages)
        {
            message.attachments.forEach(a => {
                download(a.url, a.filename, function(){})
                //await fs.writeFileAsync(`./memes/${a.filename}`, a.file);
            });
        }

        lastMessage = messages.pop();
        chunk = await memeChannel.fetchMessages({before: lastMessage.id})
    }
    while(chunk.size > 0)

    console.log('All messages');
});

/*
client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('pong');
    }
  });
*/

client.login(auth.token);

var download = function(uri, filename, callback){
    filename = dir + "/" + createGuid() + "_" + filename;
    request.head(uri, function(err, res, body){
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

function createGuid() {  
    function s4() {  
       return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);  
    }  
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();  
 }  