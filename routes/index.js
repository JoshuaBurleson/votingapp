var express = require('express');
    router = express.Router();
    mongo = require('mongodb').MongoClient;
    dbPath = 'mongodb://user:password@ds115752.mlab.com:15752/voters';

function ensureAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('error_msg','You are not logged in');
        res.redirect('users/login');
    }
}

router.get('/', ensureAuth, function(req, res){
    res.render('index', {username : req.user.username.toUpperCase()});
});


router.get('/allpolls', function(req, res){
    mongo.connect(dbPath, function(err, db){
        if(err) {console.log('we have and error'); throw err;}
        var collection = db.collection('polls');
        //Retieve all entries
        collection.find({}).toArray(function(err, data){ //data should return an array of Poll objects
            if(err) throw err;
            //Create array of poll titles
            var pollArr = data.map(function(poll){ 
                return poll.title;
            });
            res.render('allPolls', {polls: pollArr});
        })
    });
});

module.exports = router