const {prisma}= require("../database/db.js");
const {generateConfirmationCode}= require("../utils/gadgets.utils.js");

const selfDestruct=async(req,res)=>{
    try {
        // getting id from params
        const {id}=req.params;

        // finding the unique gadget having that id
        const gadget=await prisma.gadget.findUnique({ 
            where:{id}
        });

        // if gadget not found
        if(!gadget){
            return res.status(404).json({ 
                message: "Gadget not found"
            });
        }

        // calling the function for getting random code
        const confirmationCode=generateConfirmationCode();
        
        // returning the message and the codename
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