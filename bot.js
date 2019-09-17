const Discord = require('discord.js');
const auth = require('./auth.json');
const fsExtra = require('fs-extra')
const helper = require('./src/helper');
const zipFolder = require('zip-a-folder');

const client = new Discord.Client();
const dir = './memes'
const zipPath = "./memes.zip"
const memeChannelId = "601159584941342739"
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp"]

client.on('ready', async () => {
   console.log(`Logged in as ${client.user.tag}!`);
   await fetchMemes();
});

client.on('message', async msg => {
    if (msg.content === 'Fetch my maymes!') {
      msg.reply('Okey dokey! Just give me a while...');
      await fetchMemes();
    }
});

client.login(auth.token);

fetchMemes = async function()
{
    try
    {
        console.log(`Starting memes saving process...`);

        helper.ensureFolderCreated(dir);
        helper.ensureZipDeleted(zipPath);

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
                message.attachments.forEach(async (a) => {
                    let extension = a.url.substring(a.url.lastIndexOf('/') + 1).split('.').pop().toLowerCase();

                    if (allowedExtensions.includes(extension))
                    {
                        helper.download(a.url, a.filename, dir, function(){});

                        totalAttachments++;
                    }
                });
            }
    
            lastMessage = messages.pop();
            chunk = await memeChannel.fetchMessages({before: lastMessage.id})
        }
        while(chunk.size > 0)

        console.log(`Done! ${totalAttachments} tasty maymes saved.`);
        console.log(`Let me just zip that for you...`);
        
        await zipFolder.zipFolder(dir, zipPath, function(err) {
            if(err) {
                console.log('Something went wrong!', err);
            }
        });

        console.log(`Done!`);
    }
    catch(error)
    {
        console.error(`Something went terribly wrong. Error message: ${error}`)
    }    
}