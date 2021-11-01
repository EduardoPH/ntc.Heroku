import db from '../db.js'
import Router from 'express'
import Sequelize from 'sequelize';
const { Op, col, fn } = Sequelize;

const app = Router();



  
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







app.get("/Cidades", async (req,resp) => {

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


 
  
  
   
  
    app.get("/qtdMes", async (req,resp) => {
  
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
          
          
          
          
           
          function NomeMes(mes){
           let r = ''
            switch(mes){
                case '01':
                   r =  'JAN'
                break;
    
                case '02':
                  r =  'FEV'
                break;
    
                case '03':
                   r =  'MAR'
                break;
    
                case '04':
                  r =  'ABR'
                break;
    
                case '05':
                  r =  'MAI'
                break;
    
                case '06':
                  r =  'JUN'
                break;
    
                case '07':
                   r = 'JUL'
                break;
    
                case '08':
                 r =  'AGO'
                break;
    
                case '09':
                  r = 'SET'
                break;
    
                case '10':
                   r =  'OUT'
                break;
    
                case '11':
                  r =  'NOV'
                break;
    
                case '12':
                  r = 'DEZ'
                break;
            
            }
           return r
        }
      
        let mes = [
            data.map(i => 
                ({ 
                  mes: NomeMes(i.dataValues.mes),
                  qtd: i.dataValues.qtd
                })
            )
           
        ] 
  
          resp.send(mes);
      } catch(e){
        resp.send(e.toString())
      }
    })
   


    export default app;