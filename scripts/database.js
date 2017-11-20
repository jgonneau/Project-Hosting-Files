const		mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/local', {useMongoClient : true});
mongoose.Promise = global.Promise;

var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error!'));
	db.once('open', function() {});
	
var userSchema		= new mongoose.Schema({
		username : String,
		password : String
});

var fileSchema		= new mongoose.Schema({
		userowner : String,
		filename : String,
		filepath : String,
		fileext : String,
		filesize : Number,
		datefile : { type: Date, default: Date.now }
});

exports.connection	= db;
exports.userModel	= mongoose.model('dbusers', userSchema);
exports.filesModel	= mongoose.model('dbfiles', fileSchema);
