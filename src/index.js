import db from './db.js';
import express, { raw } from 'express'
import cors from 'cors'
import enviarEmail from './email.js'
const app = express();
app.use(cors());
app.use(express.json())

function numeroAleatorio(min, max){
   return Math.floor(Math.random() * (max - min + 1) ) + min;
} 

app.post('/cadastrar', async (req,resp) => {
    try{
        let usu = req.body;

        let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if(!usu.nome && usu.nome.length <= 4)
            return resp.send({erro: "O nome deve ser maior que 4 Digitos"})

        if(regexEmail.test(usu.email) == false)
            return resp.send({erro: "O E-mail deve ser valido"})

        if(usu.senha.length <= 4 && !usu.senha)
            return resp.send({erro: "A senha deve Maior que 4 digitos"})

        if(usu.cpf.length <= 9 && !usu.cpf)
            return resp.send({erro: "o CPF deve ser valido"})
      
        if(usu.telefone.length <= 8 && !usu.telefone)
            return resp.send({erro: "o telefone deve ser valido"})

            
        let r = await db.infoc_ntc_usuario.create({
            nm_usuario: usu.nome,
            ds_email: usu.email,
            ds_senha: usu.senha,
            ds_cpf: usu.cpf, 
            ds_telefone: usu.telefone
        })
        resp.send(r)

        } catch(e) { 
            resp.send(e.toString())
        }

})

app.post("/login", async(req, resp) =>{
    try{
        let { email , senha } = req.body;

        let valido = await db.infoc_ntc_usuario.findOne({where: {ds_email: email, ds_senha: senha}, raw: true })

        let denuncia = await db.infoc_ntc_denuncia.findAll({where:{id_usuario: valido.id_usuario}, raw: true})

        delete denuncia.bt_ativo;

        delete valido.ds_senha;

        let r = {... valido, denuncia: denuncia}

        if(!valido)
             return resp.send({erro: "Credenciais Inválidas"})
        else
             return resp.send(r)
        
    } catch(e){
        resp.send(e.toString())
    }
})

app.post('/recuperacao', async(req, resp) => {
    try {
        const usuaria = await db.infoc_ntc_usuario.findOne({
            where:{ds_email: req.body.email}
        })
    

        if(!usuaria)
            return resp.send({erro: "E-mail Inválido"})
       
        let numero = numeroAleatorio(1000,9999);
        
        await db.infoc_ntc_usuario.update(
            {
                ds_senha_rec: numero
            } , { 
                where: {id_usuario: usuaria.id_usuario}
            }
        )

        enviarEmail(usuaria.ds_email, 'Recuperação de Senha', `
        <h3> Recuperação de Senha </h3>
        <p> Você solicitou a recuperação de senha da sua conta. </p>
        <p> Entre com o código <b>${numero}</b> para prosseguir com a recuperação.
        `)

        resp.sendStatus(200)

    } catch (e) {
        resp.send(e.toString())
    }
})

app.post('/validarCodigo', async (req, resp) => {
    const usuaria = await db.infoc_ntc_usuario.findOne({
      where: {
        ds_email: req.body.email   
      }
    });
  
    if (!usuaria) {
      resp.send({ status: 'erro', mensagem: 'E-mail inválido.' });
    }
  
    if (usuaria.ds_senha_rec !== req.body.codigo) {
      resp.send({ status: 'erro', mensagem: 'Código inválido.' });
    }
  
    resp.send({ status: 'ok', mensagem: 'Código validado.' });
  
})


app.put('/novaSenha', async (req, resp) => {
    const usuaria = await db.infoc_ntc_usuario.findOne({where: {ds_email: req.body.email}});
  
    if (!usuaria) {
      resp.send({ erro: 'E-mail inválido.' });
    }
  
  
    if (usuaria.ds_senha_rec !== req.body.codigo ||usuaria.ds_senha_rec === '') {
      resp.send({erro: 'Código inválido.'});
    }
  
    await db.infoc_ntc_usuario.update({
      ds_senha: req.body.novaSenha,
      ds_senha_rec: ''
    }, {
      where: { id_usuario: usuaria.id_usuario }
    })
  
    resp.send('Senha alterada com sucesso.');
  })
  




  app.post('/cadastrarDenuncia', async (req,resp) => {
    try{
        let denuncia = req.body;

        let f = await db.infoc_ntc_caracteristica_fisica.create({
            ds_pele: denuncia.pele,
            ds_cabelo: denuncia.cabelo,
            ds_cor_cabelo: denuncia.corCabelo,
            ds_complemento: denuncia.complementoFisico

        })

        let v = await db.infoc_ntc_vestimento.create({
            ds_inferior:denuncia.inferior,
            ds_superior:denuncia.superior,
            ds_calcado:denuncia.calcado,
            ds_complemento:denuncia.complementoVestimento

        })

        let r = await db.infoc_ntc_denuncia.create({
            id_fisico: f.id_fisico,
            id_vestimento: v.id_vestimento,
            ds_depoimento: denuncia.descricao,
            bt_ativo:denuncia.ativo
        })
        resp.send(r);
        } catch(e) { 
            resp.send(e.toString())
        }

})































































app.get("/administradores", async (req,resp) => {
    try{
        let adm = await db.infoc_ntc_administrador.findAll({order: [["id_administrador", "desc"]]})
        resp.send(adm)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})


app.get("/apoio", async (req,resp) => {
    try{
        let apoio = await db.infoc_ntc_apoio_frase.findAll({order: [["id_frase", "desc"]]}) 
        resp.send(apoio)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})


app.get("/caracteristicas", async (req,resp) => {
    try{
        let carac = await db.infoc_ntc_caracteristica_fisica.findAll({order: [["id_fisico", "desc"]]}) 
        resp.send(carac)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})




app.get("/denuncias", async (req,resp) => {
    try{
        let denu = await db.infoc_ntc_denuncia.findAll ({order: [["id_denuncia", "desc"]]}) 
        resp.send(denu)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})





app.get("/local", async (req,resp) => {
    try{
        let local = await db.infoc_ntc_local.findAll ({order: [["id_local", "desc"]]}) 
        resp.send(local)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})





app.get("/usuario", async (req,resp) => {
    try{
        let usuario = await db.infoc_ntc_usuario.findAll({order: [["id_usuario", "desc"]]}) 
        resp.send(usuario)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})




app.get("/vestimento", async (req,resp) => {
    try{
        let vestimenta = await db.infoc_ntc_vestimento.findAll ({order: [["id_vestimento", "desc"]]}) 
        resp.send(vestimenta)
    }

    catch(e){
        resp.send({erro: "Ocorreu um erro"})
    }
})


app.post('/administradores', async (req,resp) => {
    try{
        let adm = req.body;

        let a = await db.infoc_ntc_administrador.findOne({where:{nm_administrador: adm.nome }})
        if (a != null)
           return resp.send({erro: 'Administrador já cadastrado'})
    
        let d = await db.infoc_ntc_administrador.create({
            nm_administrador: adm.nome,
            ds_senha: adm.senha
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, o administrador não foi cadastrado'})}

})





app.post('/apoio', async (req,resp) => {
    try{
        let apoio = req.body;

        let a = await db.infoc_ntc_apoio_frase.findOne({where:{ds_frase: apoio.frase }})
        if (a != null)
           return resp.send({erro: 'Frase já cadastrada'})
    
        let d = await db.infoc_ntc_apoio_frase.create({
            ds_frase: apoio.frase
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})

app.post('/caracteristica', async (req,resp) => {
    try{
        let caracteristica= req.body;

        let a = await db.infoc_ntc_caracteristica_fisica.findOne({where:{ds_pele: caracteristica.pele }})
        if (a != null)
           return resp.send({erro: 'A caracteristica fisica foi cadastrada ja!'})
    
        let d = await db.infoc_ntc_caracteristica_fisica.create({
            ds_pele: caracteristica.pele,
            ds_cabelo: caracteristica.cabelo,
            ds_cor_cabelo: caracteristica.corCabelo,
            ds_complemento: caracteristica.complementoFisico

        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'ocorreu um erro A caracteristica fisica nao foi cadastrada!'})}
   
})



app.post('/local', async (req,resp) => {
    try{
        let local = req.body;

    
        let d = await db.infoc_ntc_local.create({

            ds_latitude: local.latitude,
            ds_longitude: local.longitude,
            ds_bairro: local.bairro
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})



app.post('/vestimento', async (req,resp) => {
    try{
        let vestimenta = req.body;

    
        let v = await db.infoc_ntc_vestimento.create({

            ds_inferior:vestimenta.inferior,
            ds_superior:vestimenta.superior,
            ds_calcado:vestimenta.calcado,
            ds_complemento:denuncia.complementoVestimento
        })
        resp.send(v);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})




app.put('/administradores/:id', async (req,resp) => {
    try {
        let adm = req.params.id;
         let a = req.body;


         let d = await db.infoc_ntc_administrador.update(
             {
                nm_administrador: a.nome,
                ds_senha: a.senha
             },
             {where: {id_administrador: adm}}
             
         ) 
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, o administrador não foi alterado'})}
})




 app.put('/apoio/:id', async (req,resp) => {
    try {
        let apoio = req.params.id;
         let p = req.body;


         let d = await db.infoc_ntc_apoio_frase.update(
             {
                ds_frase: p.frase
             },
             {where: {id_frase:apoio}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi alterado'})}
})



app.put('/caracteristicas/:id', async (req,resp) => {
    try {
        let id = req.params.id;
         let caracteristica = req.body;


         let a = await db.infoc_ntc_caracteristica_fisica.update(
             {
                ds_pele: caracteristica.pele,
                ds_cabelo: caracteristica.cabelo,
                ds_cor_cabelo: caracteristica.corCabelo,
                ds_complemento: caracteristica.complementoFisico
             },
             {where: {id_fisico:id}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi alterado'})}
})


 

app.put('/cadastrarDenuncia/:id', async (req,resp) => {
    try {
        let id = req.params.id;
         let denuncia = req.body;


         let a = await db.infoc_ntc_denuncia.update(
             {
                ds_depoimento: denuncia.descricao,
                bt_ativo: denuncia.ativo
             },
             {where: {id_denuncia:id}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, a denuncia não foi alterada'})}
})
 



app.put('/local/:id', async (req,resp) => {
    try {
        let id = req.params.id;
         let local = req.body;


         let a = await db.infoc_ntc_local.update(
             {
                ds_latitude: local.latitude,
                ds_longitude: local.longitude,
                ds_bairro: local.bairro
             },
             {where: {id_local:id}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, o local não foi alterada'})}
})





app.put('/usuaria/:id', async (req,resp) => {
    try {
        let id = req.params.id;
         let usu = req.body;


         let a = await db.infoc_ntc_usuario.update(
             {
                nm_usuario: usu.usuaria,
                ds_email: usu.email,
                ds_senha: usu.senha,
                ds_cpf: usu.cpf,
                ds_telefone: usu.telefone,
                ds_senha_rec: usu.senhaRe
             },
             {where: {id_usuario:id}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, o local não foi alterada'})}
})
 




app.put('/vestimenta/:id', async (req,resp) => {
    try {
        let id = req.params.id;
         let v = req.body;


         let a = await db.infoc_ntc_vestimento.update(
             {
                ds_inferior:v.inferior,
                ds_superior:v.superior,
                ds_calcado:v.calcado,
                ds_complemento:v.complementoVestimento
             },
             {where: {id_vestimento:id}}
             
         )
         resp.send(200)
    }

    catch(e) { resp.send ({erro: 'Ocorreu um erro, o local não foi alterada'})}
})


//Functions Deletes 


app.delete('/administradores/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_administrador.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_administrador.destroy({where: {id_administrador: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/apoio/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_apoio_frase.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_apoio_frase.destroy({where: {id_frase: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/caracteristicas/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_caracteristica_fisica.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_caracteristica_fisica.destroy({where: {id_fisico: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/denuncias/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_denuncia.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_denuncia.destroy({where: {id_denuncia: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/local/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_local.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_local.destroy({where: {id_local: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/usuario/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_usuario.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_usuario.destroy({where: {id_usuario: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})

app.delete('/vestimento/:id', async (req, resp) => {
    try{
        let id = req.params.id;
        let verif = await db.infoc_ntc_vestimento.findAll()
        if(verif !== null){
            let r = await db.infoc_ntc_vestimento.destroy({where: {id_vestimento: id}})
            resp.sendStatus(200)
        } else {
            resp.send("Não foi possivel excluir o objeto")
        }
    } catch (e){
        resp.send({erro: 'Ocorreu um erro'})
    }
})










app.listen(process.env.PORT,
r => console.log(`API subiu na porta ${process.env.PORT}`))