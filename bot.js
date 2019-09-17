const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const memeChannel = client.channels.get("601159584941342739");
    
    let chunk = await memeChannel.fetchMessages();
    do
    {        
        console.log(`Found ${chunk.size} messages in chunk!`);

        let messages = Array.from(chunk.values())

        messages.forEach();

        for (message in messages)
        {
            if(message.attachments != null)
            {
                console.log(`Found attachment!`);
            }
        }

        lastMessage = messages.pop();
        chunk = await memeChannel.fetchMessages({before: lastMessage.id})
    }
    while(chunk.size > 0)
});

/*
client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('pong');
    }
  });
*/

client.login(auth.token);