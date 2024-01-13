import { User , Group } from "../models/index.js";
import { getFilePath } from "../utils/index.js";
 
async function getMe(req , res) {
    const { user_id } = req.user;

try {
        const response = await User.findById(user_id).select(["-password"]);
    
    if (!response) {
        
        res.status(400).send({message : "The User doesn't be find"})

    }else{

        res.status(200).send(response);
    }
} catch (error) {

    res.status(500).send({message : `${error} Error in Server Side`});
}

}


async function getUsers(req , res)  {
    try {
        const { user_id } = req.user;
        const users = await User.find({ _id : { $ne : user_id} }).select(["-password"]);
        if (!users) {
            res.status(400).send({message : "Users are not Funded"});
        }else{
            res.status(200).send(users);
        }
    } catch (error) {
        res.status(500).send({message : `${error} : Error in server Side...`});
    }
}

async function getUser(req , res) {
    const { id } = req.params;
   
    try {
        const response = await User.findById(id).select(["-password"]);
        if (!response) {
            res.status(400).send({message : "User don't funded"});
        }else{
            res.status(200).send(response);
        }
    } catch (error) {
        res.status(500).send({ message : `${error} : Error in Server Side`});
    }

 
}

function updateUser(req , res) {
    const { user_id } = req.user;
    const  userData = req.body;

    if (req.files.avatar) {
        const imagePath = getFilePath(req.files.avatar);
        userData.avatar = imagePath;
    }

 
    User.findByIdAndUpdate({_id : user_id}, userData)
    .then(() => res.status(200).send(userData))
    .catch(error => res.status(500).send({message : `${error} : Error in Server Side`}))
    
    


};

async function getUserExceptParticipantsGroup(req , res) {
    const { group_id } = req.params;

    const group = await Group.findById( group_id );
    const participantsToString = group.participants.toString();
    const participants = participantsToString.split(",");
    const response = await User.find({ _id : { $nin : participants }}).select(["-password"]);

    if (!response) {
         res.status(400).send({message : "No found an User here"});
    }else{
          res.status(200).send(response);
    }
   
}

export const UserController = {
    getMe,
    getUsers,
    getUser,
    updateUser,
    getUserExceptParticipantsGroup,
};