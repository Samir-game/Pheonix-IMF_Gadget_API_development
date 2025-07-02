const {prisma}= require("../database/db.js");
const redis= require("../database/redis.js").redisClient;
const {getRandomCodename, getRandomProbability}= require("../utils/gadgets.utils.js");
const {clearRedisData} = require("../utils/clearRedisData.utils.js");

const statusKeys=["allGadgets","gadgets_Available","gadgets_Deployed",
    "gadgets_Destroyed","gadgets_Decommissioned"];

const getGadgets=async(req,res)=>{
    try {
        // getting the status from query
        const {status}=req.query;

        // checking for the  valid status
        const validStatus=["Available","Deployed","Destroyed","Decommissioned"];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status value" 
            });
        }

        // if status exists the cacheKey is status otherwise allgadgets
        const cacheKey=status? `gadgets_${status}` : "allGadgets";

        // checking if the data is already present for the chacheKey
        const cached=await redis.get(cacheKey);
        if(cached){
            // returning gadgets
            return res.status(200).json(
                JSON.parse(cached)
            );
        }

        // if not present in redis then setting the filter 
        let filter={};
        if(status){
            // if status is present then ,filter gadgets for the given status
            filter={
                where:{status}
            };
        }
        else{
            // status not present then return all gadgets whose status is not Decommissioned
            filter={
                where:{status:{not:"Decommissioned"}}
            };
        }

        const gadgets=await prisma.gadget.findMany(filter);

        // making new array of objects Gadgets in which missionSuccessProbability is added for each gadget
        const Gadgets= gadgets.map(gadget=>({
            ...gadget,
            missionSuccessProbability:getRandomProbability()
        }));

        // storing cache for particular cache key, exipires in 1Day
        await redis.setEx(cacheKey,86400,JSON.stringify(Gadgets));

        // returning Gadgets
        return res.status(200).json(
            Gadgets
        );

    } catch (error) {
        // error handling
        console.error("Error getting gadgets: ",error.message)
        return res.status(500).json({ 
            message:"Internal server error"
        });
    }
};


const createGadget=async(req,res)=>{

    try {
        // getting name and status for the gadget
        const {name,status}=req.body;
        const codename=getRandomCodename();//getting random codename

        // validating status
        const validStatus=["Available", "Deployed", "Destroyed"];
        if (!name || !status || !validStatus.includes(status)) {
            return res.status(400).json({
                message: "Name and valid status are required and valid."
            });
        }

        // creating nrw gadget and storing in database-Postgresql
        const newGadget = await prisma.gadget.create({
            data:{
                name,
                status,
                codename,
            },
        });

        // clearing all the redis cache data
        for(const key of statusKeys){
            await clearRedisData(key)
        }

        // returning new gadget and message
        return res.status(201).json({
            message:"gadget created successfully",
            newGadget
        });

    } catch (error) {
        // error handling
        console.error("Error creating gadget: ",error.message)
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};


const updateGadget=async(req,res)=>{
    try {

        // getting id of gadget from params
        const {id}=req.params;
        const {name,status}=req.body;

        // checking if the gadget exist or not for given id
        const existingGadget=await prisma.gadget.findUnique({
            where:{id}
        });

        if(!existingGadget){
            return res.status(404).json({
                message:"Gadget not found"
            });
        }

        // if exisit then,
        const updates={};
        if(name){
            // if name is updating then
            updates.name=name
        }

        if(status) {
            // if status is updating 
            updates.status=status;
            updates.decommissionedAt = status==="Decommissioned"?new Date():null;
            // checking is status=Decommissioned then set decommissionedAt to new Date else null
        }

        const updated=await prisma.gadget.update({
            where:{
                id
            },
            data:updates,
        });//updating the gadget

        for(const key of statusKeys){
            await clearRedisData(key)
        }//clearing cache data 

        // returning the updated gadget and message
        return res.status(200).json({
            message:"gadget updated successfully",
            updated
        });

    } catch (error) {
        // error handling
        console.error("Error updating gadget",error.message)
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};


const decommissionGadget=async(req,res)=>{
    try {
        const {id}=req.params;
        // getting id of gadget from params

        // checking if the gadget exist or not for given id
        const existingGadget=await prisma.gadget.findUnique({
            where:{id}
        });

        if (!existingGadget) {
            return res.status(404).json({
                message:"Gadget not found"
            });
        }

        // if exist then decommissioning the gadget
        const decommissionedGadget=await prisma.gadget.update({
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
        }//clearing cache data

        // returning the  essage and decommissioned gadget
        return res.status(200).json({ 
            message:"gadget decommissioned", 
            decommissionedGadget
        });

    } catch (error) {
        // error handling
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