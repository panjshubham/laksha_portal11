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
  const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`ℹ️ Backend server is already running and active on port ${env.PORT}. Ready for requests.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
