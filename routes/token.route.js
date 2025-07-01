const express= require("express");
const jwt= require("jsonwebtoken");
const router= express.Router();

router.get("/generate-token",(req,res)=>{
    const payload={
        id:"anonymous_user",
        role:"agent",
    };

    const token=jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"1d",
    });

    res.status(200).json({
        token:token
    });
});

module.exports=router;
