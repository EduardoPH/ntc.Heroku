

import db from '../db.js';
import { Router} from 'express'


const app = Router();

app.post("/cadastrar", async (req, resp) => {
    try {
      let usu = req.body;
  
      if (usu.nome === '' || usu.nome >= 4 === false)
        return resp.send({ erro: "O nome deve ser maior que 4 Digitos" });
        console.log(usu)
  
      if (usu.telefone >= 11 === false || usu.telefone === '' || isNumber(usu.telefone) === false)
        return resp.send({ erro: "o telefone deve ser valido" });
  
      let regexEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
      if (regexEmail.test(usu.email) === false)
        return resp.send({ erro: "O E-mail deve ser valido" });
  
      if (usu.senha.length >= 4 === false && !usu.senha)
        return resp.send({ erro: "A senha deve Maior que 4 digitos" });
  
      if (usu.cpf.length >= 9 === false && !usu.cpf)
        return resp.send({ erro: "o CPF deve ser valido" });
  
      let r = await db.infoc_ntc_usuario.create({
        nm_usuario: usu.nome,
        ds_email: usu.email,
        ds_senha: usu.senha,
        ds_cpf: usu.cpf,
        ds_telefone: usu.telefone,
      });
      resp.send(r);
    } catch (e) {
      resp.send(e.toString());
    }
  });

  export default app














