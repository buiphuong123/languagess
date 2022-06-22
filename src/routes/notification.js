const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/sendToAll', (req, res) => {
    var notification = {
        'title' : 'Title of notification',
        'text': 'Subtitle'
    };
    var fcm_tokens =  'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ';
    var notification_body = {
        'notificatiion': notification,
        'registration_ids': fcm_tokens
    }
    axios.post('https://fcm.googleapis.com/fcm/send', {
        "to": fcm_tokens,
        // "to": ",
        // "registration_ids": fcm_tokens,
        'notification': {
            "title": "languageApp",
            "body": "your comment",
        },
        "data": {
            "username": "kaka"
        }
    }, {
        headers: {
            "Authorization": 'key='+ 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
            "Content-Type": "application/json"
        }
    })
    .then(() => {
        res.status(200).send('Notification send successfully');
    }).catch((err) => {
        res.status(400).send('somethinh went wrongy');
        console.log(err);
    })
});
module.exports = router;