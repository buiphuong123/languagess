const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const firebaseConfig = {
	"type": "service_account",
	"project_id": "languageapp-d3a70",
	"private_key_id": "7c7341271b3fa5ef393e352d08ae469c30a8d05a",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyOHIxK2ei5DSL\nfbYwNicp4vnK0dB2gKKMLOcCfmvLMEL3DjJAhMgfiSii6KPNWRuI+lPvGpFwSpT7\nzXJft9WsRSwMp4YRHcu6RGTYV6wFBGzL/DdyVopUvwaABEeb7ZF6nu2c8Ia3xAry\nv48aRWAr/W5GHX+XYkdU1bRKpKeRVkVpBu7VXK3WN1quyM+OXht9CBs18yofWMeX\nIgSARpVDr1OdQYrf6CmuyNPeekTr2l9k1rheTNDn2CpHi6DztuXFbYtVBSL4OY3K\nEZXpdpot1+6Pcdun83x4LtsTsJYkysFCRb7OHgU4T5RVoqNKAcaRSPS1ffzytZ/c\nM2qj+oa5AgMBAAECggEAC18BnjSERMbluV64gKP75LbINFIlyGHVvTbiOG0DiK/Y\nHfZIa4htUmHId3h7dw8v7BH4yAE8dVs03UoS+Zt7pSW2tUn9CluJ06UogAs7/Qf2\nvx8lFIUEB3s2uXVMclz6ksXQKFrKZbA6+JkTUtxJUhU184BPU0PghD+sZLTTwjiQ\n/THVbeqcZiYe0T44qykXRyu6sOHJvSHkby+1by/7lEvlnlVB/jAlrldd0UJ1tIYa\nrN0pPKQSyAVYtyobYngH62fAKZVqqbq9UR7lOVVAPudKunv7SF0JYDQzmSzmnAl8\nBe4YN3V+wPsocTQrXj+hB+RRBSMe5P6WeRSG4jXTmQKBgQDv6faeEx+fmqXFm9zu\nB4YZMXzK0te8J7SpK4ZnAmiNEzIp021+7zvoNpH/j9P7s3kVrO+lhCSkav4pmtPa\no0E4CrNU9GDK8FlqVxQYOJ/lMDKLI6qkxYu86b2yVwQzmg5jZ4yxu9pNqnAsTXCq\nDYvzgXuj0yMbLtNNpEDzYtDLFQKBgQC+K4l/NgHF+Yodg/8ErOhzatvcLk3uK9Mp\n9LS1d2nYyVTK4VCFj6CZ2CVuu2yWHbrAdeJ5zyYJKCSeKvAgZdypM+/HDivIVWtS\n73jkvn4k/LHenQyQCH8W/1SsIIbOyUyKdbrZHwQvpIe9uIIEWl4NnozyRLMZ1mei\nWRF6HhHmFQKBgGWuQ1e7wyth3+BgrsIzbiI/VySfN9AHBAqu58fAvY8NE7WmZkHm\nIv3IIxitXKrQ5gDJysfbuav1rML1W9TOXFXkMx1OdbeNJlhrj5i0ZxA73TAbbbdo\nAlGOv1dWifFU2cRHntm1RFCma+Ra7eUk2KvbtQs58ScUMXo2o1CEEPoBAoGAGuAw\nSGgri/0eRdmXuuNs3pLli5KHtPdAmpdYyqSbsuWRNDLvnFCWE+f2MlYOnJCLChQe\n87QQ3g5sTmYnFY0PyGHsqycXjPJ1fn0Vis5ZKYUE5j8vvVNWErv3DXRzWNoeFRta\nUsENaGZKQMfIqDDVRft4U+zdmvMwJkOMMsP5J5kCgYBSqBqPrd4wJ4FCZfPt1uP3\nPt+8/tJ6p8vgAYcKRacIuDIWb8K0+gwezATCYomB5FIngxZoMiWJWUoWkpbZG8+Y\nLlFU/1q0TVKWokLH2i4VlVDsRG2m0CMVw9EIqXopt+gwWfet0vd8zxtYUdYkz8L7\nM9Gii7lfsB1VLzBYhMZTng==\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-9sdzp@languageapp-d3a70.iam.gserviceaccount.com",
	"client_id": "103207242436654480753",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9sdzp%40languageapp-d3a70.iam.gserviceaccount.com"
  }
  



dotenv.config();

// import cac models
const app = express();

app.use(express.json());

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
