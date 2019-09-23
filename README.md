# meme-saviour
Discord bot for saving images from a given channel.
It was originally created to easly fetch memes I share with friends on our discord channel - please don't mind some silly names :) I added functionality of uploading downloaded images to Google Drive, for easy sharing with others and small web server with health endpoint is build along with the bot.

# Setup

In order to start your bot up and running, you'll need to set up few things.

### 1. Create discord bot
This can be done in the [Discord developer portal](https://discordapp.com/developers/applications/). You need to create a bot here, and then get the bot token. Paste it to "botToken" of appSettings.json file.

### 2. Set imagesDir, discordChannelId
ImagesDir will be the folder when the images will be stored, e.g. './images'. You also need discordChannelId to let app know, from which channel to download files. You can get channelId by switching view in your discord options to "developer mode", then RMB at channel and "Copy ID".

This should be enough config to get your bot up are running! Type npm install, npm run and enjoy your botty, beep boop. You might need to comment out code related to google drive uploads. If you want to upload to the google drive, follow next steps.

### 3. Google drive config

Enable your api [here](https://developers.google.com/drive/api/v3/quickstart/nodejs). Copy the credentials into the folder of the bot. Fire up application - it should say that token is not here, so you need to go to a given webside, give permission and copy the code. After doing that token.json should be created. On the next run, you should be able to connect to your google drive! Last thing you need is filling two settings: folderId - google drive id of a folder which you would like to store your images in and the shareLink - link that will be pasted by bot after all process finished (possibly share link to your google drive folder). That's it!

Keep it dank!