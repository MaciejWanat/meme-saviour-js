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
        // lastMessage = chunk.Entries[chunk.Entries.length - 1];
        chunk = await memeChannel.fetchMessages()
    }
    while(chunk.size < 0)
});

client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('pong');
    }
  });

client.login(auth.token);