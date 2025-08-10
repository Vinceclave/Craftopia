import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import groqRoutes from '../src/routes/craft.route'
import imageRoutes from '../src/routes/image.route'
import authRoutes  from '../src/routes/auth.routes'
import userRoutes  from '../src/routes/user.routes'
import adminRoutes  from '../src/routes/admin.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // parses application/json
app.use(express.urlencoded({ extended: true })); // parses form data (optional)


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use('/api/groq', groqRoutes);
app.use('/api/images', imageRoutes);
// Public auth endpoints (both mobile and admin use same login/register endpoints)
app.use("/auth", authRoutes);

// Mobile user endpoints (React Native)
app.use("/user", userRoutes);

// Admin web dashboard endpoints
app.use("/admin", adminRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
