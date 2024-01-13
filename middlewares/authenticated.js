import { jwt } from "../utils/jwt.js";

function asureAuth( req , res , next ) {
   if (!req.headers.authorization) {
    return res.status(403).send({message : "The request of Headers Authentication are not correctly validated"})
   }
   const token = req.headers.authorization.replace("Bearer " , "");

   try {

    const hasExpired = jwt.hasExpiredToken(token);

    if (hasExpired) {
        return res.status(400).send({message : "Token Expired"})
    }


   const payload = jwt.decoded(token);
   
   req.user = payload;

   next();
    
   } catch (error) {
     return res.status(400).send({message : `${error} Invalid Token`})
   }

}

export const mdAuth = {
    asureAuth,
}
