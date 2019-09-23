const Discord = require('discord.js');
const auth = require('./auth.json');
const fsExtra = require('fs-extra')
const helper = require('./src/helper');
const GoogleDriveService = require('./src/googleDriveService');
const { performance } = require('perf_hooks')

const client = new Discord.Client();
const dir = './memes'
const memeChannelId = "601159584941342739"
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp"]
const googleDriveShareLink = "x"

client.on('ready', async () => {
   console.log(`Logged in as ${client.user.tag}!`);
   let t0 = performance.now();

   await fetchMemes();

   let t1 = performance.now();

   console.log(`Boy, that took a while... ${helper.millisToMinutesAndSeconds(t1 - t0)}, to be exact. Anyways, here are your memes: ${googleDriveShareLink}`)
});

client.on('message', async msg => {    
    if (msg.content === 'Fetch my maymes!') {
      msg.reply('Okey dokey! Just give me a while...');

      let t0 = performance.now();
      await fetchMemes();
      let t1 = performance.now();

      const memeChannel = client.channels.get(memeChannelId);
      memeChannel.send(`Boy, that took a while... ${helper.millisToMinutesAndSeconds(t1 - t0)}, to be exact. Anyways, here are your memes: ${googleDriveShareLink}`)
    }
});

client.login(auth.token);

fetchMemes = async function()
{
    try
    {
        console.log(`Starting memes saving process...`);

        helper.ensureFolderCreated(dir);

        console.log(`\nStarting purge...`);
    
        fsExtra.emptyDirSync(dir)
    
        console.log(`Purge completed!\n`);
    
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
        console.log(`\nLets upload these bad boys to your google drive.`);

        const googleDriveService = new GoogleDriveService("./memes2");

        console.log(`\nPurging your google drive folder...`);
        await googleDriveService.purgeFolder();

        console.log(`\nDone! It's time to upload you memes.`)
        await googleDriveService.uploadPictures();
    }
    catch(error)
    {
        console.error(`Something went terribly wrong. Error message: ${error}`)
    }    
}