
import express from 'express';
import cors from 'cors';

import Denuncia from './Controller/admController.js' 

const server = express();
server.use(cors());
server.use(express.json());


//      EXEMPLO
//server.use('/ROTA', COMPONENTE_IMPORTADO );


server.use('/Administrador', Denuncia)


server.listen(process.env.PORT, (r) =>
  console.log(`API subiu na porta ${process.env.PORT}`)
);
