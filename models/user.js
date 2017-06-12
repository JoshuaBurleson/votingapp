var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//User Schema
var UserSchema = mongoose.Schema({
    username : {
        type : String,
        unique : true,
        index : true,
    },
    password : {
        type : String
    },
    email : {
        type : String
    },
    name : {
        type : String
    },
    polls : {
        type : Array
    }
});

var User = module.exports = mongoose.model('User', UserSchema);
module.exports.createUser = function(user, callback){
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        user.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username : username};
    User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserByID = function(id, callback){
    User.findById(id, callback);
}

module.exports.addPoll = function(user, poll){
    User.update({username : username}, {array : array}, function(err, res){
        console.log(res);
    });
}