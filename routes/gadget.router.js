const express= require("express");
const router= express.Router();
const {getGadgets,createGadget,updateGadget,decommissionGadget}=require("../controllers/gadgetsInventory.controller.js");
const {selfDestruct}= require("../controllers/selfDestruct.controller.js");
const {auth}= require("../middlewares/auth.middleware.js");

router
.route("/gadgets")
.get(auth, getGadgets)

router
.route("/gadgets")
.post(auth, createGadget)

router
.route("/gadgets/:id")
.patch(auth, updateGadget)

router
.route("/gadgets/:id")
.delete(auth, decommissionGadget)

router
.route("/gadgets/:id/self-destruct")
.post(auth, selfDestruct)

module.exports=router