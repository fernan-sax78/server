import { Chat , ChatMessage } from "../models/index.js";

async function create(req , res) {
    const {participant_id_one ,participant_id_two } = req.body;
    
    const foundOne = await Chat.findOne({
        participant_one : participant_id_one,
        participant_two : participant_id_two,
    })


    const foundTwo = await Chat.findOne({
        participant_one : participant_id_two,
        participant_two : participant_id_one,
    })

    if (foundOne || foundTwo ) {
        res.status(200).send({message : 'You\'ve got already a chat with this user...'});
        return;
    }

    const chat = new Chat({
        participant_one : participant_id_one,
        participant_two : participant_id_two,
    })

    chat.save()
    .then( chatStorage => {
       res.status(201).send(chatStorage)
        })
    .catch(error => res.status(400).send({message : `${error} Error in Chat`}))
    
  

    
}

async function getAll(req , res) {
    const { user_id } = req.user;

    Chat.find({
        $or : [{participant_one : user_id} , {participant_two : user_id}],
    })
    .populate('participant_one')
    .populate('participant_two')
    .exec()
    .then(async chats => {
        const arrayChats = [];
        for ( const chat of chats){
            const response = await ChatMessage.findOne({ chat : chat._id}).sort({ createdAt : -1})
            arrayChats.push({
                ...chat._doc,
                last_message_date : response?.createdAt || null ,
            })
        }
        res.status(200).send(arrayChats)
        
    })
    .catch(error =>  res.status(400).send({message : `${error} : An Error when we try get the chats`}))
}

async function deleteChat(req , res) {
    const chat_id = req.params.id;
    
    Chat.findByIdAndDelete(chat_id)
    .then(() => res.status(200).send({message : 'Chat Deleted'}))
    .catch(error => res.status(400).send({message : `${error} : The Chat have some problems when try delete it`}))
}

async function getChat(req , res) {
    const chat_id = req.params.id;

    Chat.findById(chat_id)
    .populate('participant_one')
    .populate('participant_two')
    .then(chatStorage => res.status(200).send(chatStorage))
    .catch(error => res.status(400).send({message : `${error} : Error trying get chat`}))
}

export const ChatController = {
    create,
    getAll,
    deleteChat,
    getChat
}