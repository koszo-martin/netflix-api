const Video = require("../classes/Video")
const Category = require("../classes/Category")

function getVideoByTitle(req, res) {
    let video = new Video(1, new Category(1, "asddsa"), "askdlasl", "Movie" );
    res.json([video]);
}

module.exports = {
    getVideoByTitle: getVideoByTitle
}