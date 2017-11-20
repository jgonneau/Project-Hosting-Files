const	bcrypt	= require('bcrypt'),
		fs		= require('fs'),
		database	= require('./database.js');

var activeSession, 
	m_info,
	userDB		= database.userModel;
	filesDB		= database.filesModel;

function print_inf() {
	var ret;
	ret = m_info;
	m_info = "";
	return ret;
}

module.exports = {

	home	: function (req, res) {
		res.render('home', {mess_info: print_inf()});
	},
	signup	: function (req, res) {
		res.render('signup.ejs', {mess_info: print_inf(m_info)});
	},
	registering : function (req, res) {
		
		if(req.body.username && req.body.password)
		{
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err) {
					res.send('Error: '+err);
				}
				if (!exist) {
					bcrypt.hash(req.body.password, 11, function(err, hash){
						if (err)
							res.send('Error: '+err);
						else
						{
							var registerUser = new userDB({username: req.body.username, password: hash});
							registerUser.save(function(err, ret) {
								if (err) {
									 res.send('Error: '+err);
								}
								else {
									m_info = "Congratulation, you have been registered !"
									res.redirect('/dashboard');
								}
							});
						}
					});	
				}
				else {
					m_info = "No user found!";
					res.redirect('/');
				}
			});
		}
	},
	authentification : function (req, res) {
		if (req.body.username && req.body.password)
		{
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err) {
					res.send('Error: '+err);
				}
				if (exist !== null)
				{
					bcrypt.compare(req.body.password, exist.password, function (err, ret) {
						if (err)
							res.send('Error: '+err);
						else
						{
							req.session.user = exist.username;
							res.redirect('/dashboard');
						} 
					});
				}
				else
				{
					m_info = "Wrong password !";
					res.redirect('/');
				}
			});
		}
		else
		{
			res.redirect('/');
		}
	},
	login	: function (req, res) {
		res.render('login.ejs', {mess_info: print_inf(m_info)});
	},
	logout	: function (req, res) {
		activeSession.destroy();
		res.redirect('/');
	},
	dashboard : function (req, res) {
		
		filesDB.find({userowner: activeSession.user}, function(err, docs) {

				var list = [], i = 0;

				docs.forEach(function (elm) {
					list[i] = Array(i, elm);
					i++;
				});
				res.render('dashboard', {listfiles: list, username: activeSession.user});
			});
	},
	uploading : function (req, res) {
		
		if (req.file && activeSession.user)
		{
			filesDB({userowner: activeSession.user, filename: req.file.originalname, filepath: req.file.filename, fileext: req.file.mimetype, filesize: req.file.size }).save(function (){
				res.status(200).send('File '+req.file.originalname+' uploaded!'); 
			});
		}
		else
			res.send('Error');
	},
	removefile : function (req, res) {
		if (req.params.dfile)
		{
			var query = filesDB.findOneAndRemove({filepath: req.params.dfile});
			query.exec(function(err, ret) {
				if (err) {
					res.send('Error: '+err);
				}
				
				if (ret) {
					fs.unlinkSync('public/files/'+req.params.dfile);
					res.status(200).send(req.params.dfile+' has been deleted!');
				}
			});
		}
	},
	noLogin : function (req, res, next) {
		if (!req.session.user)
			next();
		else
			res.redirect('/dashboard');
	},
	requireLogin: function (req, res, next) {
		if (req.session.user) {
			activeSession = req.session;
			next();
		}
		else
			res.redirect('/');
	}
};
