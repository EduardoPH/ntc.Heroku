import db from '../db.js'

import Router  from 'express'
const app = Router();

function DenunFilter() {
  return [
    {
      model: db.infoc_ntc_usuario,
      as: "id_usuario_infoc_ntc_usuario",
      attributes: [
        ['nm_usuario', 'nome'],
        ['id_usuario', 'id']
      ]
    },
    {
      model: db.infoc_ntc_vestimento,
      as: "vestimento",
      attributes: [
        ["ds_inferior", "partInferior"],
        ["ds_superior", "partSuperior"],
        ["ds_calcado", "calcado"],
        ['ds_complemento', 'complemento']
      ],
      required: true,
    },
    {
      model: db.infoc_ntc_caracteristica_fisica,
      as: "id_fisico_infoc_ntc_caracteristica_fisica",
      attributes: [
        ["ds_pele", "pele"],
        ["ds_cabelo", "cabelo"],
        ["ds_cor_cabelo", "corCabelo"],
        ["ds_complemento", "complemento"],
      ],
      required: true,
    },
    {
      model: db.infoc_ntc_local,
      as: "id_local_infoc_ntc_local",
      attributes: [
        ["ds_latitude", "lat"],
        ["ds_longitude", "lgn"],
      ],
      required: true,
    },
  ];
}

app.get('/', async (req, resp) => {
  try{
    let value = await db.infoc_ntc_denuncia.findAll({
      include: DenunFilter(),
      attributes: [
        ['ds_depoimento', 'depoimento'],
        ['bt_ativo', 'ativo'],
        ['id_denuncia', 'id']
      ],
      order: [["id_denuncia", "desc"]]
    })
    resp.send(value)
  } catch (e) {
    resp.send({erro: 'Ocorreu um erro!'})
  }
})

export default app