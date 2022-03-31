const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "Customer not found"})
  }

  request.user = user;

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some((user) => user.username === username);

  if (usersAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!"})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } =  request.params;

  const objTodo = user.todos.find(u => u.id === id);

  if (!objTodo) {
    return response.status(404).json({ error: "Todo not find"})
  }

  user.todos.splice(objTodo, 1)

  objTodo.title = title;
  objTodo.deadline = new Date(deadline);
  user.todos.push(objTodo)

  return response.status(200).json(objTodo)
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } =  request.params;

  const objTodo = user.todos.find(u => u.id === id);

  if (!objTodo) {
    return response.status(404).json({ error: "Todo not find"})
  }
  user.todos.splice(objTodo, 1)
  objTodo.done = true;

  user.todos.push(objTodo)

  return response.status(200).json(objTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } =  request.params;

  const objDelete = user.todos.find(u => u.id === id);

  if (!objDelete) {
    return response.status(404).json({ error: "Todo not find"})
  };

  user.todos.splice(objDelete, 1);

  return response.status(204).send();
});

module.exports = app;