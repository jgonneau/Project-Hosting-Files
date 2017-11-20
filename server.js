const	express			= require('express'),
		app				= express(),
		session			= require('express-session'),
		MongoStore		= require('connect-mongo')(session),
		path			= require('path'),
		engine			= require('ejs-mate'),
		cookieParser	= require('cookie-parser'),
		bodyParser		= require('body-parser'),
		multer			= require('multer'),
		server			= require('http').createServer(app),
		asecret			= "0987654321",
		routes			= require('./scripts/routes.js'),
		database		= require('./scripts/database.js'),
		lport			= process.env.PORT || 3000;
		
		
		app.engine('ejs', engine)
			.set('views', path.join(__dirname, 'views'))
			.set('view engine', 'ejs')
			.use(express.static(path.join(__dirname, 'public')))
			.use('/public/', express.static(__dirname+'/public'))
			.use(bodyParser.urlencoded({extended: true}))
			.use(session({
					store: new MongoStore({mongooseConnection: database.connection }),
					resave: false,
					saveUninitialized: true,
					secret: asecret
			}));
			
		var 	storage = multer.diskStorage({
			
			destination: function (req, file, cb) {
				cb(null, 'public/files/');
			},
			filename: function (req, file, cb) {
				cb(null, Date.now() + '-' + file.originalname);
			}
			
		});
		var  	upload = multer({ storage: storage });
			
		app.get('/', routes.noLogin, routes.home )
			.post('/registering', routes.noLogin, routes.registering )
			.post('/authentification', routes.noLogin, routes.authentification )
			.get('/dashboard', routes.requireLogin, routes.dashboard )
			.get('/logout', routes.requireLogin, routes.logout )
			.post('/uploading', routes.requireLogin, upload.single('upfile'), routes.uploading )
			.get('/deletefile/:dfile', routes.requireLogin, routes.removefile )
			.use(function(req, res, next) {
				res.status(404).send('<p>404</p>');
			});
		
		
		server.listen(lport, function() {
			console.log('Server starting... on '+lport+'.\n');
		});
	
