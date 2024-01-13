import { GroupMessage } from "../models/index.js";
import { io , getFilePath } from "../utils/index.js";

 function sendText(req , res) {
   const { group_id , message } = req.body;
   const { user_id } = req.user;

   const group_message = new GroupMessage({
    group : group_id,
    user : user_id ,
    message,
    type : "TEXT"
   });

   group_message.save()
   .then(async () => {
    const data = await group_message.populate("user");
    io.sockets.in(group_id).emit("message" , data);
    io.sockets.in(`${group_id}_notify`).emit("message_notify" , data);

    res.status(201).send({});
   })
   .catch(error => res.status(500).send({message : `${error} : An error in Server Side`}))
}

function sendImage(req , res) {
   const { group_id } = req.body;
   const { user_id } = req.user;

   const group_message = new GroupMessage({
    group : group_id,
    user : user_id,
    message : getFilePath(req.files.image),
    type : "IMAGE"
   })

   group_message.save()
 .then(async () => {
    const data = await group_message.populate("user");
    io.sockets.in(group_id).emit("message" , data);
    io.sockets.in(`${group_id}_notify`).emit("message_notify" , data);

    res.status(201).send({});
   })
   .catch(error => res.status(500).send({message : `${error} : An error in Server Side`}))
}

async function getAll(req , res) {
    const { group_id } = req.params;

    try {
        const message = await GroupMessage.find({ group : group_id})
        .sort({ created_at : 1})
        .populate("user");

        const total = await GroupMessage.find({ group : group_id }).countDocuments();

        res.status(200).send({message , total});

    } catch (error) {
        res.status(500).send({message : `${error} : An error in Server Side`})
    }
}

async function getTotalMessage(req , res) {
    const { group_id } = req.params;

    try {
        const total = await GroupMessage.find({ group : group_id }).countDocuments();
        res.status(200).send(JSON.stringify(total))
    } catch (error) {
        res.status(500).send({message : `${error} : An error in Server Side`})
    }
}

async function getLastMessageGroup(req , res) {
    const { group_id } = req.params;

    try {
        const response = await GroupMessage.findOne({ group : group_id})
        .sort({ createdAt : -1})
        .populate("user");

        res.status(200).send(response || {})
    } catch (error) {
        res.status(500).send({message : `${error} : An error in Server Side`})
    }
}

export const GroupMessageController = {
       sendText,
       sendImage,
       getAll,
       getTotalMessage,
       getLastMessageGroup

}
