import db from '../db.js'

import { Router } from 'express'
const app = Router();

app.get('/', async (req, resp) => {
  try{
    let value = await db.infoc_ntc_denuncia.findAll({
      attributes: getDenun
    })

    resp.send(value)
  } catch (e) {
    resp.send({erro: 'Ocorreu um erro'})
  }
})

function getDenun(){
  return[
    ['id_denuncia', 'id'],
    ['ds_depoimento', 'msg'],
    ['dt_cadastro']
  ]
}

export default app