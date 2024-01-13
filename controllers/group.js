import { Group , User , GroupMessage} from "../models/index.js";
import { getFilePath } from "../utils/index.js";

function createGroup(req , res) {
    const { user_id } = req.user;
    const group = new Group(req.body);
    group.creator = user_id;
    group.participants = JSON.parse(req.body.participants);
    group.participants = [...group.participants];

    if (req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    group.save()
    .then(groupStorage => {
        if (!groupStorage) {
          res.status(400).send({message : 'Error in Creating Chat Group'});
        }else{
         res.status(201).send(groupStorage)
        }
        
    })
    .catch(error => res.status(500).send({message : `${error} : Error in Server Side `}));
}

function getAll(req , res) {
    const { user_id } = req.user;

    Group.find({ participants : user_id })
    .populate("creator")
    .populate("participants")
    .then(async groups => {

        const arrayGroups = [];

        for await(const group of groups){
           const response = await GroupMessage.findOne({ group : group._id }).sort({ createdAt : -1});

           arrayGroups.push({
            ...group._doc,
            last_message_date : response?.createdAt || null,
           })
        }

        res.status(200).send(arrayGroups)
    })
    .catch(error => res.status(500).send({message : `${error} : Error in Server Side `}));
}

function getGroup(req , res) {
    const group_id = req.params.id;

    Group.findById(group_id)
    .populate("participants")
    .then(groupStorage => {
        if (!groupStorage) {
            res.status(400).send({message : "Chat Group not Find" })
        }else{
            res.status(200).send(groupStorage)
        }
    })
    .catch(error => res.status(500).send({message : `${error} : Error in Server Side `}));
}

async function updateGroup(req , res) {
    const { id } = req.params;
    const { name }= req.body;

    const group = await Group.findById(id);

    if (name) group.name = name;
    if (req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    Group.findByIdAndUpdate(id , group)
    .then(() => res.status(200).send({ image : group.image , name : group.name}))
    .catch(error => res.status(500).send({message : `${error} : Error in Server Side `}));
}

async function exitGroup(req , res) {
   const { id } = req.params;
   const { user_id} = req.user;

   const group = await Group.findById(id);

   const newParticipant = group.participants.filter(participant => 
    participant.toString() !== user_id
   );

   const newData = {
    ...group._doc,
    participants : newParticipant,
   }
   await Group.findByIdAndUpdate(id , newData);
   res.status(200).send({message : "Now you are exit correctly from this group"})
}

async function addParticipants(req , res){
  const { id } = req.params;
  const { users_id } = req.body;

  const group = await Group.findById( id );
  const users = await User.find({_id : users_id});

  const arrayObjectId = [];
  users.forEach(user => {
    arrayObjectId.push(user._id)
  });

  const newData = {
    ...group._doc ,
    participants : [...group.participants , ...arrayObjectId ],
  }

  await Group.findByIdAndUpdate(id , newData);
  res.status(200).send({message : "The New Participants are add correctly"})
}

async function banParticipant(req , res) {
    const { group_id , user_id } = req.body;

    const group = await Group.findById(group_id);
   
    const newParticipants = group.participants.filter(
        participant => participant.toString() !== user_id
    )
    
    const newData = {
        ...group._doc,
        participants : newParticipants,
    }

    await Group.findByIdAndUpdate(group_id , newData);

    res.status(200).send({message : "Participant is now out..."});
}


export const GroupController = {
     createGroup,
     getAll,
     getGroup,
     updateGroup,
     exitGroup,
     addParticipants,
     banParticipant
}