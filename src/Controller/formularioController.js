import db from '../db.js'
import cors from "cors";
import  Router  from 'express'
const app = Router();

app.post('/', async (req, resp) => {

    try {
        let { dados } = req.body;

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
        let vestimentas = dados.vestimenta
        let local = dados.local

        const vestimentasCriada = await db.infoc_ntc_vestimento.update({
            ds_inferior: vestimentas.parteBaixo,
            ds_superior: vestimentas.parteCima,
            ds_calcado: vestimentas.calcado,
            ds_complemento: vestimentas.complemento
        })

        const caracteristicasCriada = await db.infoc_ntc_caracteristica_fisica.update({
            ds_pele: caracteristicas.pele,
            ds_cabelo: caracteristicas.cabelo,
            ds_cor_cabelo: caracteristicas.corCabelo,
            ds_complemento: caracteristicas.complemento
        })

        const localCriada = await db.infoc_ntc_local.update({
            ds_latitude: local.lat,
            ds_longitude: local.lgn,
            ds_bairro: local.bairro,
            ds_cidade: local.cidade
        })

        const denunciaCriada = await db.infoc_ntc_denuncia.update({
            id_usuario: usuario,
            ds_depoimento: dados.depoimento,
            dt_cadastro: new Date(),
            id_local: localCriada.id_local,
            bt_ativo: false,
            id_fisico: caracteristicasCriada.id_fisico,
            id_vestimento: vestimentasCriada.id_vestimento
        }, {
            where: {'id_denuncia': dados.id,
                    'id_local': dados.id_local,
                    'id_fisico': dados.id_fisico,
                    'id_vestimento': dados.id_vestimento}
        })

        resp.send({mensagem: 'Denúncia cadastrada'})
    } catch (e) {
        resp.send({erro: 'Houve um erro durante o cadastro, todos os campos devem ser preenchidos!'})
    }
})

export default app
