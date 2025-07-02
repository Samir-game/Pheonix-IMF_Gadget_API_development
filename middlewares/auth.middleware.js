const jwt= require("jsonwebtoken");

const auth=(req,res,next)=>{

    // authorization: Bearer token ,therefore getting authorization from headers 
    const authHeader=req.headers["authorization"];
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message:"No token found. Please login first"
        });
    }

    // splitting the auth header and taking the token part
    const token=authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ 
            message:"Token missing"
        });
    }

    // verifying the token
    jwt.verify(token, process.env.JWT_SECRET, (error,user)=>{
        if (error) {
            return res.status(403).json({ 
                message:"Invalid token"
            });
        }
        req.user=user;
        next();
    });
};

module.exports={
    auth
};
