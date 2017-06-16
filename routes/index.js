const express = require('express');
    router = express.Router();
    mongo = require('mongodb').MongoClient;
    dbPath = process.env.DBPATH;

function ensureAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('error_msg','You are not logged in');
        res.redirect('users/login');
    }
}

router.get('/dashboard', ensureAuth, function(req, res){
    res.render('index', {username : req.user.username.toUpperCase()});
});


router.get('/', function(req, res){
    mongo.connect(dbPath, function(err, db){
        if(err) {console.log('we have and error'); throw err;}
        let collection = db.collection('polls');
        //Retieve all entries
        collection.find({}).toArray(function(err, data){ //data should return an array of Poll objects
            if(err) throw err;
            //Create array of poll titles
            let pollArr = data.map(function(poll){ 
                return poll.title;
            });
            res.render('allPolls', {polls: pollArr});
        })
    });
});

router.post('/delete', function(req,res){
    let poll = req.body.name;
    let userPolls = req.user.polls
    console.log(userPolls, req.user);
    userPolls.splice(userPolls.indexOf(poll), 1);
    console.log(userPolls);
    mongo.connect(dbPath, function(err, db){
        if(err) throw err;
        userCollection = db.collection('users');
        userCollection.update({username: req.user.username},{$set: {polls: userPolls}});
        pollCollection = db.collection('polls');
        pollCollection.remove({title: poll});
        res.redirect('/users/mypolls');

    });
});

router.get('/polls/:poll',function(req,res){
    let urlTitle = req.params.poll;
    console.log(urlTitle);
    mongo.connect(dbPath, function(err, db){
        if(err) throw err;
        var collection = db.collection('polls');
        //find options and votes of selected poll
        collection.find({title: urlTitle}).toArray(function(err,data){
            if(err) throw err;
            //select options and their votes {option: votes}
            let poll = data[0].options[0];
            let optionMenu = Object.keys(poll);
            let votes = optionMenu.map(function(key){
                return [key, poll[key]];
            });
            votes.sort(function(first, second){
                return first[1] - second[1];
            })
            votes.splice(0,0,['Votes', 'votes']);
            console.log(votes.length)
            res.render('newPoll', {title: urlTitle, optionMenu: optionMenu, votes: String(votes)})
        });
    });
});

router.post('/polls/:poll',function(req,res){
    //req.checkParams('poll', 'Poll name cannot contain special characters').isAlpha();
    //Poll title
    let poll = req.params.poll;
    //Selection voted on
    let vote = req.body.vote;
    console.log(vote);
    if(vote == ""){
        console.log(vote);
        vote = 'No Vote';
    }
    mongo.connect(dbPath, function(err, db){
        if(err) throw err;
        let collection = db.collection('polls');
        collection.find({title: poll}).toArray(function(err, data){
            if(err) throw err
            //Get Poll collection to update
            let options = data[0].options;
            if(options[0][vote] == undefined){
                options[0][vote] = 0;
            }
            options[0][vote] += 1;
            //Update
            collection.update({title: poll}, {title: poll, options: options}, function(err, res){
                if(err) throw err;
            });
            res.redirect('/polls/'+poll);
        });
});
    });

module.exports = router