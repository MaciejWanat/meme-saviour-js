const request = require('request');
const fs = require('fs');

exports.download = function(uri, filename, dir, callback){
    filename = dir + "/" + createGuid() + "_" + filename;
    request.head(uri, function(err, res, body){
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

exports.ensureFolderCreated = function(dir){
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function createGuid() {  
    function s4() {  
       return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);  
    }  
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();  
 }  