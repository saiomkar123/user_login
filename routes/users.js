var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next){
	res.render('register', {
		'title': 'Register'
	});
})

router.get('/login', function(req, res, next){
	res.render('login', {
		'title': 'Login'
	});
})

router.post('/register', function(req, res, next){
	console.log('post register functions');
	console.log(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password1 = req.body.password;
	var password2 = req.body.password2;
	console.log(req.files);
	//  check for image field
	if(req.files.length > 0){
		console.log('uploading file...');
		console.log(req.files[0]);
		var profile_imgName = req.files[0].originalname;
		// var profile_imgName = req.files.profile_img.name;
		var profile_imgMime = req.files[0].mimetype;
		var profile_imgPath = req.files[0].path;
		var profile_imgExt = req.files[0].extension;
		var profile_imgSize = req.files[0].size;
	}else{
		// Set a Default Image
		var profile_imgName = 'noimage.png';
		console.log('no image upload');
	}
	// Form Validations
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email not valid').isEmail();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Password do not match').equals(password1);

	// Check for errors
	var errors = req.validationErrors();
	if(errors){
		console.log('error occurs');
		res.render('register',{
			title: 'Registration',
			errors: errors,
			name: name,
			email: email,
			password: password1,
			password2: password2
		});
	}else{
		console.log('no error occurs');
		var newUser = new User({
			name: name,
			email: email,
			password: password1,
			profile_img: profile_imgName,
		});

		// Create User
		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		// success message
		req.flash('success', "you are now registered and may login");
		res.location('/');
		res.redirect('/')
	}
})

passport.serializeUser(function(user, done){
	done(null, user.id);
})

passport.deserializeUser(function(id, done){
	User.getUserById(id, function(err, user){
		done(err, user);
	})
})

passport.use(new LocalStrategy(function(username, password, done){
	console.log(username);
	console.log(password);
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if(!user){
			console.log('Unknown User');
			return done(null, false, {message: 'Unknown User'});
		}
		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) throw err;
			if(isMatch){
				return done(null, user);
			}else{
				console.log('Invalid Password');
				return done(null, false, {message: 'Invalid Password'});
			}
		});
	});
}))

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid Username or Password'}), function(req, res){
	console.log('Authentication Successful');
	req.flash('success', 'You are logged in');
	res.redirect('/');
})

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have successfully logout');
	res.redirect('login');
})

module.exports = router;
