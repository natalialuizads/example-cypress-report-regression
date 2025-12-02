import { Request, Response, Router } from 'express';

export const router = Router();

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// Fake data
const products: Product[] = [
  { id: 1, name: 'Notebook', price: 3500.00, category: 'Electronics', inStock: true },
  { id: 2, name: 'Mouse', price: 50.00, category: 'Accessories', inStock: true },
  { id: 3, name: 'Keyboard', price: 150.00, category: 'Accessories', inStock: false },
  { id: 4, name: 'Monitor', price: 1200.00, category: 'Electronics', inStock: true },
  { id: 5, name: 'Headset', price: 200.00, category: 'Accessories', inStock: true },
];

// GET all products
router.get('/', (req: Request, res: Response) => {
  const { category, inStock } = req.query;
  
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (inStock !== undefined) {
    filtered = filtered.filter(p => p.inStock === (inStock === 'true'));
  }
  
  res.json(filtered);
});

// GET product by ID
router.get('/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});
