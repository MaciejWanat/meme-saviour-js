const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');

const dir = './meme'

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
                fs.writeFileSync(`./memes/${a.name}`, a.file); // Write the file to the system synchronously.
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