import { Router } from "express";
import { prisma } from "../db.js"

const router = Router();

// Get all users
router.get('/users', async (req, res) =>{
    const users = await prisma.user.findMany();
    res.json(users);
})

// Create a new user
router.post('/user', async (req,res)=>{
    const newUser = await prisma.user.create({
        data: req.body,
    })
    res.json(newUser);
})

// Get a user by id
router.get('/users/:id', async (req,res)=>{
    const userFound = await prisma.user.findFirst({
        where:{
            id: parseInt(req.params.id),
        },
    })
    if (!userFound)
        return res.status(404).json({error: "User not found"})

    res.json(userFound);
})

// Delete user
router.delete('/user/:id', async (req,res)=>{
    const userDeleted = await prisma.user.delete({
        where:{
            id: parseInt(req.params.id),
        }
    })
    if (!userDeleted)
        return res.status(404).json({error: "User not found"})
    
    res.json(userDeleted);
})

// Update user
router.put('/user/:id', async (req,res)=>{
    const userUpdated =  await prisma.user.update({
        where:{
            id: parseInt(req.params.id),
        },
        data: req.body,
    })
    if (!userUpdated)
        return res.status(404).json({error: "User not found"})

    return res.json(userUpdated);
})


export default router;