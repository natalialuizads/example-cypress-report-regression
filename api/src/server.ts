import cors from 'cors';
import express, { Request, Response } from 'express';
import { router as productsRouter } from './routes/products';
import { router as usersRouter } from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Fake API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
    },
  });
});

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/users`);
  console.log(`   - GET  http://localhost:${PORT}/api/users/:id`);
  console.log(`   - POST http://localhost:${PORT}/api/users`);
  console.log(`   - GET  http://localhost:${PORT}/api/products`);
  console.log(`   - GET  http://localhost:${PORT}/api/products/:id`);
});

export default app;
