const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const util = require('util');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

class GoogleDriveService {

  constructor(dir, folderId, logger) {
    this.folderId = folderId;
    this.dir = dir;
    this.drive = null;
    this.logger = logger;
    this.authorize();
  }

  async uploadPictures() {    
    const readdir = util.promisify(fs.readdir);

    const files = await readdir(this.dir);

    for (let file of files)
    {
      await this.uploadPicture(file);
    }
  }

  async uploadPicture(fileName) {
    var fileMetadata = {
      'name': fileName,
      parents: [this.folderId]
    };
    var media = {
      mimeType: 'image/png',
      body: fs.createReadStream(this.dir + "/" + fileName)
    };
    try
    {
      let response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      this.logger.info(`File uploaded! Id: ${response.data.id}`);
    }
    catch(ex)
    {
      this.logger.error("Error while adding file: ", ex);
    }
  }

  authorize() {
    const content = fs.readFileSync('credentials.json');
    const credentials = JSON.parse(content);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    try
    {
      const token = fs.readFileSync(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
    }
    catch
    {
      this.getAccessToken(oAuth2Client);
    }

    this.createGoogleDrive(oAuth2Client);
  }

  getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
      });
    });
  }

  createGoogleDrive(auth) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  async purgeFolder() {    
    let pageToken = null;
    let query = `\'${this.folderId}\' in parents`;
    let _this = this;

    let queryResult = await _this.drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
      pageToken: pageToken
    });

    for (let file of queryResult.data.files)
    {
      await _this.deleteFile(file.id);
    }
  }

  async deleteFile(fileId) {
    this.logger.info(`Deleting file: ${fileId}`);
    
    try
    {
      await this.drive.files.delete({
        fileId: fileId,
        fields: 'id'
      })
    }
    catch(ex)
    {
      this.logger.error(ex);
    }
  }
}

module.exports = GoogleDriveService;