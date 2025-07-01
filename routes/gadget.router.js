const express = require("express");
const router = express.Router();
const {getGadgets,createGadget,updateGadget,decommissionGadget}=require("../controllers/gadgetsInventory.controller.js");
const {selfDestruct}= require("../controllers/selfDestruct.controller.js");

router
.route("/gadgets")
.get(getGadgets)

router
.route("/gadgets")
.post(createGadget)

router
.route("/gadgets/:id")
.patch(updateGadget)

router
.route("/gadgets/:id")
.delete(decommissionGadget)

router
.route("/gadgets/:id/self-destruct")
.post(selfDestruct)

module.exports=router