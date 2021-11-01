import db from '../db.js'

import { Router } from 'express'
const app = Router();

app.post('/form', async (req, resp) => {

    try {
        const { tipoVestimenta, inferior, superior, calcado, complementoV,
                pele, cabelo, corCabelo, complementoC,
                latitude, longitude, bairro, cidade,
                idusu, depoimento, } = req.body;

        const vestimentasCriada = await db.infoc_ntc_vestimento.create({
            tp_vestimento: tipoVestimenta,
            ds_inferior: inferior,
            ds_superior: superior,
            ds_calcado: calcado,
            ds_complemento: complementoV
        })

        const caracteristicasCriada = await db.infoc_ntc_caracteristica_fisica.create({
            ds_pele: pele,
            ds_cabelo: cabelo,
            ds_cor_cabelo: corCabelo,
            ds_complemento: complementoC
        })

        const localCriada = await db.infoc_ntc_local.create({
            ds_latitude: latitude,
            ds_longitude: longitude,
            ds_bairro: bairro,
            ds_cidade: cidade
        })

        const denunciaCriada = await db.infoc_ntc_denuncia.create({
            id_usuario: idusu,
            ds_depoimento: depoimento,
            dt_cadastro: new Date(),
            id_local: localCriada.id_local,
            bt_ativo: false,
            id_fisico: caracteristicasCriada.id_fisico,
            id_vestimento: vestimentasCriada.id_vestimento
        })
        resp.send({mensagem: 'Denuncia cadastrada'})
    } catch (e) {
        resp.send({mensagem: 'Para cadastrar uma denúncia todos os campos exceto o complemento devem ser preenchidos'})
    }
})

export default app