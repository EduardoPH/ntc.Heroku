

import db from '../db.js';
import { Router} from 'express'
import enviarEmail from '../email.js'

const app = Router();



app.post("/cadastrar", async (req, resp) => {
    try {
      let {nome, email, senha, telefone, cpf} = req.body;

      if (nome.replace(/( )+/g, '') == "" || nome.length < 4)
        return resp.send({ erro: "O nome deve ser maior que 4 Digitos" });
  
      if (telefone.length === 11  || telefone.replace(/( )+/g, '') == "" || isNaN(telefone))
        return resp.send({ erro: "o telefone deve ser valido" });
  
      let regexEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
      if (regexEmail.test(email) === false)
        return resp.send({ erro: "O E-mail deve ser valido" });
  
      if (senha.length <= 4)
        return resp.send({ erro: "A senha deve Maior que 4 digitos" });
      
      
  
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
    
    let regexEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regexEmail.test(email) === false)
        return resp.send({ erro: "O E-mail deve ser valido" });

    let valido = await db.infoc_ntc_usuario.findOne({
      where: { ds_email: email, ds_senha: senha },
      attributes:[
        ['id_usuario', 'idUsu'],
        ["nm_usuario", "nome"],
        ["ds_email", "email"],
        ["ds_telefone", "telefone"],
        ["ds_cpf", "cpf"],
      ]
    });

    if (!valido)
      return resp.send({erro: "Credenciais invalidas"})
    
    resp.send(valido);
  } catch (e) {
    resp.send(e.toString());
  }
})

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.post("/recuperacao", async (req, resp) => {
  try {
    let { email } = req.body
    const usuaria = await db.infoc_ntc_usuario.findOne({
      where: { ds_email: email },
    });

    if (!usuaria) return resp.send({ erro: "E-mail Inválido" });

    let numero = numeroAleatorio(1000, 9999);

    await db.infoc_ntc_usuario.update(
      {
        ds_senha_rec: numero,
      },
      {
        where: { id_usuario: usuaria.id_usuario },
      }
    );

    enviarEmail(
      usuaria.ds_email,
      "Recuperação de Senha",
      `
        <h3> Recuperação de Senha </h3>
        <p> Você solicitou a recuperação de senha da sua conta. </p>
        <p> Entre com o código <b>${numero}</b> para prosseguir com a recuperação.
        `
    );

    resp.sendStatus(200);
  } catch (e) {
    resp.send(e.toString());
  }
});

app.post("/validarCodigo", async (req, resp) => {
  const usuaria = await db.infoc_ntc_usuario.findOne({
    where: {
      ds_email: req.body.email,
    },
  });

  if (!usuaria) {
    resp.send({ status: "erro", mensagem: "E-mail inválido." });
  }

  if (usuaria.ds_senha_rec !== req.body.codigo) {
    resp.send({ status: "erro", mensagem: "Código inválido." });
  }

  resp.send({ status: "ok", mensagem: "Código validado." });
});

app.put("/novaSenha", async (req, resp) => {
  const usuaria = await db.infoc_ntc_usuario.findOne({
    where: { ds_email: req.body.email },
  });

  if (!usuaria) {
    resp.send({ erro: "E-mail inválido." });
  }

  if (usuaria.ds_senha_rec !== req.body.codigo || usuaria.ds_senha_rec === "") {
    resp.send({ erro: "Código inválido." });
  }

  await db.infoc_ntc_usuario.update(
    {
      ds_senha: req.body.novaSenha,
      ds_senha_rec: "",
    },
    {
      where: { id_usuario: usuaria.id_usuario },
    }
  );

  resp.send("Senha alterada com sucesso.");
});








export default app














