import { User } from "../models/index.js";
import bscrypt from 'bcryptjs';
import { jwt } from "../utils/jwt.js";

function register(req , res) {
    const { email , password } = req.body;
    

    const user = new User({
        email : email.toLowerCase(),
    });

    const salt = bscrypt.genSaltSync(10);
    const hashPassword = bscrypt.hashSync( password , salt );
    user.password = hashPassword;

    user.save(user)
    .then(() => { res.status(201).send( user ) })
    .catch(() => {res.status(400).send({message : "There Some Errors when the User is trying to Register"})} )
               
}

function login(req , res) {
   const { email , password } = req.body;

   const emailLowerCase = email.toLowerCase();

   User.findOne({email : emailLowerCase})
   .then((userStorage) => {
    bscrypt.compare(password , userStorage.password , ( _ , check) => {
        if (!check) {
        res.status(400).send({message : "The Password is Incorrect"}) 
        }
        else
        {
        res.status(200).send({
            access : jwt.createAccessToken(userStorage),
            refresh : jwt.createRefreshToken(userStorage),
        })
        }
    })

   })
   .catch((error) => {
         res.status(500).send({message : `${error} Server Error...`})
   })
}  

function refreshAccesToken(req , res) {
    const { refreshToken } = req.body;

    if(!refreshToken) res.status(400).send({message : "Token Required"});

   const hasExpired =  jwt.hasExpiredToken(refreshToken);

   if (hasExpired) res.status(400).send({message : "Token is Expired"});

   const { user_id } = jwt.decoded(refreshToken);
   
   console.log(user_id);

   User.findById(user_id)
   .then((userStorage) => {
      res.status(200).send({
        accessToken : jwt.createAccessToken(userStorage)
      })
   })
   .catch((error) => res.status(500).send({ msh : `${error} : This is an Error in Server Side`}))
   
    
}

export const AuthController = {
    register,
    login,
    refreshAccesToken,
};