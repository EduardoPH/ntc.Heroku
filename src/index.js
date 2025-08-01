
import express from 'express';
import cors from 'cors';

import AdministradorController from './Controller/admController.js'
import UsuarioController from "./Controller/usuarioController.js"
import DenunciaController from "./Controller/denunciaController.js"
import GraficoController from "./Controller/graficoController.js"
import ApoioController from './Controller/apoioController.js'
import FormularioController from './Controller/formularioController.js'
const server = express();
server.use(cors());
server.use(express.json());


//      EXEMPLO
//server.use('/ROTA', COMPONENTE_IMPORTADO );


server.use('/Administrador', AdministradorController)
server.use('/Denuncia', DenunciaController)
server.use('/estatisticas', GraficoController)
server.use('/usuario', UsuarioController)
server.use('/apoio', ApoioController)
server.use('/formulario', FormularioController)

server.listen(process.env.PORT || 3030, (r) =>
  console.log(`API subiu na porta ${process.env.PORT || 3030}`)
);

export default server;