const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


  require('dotenv').config();

// import cac models
const app = express();

// app.use(express.json());


app.use(cors());
require('./src/models/user.model');
// connect mongodb
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	// useFindAndModify: false
});

mongoose.connection.on('connected', () => {
	console.log('Connected to mongo');
});

mongoose.connection.on('error', error => {
	console.log('Connect to mongo error', error);
});



app.all('/*', function(req, res, next) {
	// CORS headers
	res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	// Set custom headers for CORS
	res.header(
		'Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Authorization', 
	);
	if (req.method === 'OPTIONS') {
		res.status(200).end();
	} else {
		next();
	}
});

// const api = require('./routes');
// // import cac routes
// const useApi = (object, object2, prefix = []) => {
// 	for (const key in object) {
// 		if (Object.prototype.hasOwnProperty.call(object, key)) {
// 			const element = object[key];
// 			if (typeof element === 'object') {
// 				useApi(element, object2, [...prefix, `${key}`])
// 			} else {
// 				let x = object2;
// 				[...prefix, `${key}`].forEach(y => {x = x[y]});
// 				app.use(x);
// 			}
// 		}
// 	}
// };

// useApi(api, api);
// const { messaging } = require('firebase-admin');

// firebase.initializeApp(firebaseConfig);


const authRoute = require('./src/routes/auth.route');
const grammarRoute = require('./src/routes/grammar.route');
const commentRoute = require('./src/routes/comment.route');
const notificatiion = require('./src/routes/notification');
const notifiRoute = require('./src/routes/notifi.route');
const wordRoute = require('./src/routes/word.route');
const questiongrammarRoute = require('./src/routes/questiongrammar.route');
const scheduleRoute = require('./src/routes/schedule.route');
const wordcommentRoute = require('./src/routes/wordcomment.route')
 // const { messaging } = require('firebase-admin');
const kanjiRoute = require('./src/routes/kanji.route')
const kanjicommentRoute = require('./src/routes/kanjicomment.route');
const vocabularyRoute = require('./src/routes/vocabulary.route');
const postRoute = require('./src/routes/post.route');
const adminRoute = require('./src/routes/admin.route');



const firstParamsRoute = 'language'
app.use(`/${firstParamsRoute}`, authRoute)
app.use(`/${firstParamsRoute}`, grammarRoute)
app.use(`/${firstParamsRoute}`, commentRoute)
app.use(`/${firstParamsRoute}`, notificatiion)
app.use(`/${firstParamsRoute}`, notifiRoute)
app.use(`/${firstParamsRoute}`, wordRoute)
app.use(`/${firstParamsRoute}`, questiongrammarRoute)
app.use(`/${firstParamsRoute}`, scheduleRoute)
app.use(`/${firstParamsRoute}`, wordcommentRoute)
app.use(`/${firstParamsRoute}`, kanjiRoute)
app.use(`/${firstParamsRoute}`, kanjicommentRoute)
app.use(`/${firstParamsRoute}`, vocabularyRoute)
app.use(`/${firstParamsRoute}`, postRoute)
app.use(`/${firstParamsRoute}`, adminRoute)

// app.listen(process.env.PORT || 3002);

// socket io
const server = require("http").createServer(app);



mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

server.listen(process.env.PORT || 3002);

// const ioo = require('socket.io-client');
// const socket = ioo("http://192.168.1.72:3002");
// module.exports.socket = socket;

// io.on("connection", socket => {
// 	console.log("co nguoi vua ket noi "+ socket.id);
// 	socket.on("SEVER-SEND-LIKE", function(data){
// 		io.sockets.emit("SEVER-SEND-LIKE", data);
// 	});
// 	socket.on("SEVER-SEND-DISLIKE", function(data){
// 		io.sockets.emit("SEVER-SEND-DISLIKE", data);
// 	});
// 	socket.on("SEVER-SEND-NEWCOMMENT", function(data){
// 		io.sockets.emit("SEVER-SEND-NEWCOMMENT", data);
// 	})
// 	// io.emit("firstEvent", "Hello this it test!");
// 	socket.on("disconnect", function() {
// 		console.log(socket.id + "ngat ket noi");
// 	})
// });
// server.listen(port, () => console.log("server running on port: "+ port));


// // const { initializeApp, applicationDefault } = require('firebase-admin/app');
// var admin = require("firebase-admin");
// const serviceAccount = require('./service-account-file.json');
// const {getMessaging} = require("firebase/messaging");
// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// 	databaseURL: 'https://languageApp.firebaseio.com'
//   });



// const registrationToken = 'evx03jDCQR673qKlXdfO-g:APA91bG7ndVHdQ9Td0OF_ymp-4L02_qvZkiOZaIEUl24VmdKu_YhH9W0W-XcbJHV4QDJG8ruSR05MBEs-LBv5kw9nVVeuhLLfOKsCt97TptUVPgj61JMdsUJd-hFByIXTmONuXAgVUzg';

// const message = {
//   data: {
//     score: '850',
//     time: '2:45'
//   },
//   token: registrationToken
// };

// Send a message to the device corresponding to the provided
// registration token.
// getMessaging().send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//   });


// Initialize the default app
// initializeApp(firebaseConfig);

// // Initialize another app with a different config
// var otherApp = initializeApp(otherAppConfig, 'other');

// console.log(getApp().name);  // '[DEFAULT]'
// console.log(otherApp.name);     // 'other'
