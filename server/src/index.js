import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { projectsRouter } from './routes/projects.routes.js';
import { usersRouter } from './routes/users.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start local listener if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

export default app;
