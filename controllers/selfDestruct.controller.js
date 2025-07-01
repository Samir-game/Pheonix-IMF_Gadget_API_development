const {prisma}= require("../database/db.js");
const {generateConfirmationCode}= require("../utils/gadgets.utils.js");

const selfDestruct=async(req,res)=>{
    try {
        const {id}=req.params;

        const gadget=await prisma.gadget.findUnique({ 
            where:{id}
        });

        if(!gadget){
            return res.status(404).json({ 
                message: "Gadget not found"
            });
        }

        const confirmationCode=generateConfirmationCode();
        
        return res.status(200).json({
            message:`Self-destruct sequence started for: ${gadget.name}`,
            confirmationCode
        });

    } catch (error) {
        console.error("Error starting self-destruct:",error.message);
        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};

module.exports={
    selfDestruct
};