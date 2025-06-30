const express= require("express");
const app= express();
const gadgetRouter = require("./routes/gadget.router.js");


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api",gadgetRouter);

module.exports=app