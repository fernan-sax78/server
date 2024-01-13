import { ChatMessage } from "../models/index.js";
import { io , getFilePath } from "../utils/index.js";

function sendText(req , res) {
    const { chat_id , message } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
        chat : chat_id,
        user : user_id,
        message,
        type : "TEXT"
    });

    chat_message.save()
    .then(async () => {
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify" , data);
        res.status(201).send({});
    })
    .catch(error => res.status(500).send({message : `${error} : Error Sending Message in Chat`}));

}

function sendImage(req , res) {
    const { chat_id } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
        chat : chat_id,
        user : user_id,
        message : getFilePath(req.files.image),
        type : "IMAGE" 
    });


    chat_message.save()
    .then(async () => {
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify" , data);
        res.status(201).send({});
    })
    .catch(error => res.status(400).send({message : `${error} : Error sending Image`}))
}

async function getAll(req , res) {
    const { chat_id } = req.params;

    try {
        const messages = await ChatMessage.find({chat : chat_id}).sort({ createdAt : 1 }).populate("user");
        const total = await ChatMessage.find({ chat : chat_id}).countDocuments();
        res.status(200).send( {messages , total} );
    } catch (error) {
        res.status(500).send({message : `${error} : Error in server Side`})
    }

}

async function getTotalMessages(req , res) {
    const { chat_id } = req.params;

    try {
        const totalChat = await ChatMessage.find({ chat : chat_id}).countDocuments();
        res.status(200).send(JSON.stringify(totalChat));
    } catch (error) {
        res.status(500).send({message : `${error} : Error in server Side`})
    }
}

async function getLastMessage( req , res ){
  const { chat_id } = req.params;

  try {
    const lastMessageResponse = await ChatMessage.findOne({chat : chat_id}).sort({ createdAt : -1});
    res.status(200).send(lastMessageResponse || {})
  } catch (error) {
    res.status(500).send({message : `${error} : Error in server Side`})
  }
}

export const ChatMessageController = {
     sendText,
     sendImage,
     getAll,
     getTotalMessages,
     getLastMessage
}