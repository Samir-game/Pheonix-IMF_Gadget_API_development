const {prisma}= require("../database/db.js");
const redis= require("../database/redis.js").redisClient;
const {getRandomCodename, getRandomProbability}= require("../utils/gadgets.utils.js");
const {clearRedisData} = require("../utils/clearRedisData.utils.js");

const cacheKey="allGadgets";

const getAllGadgets=async(req,res)=>{
    try {

        const cached=await redis.get(cacheKey);
        if(cached){
            return res.json(JSON.parse(cached));
        }

        const gadgets=await prisma.gadget.findMany({
            where:{
                status:{not:"Decommissioned"}
            }
        });

        const Gadgets= gadgets.map(gadget=>({
            ...gadget,
            missionSuccessProbability:getRandomProbability()
        }));

        await redis.setEx(cacheKey,86400,JSON.stringify(Gadgets));

        return res.status(200).json(
            Gadgets
        );

    } catch (error) {
        console.error("Error getting all gadgets: ",error.message)
        return res.status(500).json({ 
            message:"Internal server error"
        });
    }
};


const createGadget=async(req,res)=>{

    try {

        const {name}=req.body;
        const codename=getRandomCodename();

        const newGadget = await prisma.gadget.create({
            data:{
                name,
                codename,
            },
        });

        await clearRedisData(cacheKey);

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
        const updates=req.body;

        const updated=await prisma.gadget.update({
            where:{
                id
            },
            data:updates,
        });

        await clearRedisData(cacheKey);

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

    await clearRedisData(cacheKey);
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
    getAllGadgets,
    createGadget,
    updateGadget,
    decommissionGadget
}