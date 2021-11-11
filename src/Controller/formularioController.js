import db from '../db.js'
import cors from "cors";
import  Router  from 'express'
const app = Router();

app.post('/', async (req, resp) => {

    try {
        let { dados } = req.body;
    
        let cadastrados = await db.infoc_ntc_denuncia.findOne({
            where: {'ds_depoimento': dados.depoimento}
        })

        if(cadastrados !== null)
            return resp.send({erro: "Já cadastrada"})

        let usuario = dados.usu
        let caracteristicas = dados.caracteristicas
        let vestimentas = dados.vestimenta
        let local = dados.local

        const vestimentasCriada = await db.infoc_ntc_vestimento.create({
            ds_inferior: vestimentas.parteBaixo,
            ds_superior: vestimentas.parteCima,
            ds_calcado: vestimentas.calcado,
            ds_complemento: vestimentas.complemento
        })

        const caracteristicasCriada = await db.infoc_ntc_caracteristica_fisica.create({
            ds_pele: caracteristicas.pele,
            ds_cabelo: caracteristicas.cabelo,
            ds_cor_cabelo: caracteristicas.corCabelo,
            ds_complemento: caracteristicas.complemento
        })

        const localCriada = await db.infoc_ntc_local.create({
            ds_latitude: local.lat,
            ds_longitude: local.lgn,
            ds_bairro: local.bairro,
            ds_cidade: local.cidade
        })

        const denunciaCriada = await db.infoc_ntc_denuncia.create({
            id_usuario: usuario,
            ds_depoimento: dados.depoimento,
            dt_cadastro: new Date(),
            id_local: localCriada.id_local,
            bt_ativo: false,
            id_fisico: caracteristicasCriada.id_fisico,
            id_vestimento: vestimentasCriada.id_vestimento
        })

        resp.send({mensagem: 'Denúncia cadastrada'})
    } catch (e) {
        resp.send({erro: 'Houve um erro durante o cadastro, todos os campos devem ser preenchidos!'})
    }
})
app.put('/', async (req, resp) => {

    try {
        let { dados } = req.body;

        let usuario = dados.usu
        let caracteristicas = dados.caracteristicas
        let vestimenta = dados.vestimenta
        let local = dados.local

        const vestimentaUpdate = await db.infoc_ntc_vestimento.update({
            'ds_inferior': vestimenta.parteBaixo,
            'ds_superior': vestimenta.parteCima,
            'ds_calcado': vestimenta.calcado,
            'ds_complemento': vestimenta.complemento
        },{
            where: {'id_vestimento': vestimenta.id}
        })

        const caracteristicasUpdate = await db.infoc_ntc_caracteristica_fisica.update({
            'ds_pele': caracteristicas.pele,
            'ds_cabelo': caracteristicas.cabelo,
            'ds_cor_cabelo': caracteristicas.corCabelo,
            'ds_complemento': caracteristicas.complemento
        },{
            where: {'id_fisico': caracteristicas.id}
        })

        const localUpdate = await db.infoc_ntc_local.update({
            'ds_latitude': local.lat,
            'ds_longitude': local.lgn,
            'ds_bairro': local.bairro,
            'ds_cidade': local.cidade
        },{
            where: {'id_local': local.id}
        })

        const denunciaUpdate = await db.infoc_ntc_denuncia.update({
            'id_usuario': usuario,
            'ds_depoimento': dados.depoimento,
            'dt_cadastro': new Date(),
            'id_local': localUpdate.id_local,
            'bt_ativo': false,
            'id_fisico': caracteristicasUpdate.id_fisico,
            'id_vestimento': vestimentaUpdate.id_vestimento
        }, {
            where: {'id_denuncia': dados.id }
        })
        resp.send({mensagem: 'Denúncia Alterada'})
    } catch (e) {
        resp.send({erro: 'Todos os campos devem ser preenchidos'})
    }
})

export default app
