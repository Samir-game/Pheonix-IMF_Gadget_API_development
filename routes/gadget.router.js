const express = require("express");
const router = express.Router();
const {getAllGadgets,createGadget,updateGadget,decommissionGadget}=require("../controllers/getGadgets.controller.js");


router
.route("/gadgets")
.get(getAllGadgets)

router
.route("/gadgets")
.post(createGadget)

router
.route("/gadgets/:id")
.patch(updateGadget)

router
.route("/gadgets/:id")
.delete(decommissionGadget)

module.exports=router