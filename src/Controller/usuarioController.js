import crypto from 'crypto-js'

import db from '../db.js';
import Router from 'express'
import enviarEmail from '../email.js'

const app = Router();



app.post("/cadastrar", async (req, resp) => {
    try {
      let {nome, email, senha, telefone, cpf} = req.body;

      if (nome.replace(/( )+/g, '') == "" || nome.length < 4)
        return resp.send({ erro: "O nome deve ser maior que 4 Digitos" });
  
      if (telefone.replace(/( )+/g, '') == "" || isNaN(telefone))
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
        ds_senha: crypto.SHA256(senha).toString(crypto.enc.Base64),
        ds_cpf: cpf,
        ds_telefone: telefone,
      });

      let c = {
        "nome": r.nm_usuario,
        "email": r.ds_email,
        "cpf": r.ds_cpf,
        "telefone": r.ds_telefone,
      }

      resp.send(c);
    } catch (e) {
      resp.send(e.toString());
    }
});


app.post("/login", async (req, resp) => {
  try {
    let { email, senha } = req.body;
    let descrypto = crypto.SHA256(senha).toString(crypto.enc.Base64)
    let valido = await db.infoc_ntc_usuario.findOne({
      where: { 'ds_email': email, 'ds_senha': descrypto },
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
      <style type="text/css">
      body,
      html,
      .body {
        background: #8000cf;
        color: white;   
      }
    
      .header {
        background: #f3f3f3;
      }
    </style>
    <container>
      <row class="header">
        <columns>
          <h2 class="Recuperação de Senha"></h2>
        </columns>
      </row>
      <row>
        <columns>
        <rows style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
            <img src="https://cdn.discordapp.com/attachments/847951707988426763/904720715197075456/Logo-ntc.png">
          <h1 class="text-center" style="text-align: center;font-size: 2em;font-family: arial;">Recuperação de Senha</h1>
        </rows>
          <h2 style="text-align: center;font-size: 2em;font-family: arial;">Este codigo deve ser inserido na tela</h2>
          <p class="text-center" style="text-align: center;font-size: 4em;font-family: arial;">${numero}</p>
          <hr />
          <p><small> Esse email é automatico, não responda!!! </small><BR>
            <small>NTC CORPORATION</small></p>
        </columns>
      </row>
    </container>    
      `
    );

    resp.sendStatus(200);
  } catch (e) {
    resp.send(e.toString());
  }
});

app.post("/validarCodigo", async (req, resp) => {
  try {
    let { email, codigo } = req.body
    const usuaria = await db.infoc_ntc_usuario.findOne({
      where: {
        ds_email: email,
      },
    });
    
    if (usuaria.dataValues.ds_senha_rec !== codigo) {
       return resp.send( {erro: "Código inválido." });
    }
    resp.sendStatus(200);
  } catch (e) {
      resp.send(e.toString())
  }
});

app.put("/novaSenha", async (req, resp) => {

  let { email, senha, codigo } = req.body

  const usuaria = await db.infoc_ntc_usuario.findOne({
    where: { ds_email: email },
  });

  if (!usuaria) {
    return resp.send({ erro: "E-mail inválido." });
  }

  if (usuaria.ds_senha_rec !== codigo || usuaria.ds_senha_rec === "") {
    return resp.send({ erro: "Código inválido." });
  }

  await db.infoc_ntc_usuario.update(
    {
      ds_senha: senha,
      ds_senha_rec: "",
    },
    {
      where: { id_usuario: usuaria.id_usuario },
    }
  );

  resp.send("Senha alterada com sucesso.");
});








export default app














