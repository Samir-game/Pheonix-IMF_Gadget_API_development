const {prisma}= require("../database/db.js");
const redis= require("../database/redis.js").redisClient;
const {getRandomCodename, getRandomProbability}= require("../utils/gadgets.utils.js");
const {clearRedisData} = require("../utils/clearRedisData.utils.js");

const statusKeys=["allGadgets","gadgets_Available","gadgets_Deployed",
    "gadgets_Destroyed","gadgets_Decommissioned"];

const getGadgets=async(req,res)=>{
    try {
        const {status}=req.query;

        const validStatus=["Available","Deployed","Destroyed","Decommissioned"];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status value" 
            });
        }

        const cacheKey=status? `gadgets_${status}` : "allGadgets";

        const cached=await redis.get(cacheKey);
        if(cached){
            return res.status(200).json(
                JSON.parse(cached)
            );
        }

        let filter={};
        if(status){
            filter={
                where:{status}
            };
        }
        else{
            filter={
                where:{status:{not:"Decommissioned"}}
            };
        }

        const gadgets=await prisma.gadget.findMany(filter);

        const Gadgets= gadgets.map(gadget=>({
            ...gadget,
            missionSuccessProbability:getRandomProbability()
        }));

        await redis.setEx(cacheKey,86400,JSON.stringify(Gadgets));

        return res.status(200).json(
            Gadgets
        );

    } catch (error) {
        console.error("Error getting gadgets: ",error.message)
        return res.status(500).json({ 
            message:"Internal server error"
        });
    }
};


const createGadget=async(req,res)=>{

    try {

        const {name,status}=req.body;
        const codename=getRandomCodename();

        const validStatus=["Available", "Deployed", "Destroyed"];
        if (!name || !status || !validStatus.includes(status)) {
            return res.status(400).json({
                message: "Name and valid status are required and valid."
            });
        }

        const newGadget = await prisma.gadget.create({
            data:{
                name,
                status,
                codename,
            },
        });

        for(const key of statusKeys){
            await clearRedisData(key)
        }

        return res.status(201).json({
            message:"gadget created successfully",
            newGadget
        });

    } catch (error) {
        console.error("Error creating gadget: ",error.message)
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};


const updateGadget=async(req,res)=>{
    try {

        const {id}=req.params;
        const {name,status}=req.body;

        const updates={};
        if(name){
            updates.name=name
        }

        if(status) {
            updates.status=status;
            updates.decommissionedAt = status==="Decommissioned"?new Date():null;
        }

        const updated=await prisma.gadget.update({
            where:{
                id
            },
            data:updates,
        });

        for(const key of statusKeys){
            await clearRedisData(key)
        }

        return res.status(200).json({
            message:"gadget updated successfully",
            updated
        });

    } catch (error) {
        console.error("Error updating gadget",error.message)
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};


const decommissionGadget=async(req,res)=>{
    try {
        const {id}=req.params;

        const updated=await prisma.gadget.update({
            where:{
                id
            },
            data:{
                status:"Decommissioned",
                decommissionedAt:new Date(),
            },
        });

        for(const key of statusKeys){
            await clearRedisData(key)
        }

        return res.status(200).json({ 
            message:"gadget decommissioned", 
            updated
        });

    } catch (error) {
        console.error("error in decommissionig gadget",error.message)
        res.status(500).json({
            message:"Internal server error"
        });
    }
};

module.exports={
    getGadgets,
    createGadget,
    updateGadget,
    decommissionGadget
}