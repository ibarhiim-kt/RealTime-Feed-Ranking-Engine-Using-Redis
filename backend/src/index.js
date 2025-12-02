import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import magicRoutes from './routes/magic.js';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import sessionRoutes from './routes/session.js';
import passwordRoutes from "./routes/password.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/session', sessionRoutes);
app.use('/magic', magicRoutes);
app.use("/password", passwordRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
