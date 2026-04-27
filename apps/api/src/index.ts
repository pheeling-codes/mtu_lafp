import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from '@mtu/database';

interface HealthResponse {
  status: string;
  service: string;
  database?: string;
  timestamp?: string;
  error?: string;
}

const app = express();
const port = process.env.PORT || 4001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req: Request, res: Response<HealthResponse>) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'MTU LAFP API',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'MTU LAFP API',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Example: Get all items
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        category: true,
        location: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch items' });
  }
});

// Example: Create item
app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const { type, title, description_public, description_private, categoryId, locationId, reporterId, dateLostOrFound } = req.body;
    const item = await prisma.item.create({
      data: {
        type,
        title,
        description_public,
        description_private,
        categoryId,
        locationId,
        reporterId,
        dateLostOrFound: dateLostOrFound ? new Date(dateLostOrFound) : null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create item' });
  }
});

app.listen(port, () => {
  console.log(`[server]: API running on http://localhost:${port}`);
  console.log(`[server]: Health check at http://localhost:${port}/health`);
});
