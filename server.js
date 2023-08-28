const express = require('express')
const request = require('request');
const cors = require("cors")
const dotenv = require('dotenv');
const bodyParser = require("body-parser")

const port = 5000

global.access_token = ''

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
var spotify_redirect_uri =process.env.SPOTIFY_REDIRECT_URI
var genius_client_id = process.env.GENIUS_CLIENT_ID
var genius_client_secret = process.env.GENIUS_CLIENT_SECRET
var genius_redirect_uri =process.env.GENIUS_REDIRECT_URI

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var app = express();
app.use(bodyParser.urlencoded({ exended: true }))
app.use(cors())


app.get('/auth/login', (req, res) => {
    var scope = "streaming user-read-playback-state user-modify-playback-state user-read-email user-read-private user-library-read user-library-modify"
    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: spotify_redirect_uri,
        state: state
    })

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {
    var code = req.query.code;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: spotify_redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            refresh_token = body.refresh_token;
            expires_in = body.expires_in;
            res.redirect('/')
        }
        if (error) {
            res.redirect('/')
        }
    });

})

app.get('/auth/token', (req, res) => {
    res.json({
        access_token: access_token,
        // refresh_token: refresh_token,
        // expires_in: expires_in
    })
})

app.get('/auth/genius', (req, res) => {
    var scope = "me"
    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        client_id: genius_client_id,
        redirect_uri: genius_redirect_uri,
        scope: scope,
        state: state,
        response_type: "code"
    })

    res.redirect('https://api.genius.com/oauth/authorize?' + auth_query_parameters.toString());
})


app.get('/auth/genius/callback', (req, res) => {
    console.log("genius callback")
    var code = req.query.code;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            client_id: genius_client_id,
            client_secret: genius_client_secret,
            redirect_uri: genius_redirect_uri,
            grant_type: 'authorization_code',
            response_type: "code"
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(genius_client_id + ':' + genius_client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            res.redirect('/')
        }
        if (error) {
            res.redirect('/')
        }
    });

})

// app.get('/lyrics',  (req, res) => {
//     console.log("HERE2")
//     console.log(req.query)
//     // const lyrics = (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
//     // res.json({ lyrics })
//     res.json("TEST")
// })

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})