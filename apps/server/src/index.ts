import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import groqRoutes from './routes/craft.routes';
import imageRoutes from './routes/image.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use('/api/groq', groqRoutes);
app.use('/api/images', imageRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
