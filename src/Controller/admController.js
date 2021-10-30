import db from '../db.js';
import { Router } from 'express';

const app = Router();

function retornoDenuncia() {
    return [
      ['id_denuncia', 'id'],
      ['ds_depoimento', 'depoimento'],
      ['dt_cadastro', 'data'],
      ['bt_ativo', 'ativo']
    ]
}
function fkDenuncia(){
    return[
        {
            model: db.infoc_ntc_usuario,
            as: 'id_usuario_infoc_ntc_usuario',
            attributes:[
                ['nm_usuario', 'nome'], 
                ['ds_email', 'email'], 
                ['ds_telefone', 'telefone'], 
                ['ds_cpf', 'cpf']
                ],
            required: true
        },
        {
            model: db.infoc_ntc_vestimento,
            as:"id_vestimento_infoc_ntc_vestimento",
            attributes:[
                ['ds_inferior', 'partInferior'],
                ['ds_superior', 'partSuperior'],
                ['ds_calcado', 'calcado']
            ],
            required: true
        },
        {
            model: db.infoc_ntc_caracteristica_fisica,
            as:"id_fisico_infoc_ntc_caracteristica_fisica",
            attributes:[
                ['ds_pele', 'pele'],
                ['ds_cabelo', 'cabelo'],
                ['ds_cor_cabelo', 'corCabelo'],
                ['ds_complemento', 'complemento'],
            ],
            required: true
        },
        {
            model: db.infoc_ntc_local,
            as: 'id_local_infoc_ntc_local',
            attributes:[
                ['ds_latitude', 'lat'],
                ['ds_longitude', 'lgn']
            ],
            required: true
        }
    ]
}

app.get('/denuncia', async(req, resp) =>{
    try{
        let denuncias = await db.infoc_ntc_denuncia.findAll({ 
            
            attributes: retornoDenuncia(),
            include:fkDenuncia(),
            where:{
                'bt_ativo': false
            },
            order: [
                'id_denuncia'
            ],
            limit:1
        })
        resp.send(denuncias)
    } catch(e){
        resp.send({erro: 'Não foi possível listar as Denuncias'})
    }
})

app.put('/denuncia/:id', async(req, resp) => {
    try {
        let { id } = req.params
        let { depoimento } = req.body
        let denuncia = await db.infoc_ntc_denuncia.update(
            {
                ds_depoimento: depoimento,
                bt_ativo: true
            },
            { where: { id_denuncia: id } }
        )
        if(denuncia === 1 )
            return resp.send({retorno: 'Validada com sucesso'})
        else
            return resp.send({retorno: 'Houve um erro na Validação'})
    } catch (e) {
        resp.send({erro: 'Não foi possivel cadastrar a denuncia'})
    }
})

app.delete('/denuncia/:id', async(req, resp) =>{
    let { id } = req.params

    let denuncia = await db.infoc_ntc_denuncia.destroy({
        where: {'id_denuncia': id}
    })

    if( denuncia !== 'OK')
        return resp.send({erro: 'Houve um erro ao excluir'})

    resp.sendStatus(200)
})



export default app;