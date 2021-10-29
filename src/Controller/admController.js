import db from '../db.js';
import { Router } from 'express';

const app = Router();


app.get('/denuncia', async(req, resp) =>{
    try{
        let denuncias = await db.infoc_ntc_denuncia.findAll({ 
            where:{
                'bt_ativo': false
            }
        })
        resp.send(denuncias)
    } catch(e){
        resp.send({erro: 'Não foi possível listar as Denuncias'})
    }
})

app.put('/denuncia/:id', async(req, resp) => {
    try {
        let { id } = req.params
        let denuncia = await db.infoc_ntc_denuncia.update(
            {
                ds_depoimento: denuncia.ds_depoimento,
                bt_ativo: true
            },
            { where: { id_denuncia: id } }
        )
    } catch (e) {
        resp.send({erro: 'Não foi possivel cadastrar a denuncia'})
    }
})


export default app;