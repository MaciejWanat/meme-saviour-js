const Discord = require('discord.js');
const auth = require('./auth.json');
const fsExtra = require('fs-extra')
const helper = require('./src/helper');

const client = new Discord.Client();
const dir = './memes'
const memeChannelId = "601159584941342739"

client.on('ready', async () => {
   await fetchMemes();
});


client.on('message', msg => {
    if (msg.content === 'Fetch my maymes!') {
      msg.reply('Okey dokey!');
      await fetchMemes();
    }
});


client.login(auth.token);

fetchMemes = async function()
{
    try
    {
        console.log(`Logged in as ${client.user.tag}!`);

        helper.ensureFolderCreated(dir);
    
        console.log(`Starting purge...`);
    
        fsExtra.emptyDirSync(dir)
    
        console.log(`Purge completed!`);
    
        const memeChannel = client.channels.get(memeChannelId);
        
        let totalAttachments = 0;
        let chunk = await memeChannel.fetchMessages();
        do
        {        
            console.log(`Found ${chunk.size} messages in chunk!`);
    
            let messages = Array.from(chunk.values())
    
            for (message of messages)
            {
                message.attachments.forEach(a => {
                    helper.download(a.url, a.filename, dir, function(){})
                    totalAttachments++;
                });
            }
    
            lastMessage = messages.pop();
            chunk = await memeChannel.fetchMessages({before: lastMessage.id})
        }
        while(chunk.size > 0)
    
        console.log(`Done! ${totalAttachments} tasty maymes saved.`);
    }
    catch(error)
    {
        console.error(`Something went terribly wrong. Error message: ${error}`)
    }    
}