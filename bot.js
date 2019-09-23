const Discord = require('discord.js');
const appSettings = require('./appSettings.json');
const fsExtra = require('fs-extra')
const helper = require('./src/helper');
const GoogleDriveService = require('./src/googleDriveService');
const { performance } = require('perf_hooks');
const winston = require('winston');
require('winston-daily-rotate-file');
const expressServer = require('./express-bot/expressServer');

const client = new Discord.Client();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
    defaultMeta: { service: 'meme-saviour' },
    transports: [
      new (winston.transports.DailyRotateFile)({ filename: './logs/error-%DATE%.log', datePattern: 'YYYY-MM-DD-HH', level: 'error', maxSize: '20m', maxFiles:'14d' }),
      new (winston.transports.DailyRotateFile)({ filename: './logs/combined-%DATE%.log', datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles:'14d' })
    ]
  });

client.on('ready', async () => {
   console.log(`Logged in as ${client.user.tag}!`);

   // This line exposes simple http server for you to ping if you want to see if the app is alive. This is not mandatory.
   expressServer.start(appSettings.serverPort);
});

client.on('message', async msg => {    
    if (msg.content === 'Fetch my memes!') {
      logger.info('Fetching started... ');
      msg.reply('Okey dokey! Just give me a while...');
      const memeChannel = client.channels.get(appSettings.discordChannelId);

      try
      {
        let t0 = performance.now();

        await fetchMemes();

        let t1 = performance.now();
        let timePassed = helper.millisToMinutesAndSeconds(t1 - t0);
        memeChannel.send(`Boy, that took a while... ${timePassed}, to be exact. Anyways, here are your memes: ${appSettings.googleDrive.shareLink}`)
        logger.info(`Fetched successfuly after ${timePassed}.`);
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
        logger.info('Starting memes saving process...');

        helper.ensureFolderCreated(appSettings.imagesDir);

        logger.info(`Starting purge...`);
    
        fsExtra.emptyDirSync(appSettings.imagesDir)
    
        logger.info(`Purge completed!`);
    
        const memeChannel = client.channels.get(appSettings.discordChannelId);
        
        let totalAttachments = 0;
        let chunk = await memeChannel.fetchMessages();
        do
        {        
            logger.info(`Found ${chunk.size} messages in chunk!`);
    
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

        logger.info(`Done! ${totalAttachments} tasty maymes saved.`);
        logger.info(`Lets upload these bad boys to your google drive.`);

        const googleDriveService = new GoogleDriveService(appSettings.imagesDir, appSettings.googleDrive.folderId, logger);

        logger.info(`Purging your google drive folder...`);
        await googleDriveService.purgeFolder();

        logger.info(`Done! It's time to upload your memes.`)
        await googleDriveService.uploadPictures();
    }
    catch(error)
    {
        logger.error(`Something went terribly wrong. Error message: ${error}`)
        logger.error(`Stack trace: ${error.stack}`)
        throw error;
    }    
}