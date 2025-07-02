const express= require("express");
const app= express();
const gadgetRouter= require("./routes/gadget.router.js");
const tokenRouter= require("./routes/token.route.js")

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api",gadgetRouter); // gor gadggets routing
app.use("/api",tokenRouter); //for authentication 


module.exports=app