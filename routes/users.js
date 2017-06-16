var express = require('express');
    router = express.Router();
    User = require('../models/user');
    Poll = require('../models/polls');
    passport = require('passport');
    LocalStrategy = require('passport-local').Strategy;

/[\?\=\/\.]+/g


// Register
router.get('/register', function(req,res){
    res.render('register');
});

//Attempt New User Registration
router.post('/register', function(req,res){
    var name = req.body.name;
        email = req.body.email;
        username = req.body.username;
        password = req.body.password;
        password2 = req.body.password2;

    //Form Data Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Please re-type password').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    
    if(errors){
        res.render('register',{
            errors:errors
        });
    }else{
        //Create new user using User schema from user.js in models folder
        var newUser = new User({
            name : name,
            email : email,
            username : username,
            password : password,
            polls : []
        });
        User.createUser(newUser, function(err, user){
        //Handle error for Username already exisisting in DB
        if (err && err.code === 11000) {
            res.render('register',{errors :[{msg : 'Username already in use'}]});
            return;
        }else{
            req.flash('success_msg', 'You are registered and can now login');
            res.redirect('/users/login');}
        });
    }});

//Passport Middleware
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message : 'Unknown User'});
        }
    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err
        if(isMatch){
            return done(null, user);
        } else{
            return done(null, false, {message : 'Invalid Password'})
        }
    })
    });
  }));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.getUserByID(id, function(err, user){
        done(err, user);
    })
})
///End Passport Middleware

//Login Page
router.get('/login', function(req,res){
    res.render('login');
});

//Attempt Login
router.post('/login', passport.authenticate('local', {
    successRedirect : '/dashboard', 
    failureRedirect : '/users/login', 
    failureFlash : true}));

//Logout
router.get('/logout', function(req,res, next){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

//Retrieve User's Polls
router.get('/mypolls', ensureAuth ,function(req, res) {
    var polls = req.user.polls//['this', 'and this', 'and this', 'and also this'];
    res.render('mypolls', {polls : polls});
  });

//Access Poll Adding Page
router.get('/addpoll', ensureAuth, function(req, res){
    res.render('addpoll')
});

//Attempt to add poll
router.post('/addpoll', function(req,res){
    var title = req.body.title;
        option1 = req.body.option1;
        option2 = req.body.option2;
    //Validate form data
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('option1', 'Both options are required').notEmpty();
    req.checkBody('option2', 'Both options are required').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        res.render('addpoll',{
            errors:errors
        });
    }else if(/[\?\=\/\.]+/g.test(title)){
        res.render('addpoll', {errors: [{param: "title", msg: "Title may not contain any of the following: ? = / .", value: ""}]})
    }else{
        //Create new poll using Poll schema from polls.js in models folder
        var newPoll = {title: title, options : {}}//****$%^$ */
        newPoll.options[option1] = 0;
        newPoll.options[option2] = 0;
    //Attempt to add poll
    Poll.createPoll(newPoll, function(err, poll){
        //Handle error for poll title already existing in polls collection of db
        if (err && err.code === 11000) {
            res.render('addpoll',{errors :[{msg : 'Poll title already in use'}]});
            return;
        }else{
            var userPollArr = req.user.polls; 
            userPollArr.push(title); //add poll title to user's current polls array
            //save updated polls array data to user db document
            User.update({username : req.user.username},{polls : userPollArr}, function(err, res){
            if(err) throw err;
        });
            req.flash('success_msg', 'Poll successfully added');
            res.redirect('/users/mypolls');}
        });
    }});

function ensureAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports = router