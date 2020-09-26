const GOOGLE_OAUTH2_APP_ID = process.env.GOOGLE_OAUTH2_APP_ID,
	  HOST = process.env.HOST,
	  PORT = process.env.PORT,
	  DBUSER= process.env.DBUSER,
	  DBPASS = process.env.DBPASS,
	  DBHOST = process.env.DBHOST,
	  DBNAME = process.env.DBNAME


const MongoClient = require('mongodb').MongoClient,
	  ObjectId = require('mongodb').ObjectID,
	  express = require('express'),
	  bodyParser = require('body-parser'),
	  cookieParser = require('cookie-parser')

const MongoUrl = `mongodb+srv://${DBUSER}:${DBPASS}@${DBHOST}/${DBNAME}?retryWrites=true`

var db_client, database, server

MongoClient.connect(MongoUrl, function(err, client) {
	if (err) {
		console.log('Could not connect to MongoDb server: Exiting ...')
		process.exit(1)
	}
	else {
		console.log('Successfully connected to MongoDb server ...')
		db_client = client
		database = client.db(DBNAME)
	}
});

var app = express()
server = require('http').createServer(app)
const io = require('socket.io')(server)
 
app.use(cookieParser())
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.use('/static', express.static('client/static'))
app.set('views', './client')
app.set('view engine', 'pug')

function good_bye() {
	console.log('\nTerminating application: Good Bye!');
	db_client.close();
	server.close();
	process.exit(0);
}

process.on('SIGINT', good_bye);
process.on('SIGTERM', good_bye);

io.on('connection', function (socket) {
	socket.on('disconnect', function (){
		io.emit('user disconnected')
		console.log(`disconnected socket: ${socket.id}\n`)
	});
});

app.get('/login', function (req, res) {
	res.render('login', {
		pageTitle: 'Real Time Marketplace',
		heading: 'Real Time Marketplace',
		app_id: GOOGLE_OAUTH2_APP_ID
	})
})

app.post('/login', function (req, res) {
	const userData = {
		first: req.body.fname,
		last: req.body.lname,
		image: req.body.profile_image,
		email: req.body.email
	}

	database.collection('users').findOne({email: req.body.email}, function(err, user) {
		if (err) {
			console.log('Error in database query: ' + err.message)
			res.send(JSON.stringify({failure: 'Server Fault'}))
		}
		if (!user) {
			database.collection('users').insertOne(userData, function(err, result) {
				if (err) {
					console.log('Could not insert document due to error: ' + err.message)
					res.send(JSON.stringify({failure: 'Server Fault'}))
				}
				else {
					console.log('Inserted a document into the users collection.')
					res.send(JSON.stringify({success: result.insertedId.valueOf()}))
				}
			})
		} else {
			console.log('User already registered.')
			res.send(JSON.stringify({success: user['_id']}))
		}
	})
})

app.get('/', function (req, res) {
	if (req.cookies.login) {
		database.collection('users').findOne({_id: ObjectId(req.cookies.login)}, function(err, user) {
			if (err) {
				console.log('Error in database query: ' + err.message)
				res.clearCookie('login')
				res.redirect('/login')
			}
			if (!user) {
				console.log('Invalid cookie value.')
				res.clearCookie('login')
				res.redirect('/login')
			} else {
				user.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
				res.render('index', {
					pageTitle: 'Real Time Marketplace',
					heading: 'Real Time Marketplace',
					user: user,
					app_id: GOOGLE_OAUTH2_APP_ID,
					host: HOST,
					port: PORT
				})
			}
		})
	} else {
		res.redirect('/login')
	}
})

app.post('/save', function (req, res) {
	const userData = {
		product: req.body.product,
		first: req.body.first,
		last: req.body.last,
		contact: req.body.contact,
		email: req.body.email,
		price: req.body.price,
		image: req.body.file_data,
		image_name: req.body.file,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		map_x: req.body.map_x,
		map_y: req.body.map_y,
		address: req.body.address,
		ip: req.body.ip
	}

	database.collection('sellers').insertOne(userData, function(err, result) {
		if (err) {
			console.log('Could not insert document due to error: ' + err.message)
			res.send(JSON.stringify({failure: 'Database insertion failure'}))
		}
		else {
			console.log('Inserted a document into the sellers collection.')
			var id = result.insertedId.valueOf();
			// broadcast to all the live users about this activity
			io.emit('seller added', {data: userData, id: id})
			userData.id = id
			res.send(JSON.stringify({success: userData}))
		}
	})
})

app.post('/update', function (req, res) {
	const userData = {
		product: req.body.product,
		contact: req.body.contact,
		price: req.body.price,
		image: req.body.file_data,
		image_name: req.body.file
	}

	database.collection('sellers').updateOne({'_id': ObjectId(req.body['_id'])}, {$set: userData}, {w: 1}, function(err, result) {
		if (err) {
			console.log('Could not update document due to error: ' + err.message);
			res.send(JSON.stringify({failure: 'Database insertion failure'}));
		}
		else {
			console.log("Updated a document into the sellers collection.");
			// broadcast to all the live users and update the marker information if it's in their current viewport
			io.emit('seller updated', {data: userData, id: req.body['_id']});
			res.send(JSON.stringify({success: 'successfully updated your information'}));
		}
	});
})

app.post('/delete', function (req, res) {
	database.collection('sellers').deleteOne({'_id': ObjectId(req.body.id)}, function(err, result) {
		if (err) {
			console.log('Could not delete document due to error: ' + err.message);
			res.send(JSON.stringify({failure: 'Failed to delete your listing'}));
		}
		else {
			console.log("Deleted a document from the donors collection.");
			// broadcast to all the live users and delete the marker from their current viewport
			io.emit('seller removed', {id: req.body.id});
			res.send(JSON.stringify({success: 'Successfully deleted your listing'}));
		}
	});
})

app.get('/edit/:id', function (req, res) {
	if (!req.cookies.login) res.redirect('/login')
	let id
	try {
		id = ObjectId(req.params.id)
	}
	catch (e) {
		console.log('Failed to create valid Database ID. ' + e);
		res.send('Not a valid user token provided.<br>' + e);
		return;
	}
	database.collection('sellers').find(id).limit(1).next(function(err, doc){
		if (err) {
			console.log('Could not fetch document due to error: ' + err.message)
			res.send('Database fetch failure.<br>' + err.message)
		}
		else if (doc) {
			console.log('Fetched a document from the sellers collection.')
			res.render('edit', { pageTitle: 'Edit Information', heading: 'Edit Information', data: JSON.stringify(doc)})
		}
		else {
			console.log('No document exists with that id.')
			res.send('No user exists with this token.')
		}
	})
})

app.get('/loader', function (req, res) {
	var query = {
		'map_x': {$gte: parseFloat(req.query.extent.xmin), $lte: parseFloat(req.query.extent.xmax)},
		'map_y': {$gte: parseFloat(req.query.extent.ymin), $lte: parseFloat(req.query.extent.ymax)}
	}
	database.collection('sellers').find(query).toArray(function(err, points) {
		if (err) {
			console.log('cursor.toArray throws error: ' + err.message)
			res.send(JSON.stringify({error: 'Server Fault'}))
		}
		if (req.query.email) {
			database.collection('sellers').find({email: req.query.email}).toArray(function(err, items) {
				if (err) {
					console.log('cursor.toArray throws error: ' + err.message)
					res.send(JSON.stringify({error: 'Server Fault'}))
				}
				res.send(JSON.stringify({points: points, items: items}))
			})
		} else {
			res.send(JSON.stringify({points: points}))
		}
	})
})

server.listen(PORT, function () {
	console.log('app is running on port ' + server.address().port)
})