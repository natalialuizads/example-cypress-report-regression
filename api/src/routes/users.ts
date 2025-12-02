import { Request, Response, Router } from 'express';

export const router = Router();

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Fake data
const users: User[] = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'admin' },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'user' },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', role: 'user' },
  { id: 4, name: 'Ana Costa', email: 'ana@example.com', role: 'moderator' },
];

// GET all users
router.get('/', (req: Request, res: Response) => {
  res.json(users);
});

// GET user by ID
router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST create user
router.post('/', (req: Request, res: Response) => {
  const newUser: User = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || 'user',
  };
  users.push(newUser);
  res.status(201).json(newUser);
});
