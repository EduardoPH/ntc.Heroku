
import express from 'express';
import cors from 'cors';

import Administrador from './Controller/admController.js' 
import UsuarioController from "./Controller/usuarioController.js"
import DenunciaController from "./Controller/denunciaController.js"
import GraficoController from "./Controller/graficoController.js"
const server = express();
server.use(cors());
server.use(express.json());


//      EXEMPLO
//server.use('/ROTA', COMPONENTE_IMPORTADO );


server.use('/Administrador', Administrador)
server.use('/Denuncia', DenunciaController)
server.use('/Grafico', GraficoController)
server.use('/usuario', UsuarioController)


server.listen(process.env.PORT, (r) =>
  console.log(`API subiu na porta ${process.env.PORT}`)
);
