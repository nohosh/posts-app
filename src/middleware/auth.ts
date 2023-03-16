import { defaultMaxListeners } from 'events';
import jwt from 'jsonwebtoken';

const verifyToken = (req, res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if(!token){
        return res.status(403).send('A token is required')
    }
    const key = process.env.TOKEN_KEY;
    if(key){        
        try{
            const decoded = jwt.verify(token, key);
            req.user = decoded;        
        }
        catch(err){
            return res.status(401).send("invalid token")
        }
        return next();
    }
};
export default verifyToken;