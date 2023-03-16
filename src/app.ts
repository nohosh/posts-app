import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ppid } from 'process';
import auth from './middleware/auth';

require('dotenv').config();
const app = express();
app.use(morgan('dev'));
const db = new PrismaClient({log:['error', 'warn', 'info', 'query']});
app.use(bodyParser.json());



const seedValues = async () =>{
    if((await db.user.count())===0){
        await db.user.createMany({data:[{
            name: 'test',
            email: 'test',
            password: '123'
        }]})
    };
};
seedValues();



//REGISTER
app.post('/register', async (req, res)=>{
    
    const {name, email, password} = req.body;    
    if(!(email && password && name)){
        res.status(400).send('All inputs are required');
    }
    
    const userExist = await db.user.findFirst({where:{email:email}})    
    if(userExist){
        res.status(409).send('User already exist');
    }else{
        const encrypt = await bcrypt.hash(password, 10)
        await db.user.create({data:{name, email, password: encrypt}});
        const entry = db.user.findFirst({where:{email}});
        entry.then(user=>res.send(user).status(200))
    }
})



//LOGIN
app.post('/login',async (req, res) => {
    const {email, password} = req.body;
    if(!email && !password){
        res.status(400).send('All input is required')
    }
    await db.user.findFirst({where:{email:email}}).then(findUser=>{
        const isMatch = bcrypt.compare(password, findUser?.password);
                
        if(isMatch){
            const str = process.env.TOKEN_KEY;   
            console.log(process.env.TOKEN_KEY);    
            if(str){
                const token = jwt.sign({
                    user_id: findUser?.id,
                    email: findUser?.email
                },str,{expiresIn: "2h"});
                
                res.status(200).send(token);
            }
        }else{
            res.status(403).send('invalid credentials')
        }
    }).catch(()=>res.status(403).send('INVALID credentials'));
   
})

//POSTS

//add
app.post('/posts',auth, async (req, res)=>{    
    const {title, content} = req.body;
    db.post.create({data:{
        authorId: req.user.user_id,
        title,
        content
    }}).then(entry=>res.status(200).send(entry));
})



//delete:i
app.delete('/posts/:id', auth, async (req, res)=>{
    const id = Number(req.params.id)
    db.post.delete({where:{id}}).then(post=>res.json(post).status(200));
})
//put:i
app.put('/posts/:id', auth, async (req,res)=>{
    const id = Number(req.params.id);
    const {title, content} = req.body;
    await db.post.findFirst({where: {id}}).then(post=>{
        db.post.update({where:{id}, data:{...post, title, content}}).then(entry=>res.status(200).send(entry))
    }).catch(()=>res.status(404).send('Not found'))
})

//get
app.get('/posts', auth,async (req, res) => {    
    const posts = await db.post.findMany();
    res.json(posts).status(201);    
})


app.get('/',async (req, res) => {    
    const posts = await db.user.findMany();
    const posstt = await db.post.findMany();
    console.log('posstt',posstt)
    res.json(posts).status(200);    
})

//get:i
app.get('/posts/:id', auth,async (req, res) => {
    const id = Number(req.params.id);
    const posts = await db.post.findMany({where:{id}});
    res.json(posts).status(200);
});



export default app;