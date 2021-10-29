import {Router} from 'express'

const app = Router();



app.get("/", async (req,resp) => {

    try { 
     const data = await db.infoc_ntc_local.findAll({
         group: [ col('infoc_ntc_local.ds_cidade')],
         attributes: [ "ds_cidade",
         [fn('count', "ds_cidade" ), 'qtd']
     ]
     });
     resp.send(data);
     } catch(e){
       resp.send(e.toString())
     }
  })
   
  
  
  
  app.get("/", async (req,resp) => {
  
      try{
            const data = await db.infoc_ntc_local.findAll({
           group: [ col('infoc_ntc_local.ds_bairro')],
           attributes: [ "ds_bairro",
           [fn('count', "ds_bairro" ), 'qtd']
       ]
       });
       resp.send(data);
       } catch(e){
         resp.send(e.toString())
       }
    })



    export default app;
  
  
  
  
    app.get("/", async (req,resp) => {
  
      try{
          const data = await db.infoc_ntc_denuncia.findAll({
              group:[
                [fn('date_format',col('dt_cadastro'), '%m')]
              ],
              attributes: [
                [fn('date_format',col('dt_cadastro'), '%m'), 'mes'],
                [fn('count', 'dt_cadastro'), 'qtd']
              ]
          })
  
          resp.send(data);
      } catch(e){
        resp.send(e.toString())
      }
    })
  
  