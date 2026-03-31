
/**
 * Express.js backend templates for generated projects.
 */

export function getBackendPackageJson(projectName = "my-website-backend") {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, "-") + "-backend",
    version: "1.0.0",
    type: "module",
    scripts: {
      start: "node server.js",
      dev: "node --watch server.js",
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      dotenv: "^16.3.1",
    },
  }, null, 2);
}

export function getServerJS(routes = []) {
  const routeImports = routes
    .map((r) => `import ${r.name}Router from './routes/${r.name}.js';`)
    .join("\n");

  const routeUses = routes
    .map((r) => `app.use('/api/${r.path}', ${r.name}Router);`)
    .join("\n  ");

  return `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
${routeImports}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
  ${routeUses}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`;
}

export function getContactRoute() {
  return `import express from 'express';
const router = express.Router();

// In-memory store (replace with database in production)
const submissions = [];

// POST /api/contact
router.post('/', (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const submission = {
      id: Date.now().toString(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    submissions.push(submission);
    console.log('New contact submission:', submission);

    res.status(201).json({ success: true, message: 'Message received!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// GET /api/contact
router.get('/', (req, res) => {
  res.json({ submissions });
});

export default router;
`;
}

export function getNewsletterRoute() {
  return `import express from 'express';
const router = express.Router();

const subscribers = [];

// POST /api/newsletter
router.post('/', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (subscribers.find(s => s.email === email)) {
      return res.status(409).json({ error: 'Already subscribed' });
    }

    subscribers.push({
      id: Date.now().toString(),
      email,
      subscribedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
`;
}

export function getEnvFile() {
  return `PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
`;
}
