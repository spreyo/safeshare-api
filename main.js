var express = require('express');
var app = express();
const fs = require('fs')
const { Client, Pool } = require('pg');
const connectionString = "postgres://spreyobp:MOrAxYXt34nI@ep-restless-hall-85610666.eu-central-1.aws.neon.tech/neondb"
const pool = new Pool({
    connectionString,
    ssl: true
})

const cors = require('cors');
const bodyParser = require('body-parser');
const e = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


app.use(cors())
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.text({ limit: "200mb" }));



app.get('/', (req, res, next) => {
    res.status(200);
    res.send(('private api made by spreyo'));


})

app.post("/image", async (req, res, next) => {
    const blob = req.body.blob
    const id = req.body.id;
    const views = req.body.views;
    postImageSQL = `INSERT INTO public.images ("blob",id, "views")
	VALUES ('${blob}','${id}', ${views});`
    await pool.query(postImageSQL);
    res.sendStatus(200);
})

app.get("/image", async (req, res, next) => {
    const imageID = req.query.id
    console.log(imageID);
    const getImageSQL = `SELECT "blob"
    FROM public.images
    WHERE id='${imageID}';`

    const getViewsSQL = `SELECT "views"
    FROM public.images
    WHERE id='${imageID}';`
    let views = await pool.query(getViewsSQL);
    try { views = views["rows"][0]["views"] } catch (e) { res.send("invalid id"); return };

    const addViewSQL = `UPDATE public.images
        SET "views"=${views + 1}
        WHERE id='${imageID}'`

    await pool.query(addViewSQL);

    if (views >= 5) {
        deleteImageSQL = `DELETE FROM public.images
    WHERE id='${imageID}'`;
        await pool.query(deleteImageSQL);
        console.log("deleted");

    }

    const response = await pool.query(getImageSQL);
    res.send(response["rows"][0]);
})


app.delete('/image/', async (req, res) => {
    const imageID = req.query.id;
    console.log(imageID);
    deleteImageSQL = `DELETE FROM public.images
    WHERE id='${imageID}'`;
    console.log(await pool.query(deleteImageSQL));
})


app.listen(3001, () => {
    console.log('server running');
})