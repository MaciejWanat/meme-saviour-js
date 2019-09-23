var express = require("express");
var app = express();

exports.start = function(port){
    app.listen(port, () => {
        console.log("The bot is alive - praise the lord!");
       });

    app.get("/", (req, res, next) => {
    res.json("The bot is alive!");
    });
}