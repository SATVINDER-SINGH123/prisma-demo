const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

const app = express();
app.use(bodyParser.json());
// User create API
app.post('/api/users', async (req, res) => {

    if (!req.body.name) {
        return res.status(400).json({status: false, message: 'Name is required', code: 404, data: null});
    }
    if (!req.body.email) {
        return res.status(400).json({status: false,  message: 'Email is required', code: 404, data: null });
    }

    if (!req.body.password) {
        return res.status(400).json({status: false,  message: 'Password is required', code: 404, data: null });
    }

    const { name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt round

    const checkEmail = await prisma.user.findUnique({
        where: { email: email },
    });
    if(checkEmail){
        return res.status(400).json({status: false,  message: 'Email already exist.', code: 404, data: null });
    }
    const user = await prisma.user.create({
        data: {
        name,
        email,
        password: hashedPassword
        },
    });
  return res.status(201).json({status: true, message: 'User create successfully.' , code: 200, data: user});
});

// User get API
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(400).json({status: false,  message: 'User not found.', code: 404, data: null });
  }
  return res.status(200).json({status: true, message: 'Get data successfully.' , code: 200, data: user});
});

// Users get API
app.get('/api/users', async (req, res) => {
const user = await prisma.user.findMany();
    return res.status(200).json({status: true, message: 'Get data successfully.', code: 200, data: user});
});


// User update API
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name } = req.body;
  
    try {
      // Check if the user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!existingUser) {
        return res.status(404).json({status: false, message: 'User not found', code: 404, data: null });
      }
  
      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || existingUser.name,
        },
      });
  
      res.json({status: true, message: 'User updated successfully', code: 200, data: updatedUser });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// User delete API

app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        });

        if (!existingUser) {
        return res.status(404).json({status: false, message: 'User not found', code: 404, data: null });
        }

        // Delete the user
        await prisma.user.delete({
        where: { id: userId },
        });

        res.json({status: true, message: 'User deleted successfully', code: 200, data: {} });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
