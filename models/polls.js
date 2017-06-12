var mongodb = require('mongodb').MongoClient;
    mongoose = require('mongoose');
    dbPath = 'mongodb://user:password@ds115752.mlab.com:15752/voters';
    mongoose.connect(dbPath);

//Poll Schema
var PollSchema = mongoose.Schema({
    title : {
        type : String,
        unique : true,
        index : true,
    },
    options : { ///[{opt1 : score, opt2: score, opt3: score}]
        type : Array
    }
});

var Poll = module.exports = mongoose.model('Poll', PollSchema);

module.exports.createPoll = function(poll, callback){
    var newPoll = new Poll(poll);
    mongodb.connect(dbPath,function(err, db){
        if(err) throw err;
        var collection = db.collection('polls');
        //Open Polls collection to check for existing Poll Title
        collection.find({title : poll.title}).toArray(function(err, data){
            if(err) throw err;
            //if no such poll title exists use mongoose save function to add entry to DB
            if(data.length == 0){
                newPoll.save();
                callback();
            }else{ //Return 11000 error
                var elevenThouError = new Error('Poll Title Already Exists');
                elevenThouError.code = 11000
                callback(elevenThouError);
            }
        });
    });

}

module.exports.getPollByTitle = function(title, callback){
    var query = {title : title};
    Poll.findOne(query, callback);
}

module.exports.getPollByID = function(id, callback){
    Poll.findById(id, callback);
}

module.exports.addPoll = function(user, poll){
    User.update({title : title}, {array : array}, function(err, res){
        console.log(res);
    });
}