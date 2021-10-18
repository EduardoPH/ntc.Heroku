import db from './db.js';
import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());
app.use(express.json())




app.get("/administradores", async (req,resp) => {
    try{
        let adm = await db.infoc_ntc_administrador.findAll ({order: [["id_administrador", "desc"]]})
        resp.send(adm)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})



app.get("/apoio", async (req,resp) => {
    try{
        let apoio = await db.infoc_ntc_apoio_frase.findAll ({order: [["id_frase", "desc"]]}) 
        resp.send(apoio)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})



















app.listen(process.env.PORT,
r => console.log(`API subiu na porta ${process.env.PORT}`))