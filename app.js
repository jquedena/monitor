const express = require('express')
const app = express()
const port = 3000
const request = require("request")

app.use('/node_modules', express.static('node_modules'))
app.use('/static', express.static('public'))
app.get('/', (req, res) => res.send('Hello World!'))

app.get('/info', (req, res) => {
    const url = req.query["node"];
    request.get(url, (error, response, body) => {
        res.setHeader("Content-Type", "application/json");
        if(error) {
            return res.send(error);
        }
        return res.send(body);
    });
})

app.listen(port, () => console.log("Example app listening on port " + port + "!"))