var mongoose = require('mongoose');
var bcrypt = require('bcrypt');



	mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;


// User Schema

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
		required: true,
		bcrypt: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profile_img: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candiatePassword, hash, callback){
	bcrypt.compare(candiatePassword, hash, function(err, isMatch){
		if(err) return callback(err);
		callback(null, isMatch);
	})
}

module.exports.getUserByUsername = function(username, callback){
	var query = {name: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	var query = {};
	User.findById(id, callback);
}

module.exports.createUser = function(newUser, callback){
	bcrypt.hash(newUser.password, 10, function(err, hash){
		if(err) throw err;
		// Set Hashed Password
		newUser.password = hash;

		// Create User
		newUser.save(callback);
	});	
}