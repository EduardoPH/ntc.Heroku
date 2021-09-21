import db from './db.js';
import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());
app.use(express.json())


app.listen(process.env.PORT,
r => console.log(`API subiu na porta ${process.env.PORT}`))