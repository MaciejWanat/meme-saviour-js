const Discord = require('discord.js');
const appSettings = require('./appSettings.json');
const fsExtra = require('fs-extra')
const helper = require('./src/helper');
const GoogleDriveService = require('./src/googleDriveService');
const { performance } = require('perf_hooks')

const client = new Discord.Client();

client.on('ready', async () => {
   console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {    
    if (msg.content === 'Fetch my memes!') {
      msg.reply('Okey dokey! Just give me a while...');
      try
      {
        let t0 = performance.now();
        const memeChannel = client.channels.get(appSettings.discordChannelId);

        await fetchMemes();

        let t1 = performance.now();
        memeChannel.send(`Boy, that took a while... ${helper.millisToMinutesAndSeconds(t1 - t0)}, to be exact. Anyways, here are your memes: ${appSettings.googleDrive.shareLink}`)
      }
      catch(error)
      {
        memeChannel.send(`\nI'm sorry, but something went terribly wrong. Here's the error message: \n${error}`)
      }
    }
});

client.login(appSettings.botToken);

fetchMemes = async function()
{
    try
    {
        console.log(`Starting memes saving process...`);

        helper.ensureFolderCreated(appSettings.imagesDir);

        console.log(`\nStarting purge...`);
    
        fsExtra.emptyDirSync(appSettings.imagesDir)
    
        console.log(`Purge completed!\n`);
    
        const memeChannel = client.channels.get(appSettings.discordChannelId);
        
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

                    if (appSettings.allowedExtensions.includes(extension))
                    {
                        helper.download(a.url, a.filename, appSettings.imagesDir, function(){});

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

        const googleDriveService = new GoogleDriveService(appSettings.imagesDir, appSettings.googleDrive.folderId);

        console.log(`\nPurging your google drive folder...`);
        await googleDriveService.purgeFolder();

        console.log(`\nDone! It's time to upload your memes.`)
        await googleDriveService.uploadPictures();
    }
    catch(error)
    {
        console.error(`Something went terribly wrong. Error message: ${error}`)
        throw error;
    }    
}