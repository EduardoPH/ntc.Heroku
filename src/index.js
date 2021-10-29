
import express, { raw } from "express";
import cors from "cors";
const app = express();
import Sequelize from 'sequelize';
const { Op, col, fn } = Sequelize;
app.use(cors());
app.use(express.json());


//      EXEMPLO
//server.use('/ROTA', COMPONENTE_IMPORTADO );



app.listen(process.env.PORT, (r) =>
  console.log(`API subiu na porta ${process.env.PORT}`)
);
