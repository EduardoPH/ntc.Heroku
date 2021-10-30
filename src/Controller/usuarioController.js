

import db from '../db.js';
import { Router} from 'express'


const app = Router();

app.post("/cadastrar", async (req, resp) => {
    try {
      let {nome, telefone, email, cpf, senha} = req.body;
  
      if (nome.replace(/( )+/g, '') == "" || nome.length < 4)
        return resp.send({ erro: "O nome deve ser maior que 4 Digitos" });
       
  
      if (telefone.length === 11 === false || telefone.length === '' || (telefone) === false)
        return resp.send({ erro: "o telefone deve ser valido" });
  
      let regexEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
      if (regexEmail.test(email) === false)
        return resp.send({ erro: "O E-mail deve ser valido" });
  
      if (senha.length >= 4 === false)
        return resp.send({ erro: "A senha deve Maior que 4 digitos" });
  
      if (isNaN(cpf))
        return resp.send({ erro: "o CPF deve ser valido" });
  
      let r = await db.infoc_ntc_usuario.create({
        nm_usuario: nome,
        ds_email: email,
        ds_senha: senha,
        ds_cpf: cpf,
        ds_telefone: telefone,
      });
      resp.send(r);
    } catch (e) {
      resp.send(e.toString());
    }
  });


  app.post("/login", async (req, resp) => {
    try {
      let { email, senha } = req.body;
  
      let valido = await db.infoc_ntc_usuario.findOne({
        where: { ds_email: email, ds_senha: senha }
      });

      if (!valido)
      return resp.send({erro: "Credenciais invalidas"})
      

      let regexEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regexEmail.test(email) === false)
      return resp.send({ erro: "O E-mail deve ser valido" });
  
 
      
  
       resp.send(valido);
    } catch (e) {
      resp.send(e.toString());
    }
  })

  export default app














