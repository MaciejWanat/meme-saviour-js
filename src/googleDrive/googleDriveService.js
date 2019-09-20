const fs = require('fs');
const readline = require('readline');
const async = require('async');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const memeFolderId = '12i2d0_2sE4lgxXx-sl1aA6s9znHmI4kK';
const throttleMs = 1000;

class GoogleDriveService {
  drive = null;
  dir = null;

  constructor(dir) {
    this.dir = dir;
    this.authorize();
  }

  uploadPictures() {
    let _this = this;
    _this.fileIterator = 0;
    fs.readdir(_this.dir, function (err, files) {
      if (err) {
        console.error("Could not list the directory.", err);
      }

      files.forEach(function (file, index) {
        setTimeout(() => _this.uploadPicture(file), throttleMs * index);
      })
    })
  }

  uploadPicture(fileName) {
    let _this = this;
    var fileMetadata = {
      'name': fileName,
      parents: [memeFolderId]
    };
    var media = {
      mimeType: 'image/png',
      body: fs.createReadStream(this.dir + "/" + fileName)
    };
    this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        _this.fileIterator++;
        console.log(`File uploaded! Number: ${_this.fileIterator}`);
      }
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
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

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
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
    let query = `\'${memeFolderId}\' in parents`;
    let _this = this;

    let queryResult = await _this.drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
      pageToken: pageToken
    });

    queryResult.data.files.forEach(function (file, index) {
      setTimeout(() => _this.deleteFile(file.id), throttleMs * index);
    });
  }

  deleteFile(fileId){
    console.log('Deleting file: ', fileId);
    this.drive.files.delete({
      fileId: fileId,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        console.error(err);
        // Handle error
      } else {
        // File moved.
      }
    });
  }
}

module.exports = GoogleDriveService;