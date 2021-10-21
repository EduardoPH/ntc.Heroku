import db from './db.js';
import express from 'express'
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

        if(!usu.nome && usu.nome.length <= 4)
            return resp.send({erro: "O nome deve ser maior que 4 Digitos"})

        if(usu.email.indexOf(".") == -1 || usu.email.indexOf("@") == -1)
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

        let valido = await db.infoc_ntc_usuario.findOne({where: {ds_email: email, ds_senha: senha} })
        
        if(!valido)
             return resp.send({erro: "Credenciais Inválidas"})
        else
             return resp.sendStatus(200)
        
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

        let a = await db.infoc_ntc_apoio_frase.findOne({where:{ds_frase: apoio.descricao }})
        if (a != null)
           return resp.send({erro: 'Frase já cadastrada'})
    
        let d = await db.infoc_ntc_apoio_frase.create({
            ds_frase: apoio.descricao
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})

app.post('/caracteristica', async (req,resp) => {
    try{
        let caracteristica= req.body;

        let a = await db.infoc_ntc_caracteristica_fisica.findOne({where:{tp_fisido: caracteristica.descricao }})
        if (a != null)
           return resp.send({erro: 'A caracteristica fisica foi cadastrada ja!'})
    
        let d = await db.infoc_ntc_caracteristica_fisica.create({
            tp_fisido: caracteristica.descricao,
            ds_valor: caracteristica.valor,
            ds_complemento: caracteristica.complemento

        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'ocorreu um erro A caracteristica fisica nao foi cadastrada!'})}
   
})

app.post('/denuncia', async (req,resp) => {
    try{
        let denuncia = req.body;

    
        let d = await db.infoc_ntc_denuncia.create({
            ds_depoimento: denuncia.descricao,
            bt_ativo: false
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})


app.post('/local', async (req,resp) => {
    try{
        let local = req.body;

    
        let d = await db.infoc_ntc_local.create({

            ds_latitude: local.latitude,
            ds_logitude: local.logitude,
            ds_bairro: local.bairro
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a frase não foi cadastrada'})}

})

app.listen(process.env.PORT,
r => console.log(`API subiu na porta ${process.env.PORT}`))