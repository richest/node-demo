const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();
const db = require('./modals')
const initRoutes = require('./routes')
const port = process.env.PORT;
//use express static folder

app.use(cors({
    origin: '*'
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"))

initRoutes(app)
// db.sequelize.sync();

app.listen(port,()=>{
    console.log(`listening on port http://localhost:${port}`);
})