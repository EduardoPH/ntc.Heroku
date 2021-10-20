import db from './db.js';
import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());
app.use(express.json())

app.post("/login", async(req, resp) =>{

    try{
        let { email , senha } = req.body;

        let valido = await db.infoc_ntc_usuario.findOne({where: {ds_email: email, ds_senha: senha} })
        
        if(!valido)
            return resp.send({erro: "Credenciais Invalidas"})
        else
            return resp.sendStatus("200")
        
    } catch(e){
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








app.post('/usuario', async (req,resp) => {
    try{
        let usu = req.body;

        let a = await db.infoc_ntc_usuario.findOne({where:{nm_usuario: usu.nome }})
        if (a != null)
           return resp.send({erro: 'Usuária já cadastrada'})
    
        let d = await db.infoc_ntc_usuario.create({
            nm_usuario: usu.nome,
            ds_email: usu.email,
            ds_senha: usu.senha,
            ds_cpf: usu.cpf, 
            ds_telefone: usu.telefone
        })
        resp.send(d);
        }catch(e) { resp.send ({erro: 'Ocorreu um erro, a usuária não foi cadastrada'})}

})






app.listen(process.env.PORT,
r => console.log(`API subiu na porta ${process.env.PORT}`))