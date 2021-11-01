

import db from '../db.js';
import { Router} from 'express'
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
            <svg width="221" height="107" viewBox="0 0 221 107" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <rect width="220.426" height="106.98" fill="url(#pattern0)"/>
            <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use xlink:href="#image0" transform="translate(0 -0.530225) scale(0.002 0.0041209)"/>
            </pattern>
            <image id="image0" width="500" height="500" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAABfOElEQVR4Xu3dB5xcVd3/8Z2ysz2900ILICEICQiIVANIeahKERV4LKjgg4oi8lcpUgQUxUfF8lgREClKUWkCooCUUBKQTmhJSN++0//f3+zcyexkdvfeKbszs5/7Ytgy9557zvtO9nfPuafU1bEhgAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIFA7Ar7aKQolQQABBGpLIJlMDvgb7fP5krVVQkpTSgECeik1SQsBBBAoUiARTrSFl3SdGVnad0J8TXQLJzlfyBcOTK5/Qa9F9bMa7qrfovFuBfh4kafj8BoSIKDX0MWkKAggUN0CCuatnXesvl+BfMFwJVGAX1M/u+mO0OzGGxXc/6bgnhjuGN6vbQECem1fX0qHAAJVJNDzRMfX+xZ1Xuw1ywruq0Nzmn/TOLf1h4FxwTe8Hs/+tSFAQK+N60gpEECgygWsdt5+/YqlyUhychFF6VVt/Z6G7Zp/FprddGcR6XBoFQoQ0KvwopFlBBCoPQHVzs9S7fyqUpXMnrW37DvhE8EpoSWlSpN0KlvAX9nZI3cIIIBA7QtYb/bISz2fLmVJ9Rx+Vz2Pvy/eEdu0lOmSVuUKENAr99qQMwQQ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7quf2fCAvj7ib/B3lhyvghOs1otXwaRkDQEEEKgugUQ40abx2dtFl4UX6ut8vXZLdMVnqBSVuLZFWE3oy/1tgReCMxseDLQFXg5Mrn9Wr1fGep8QAnp1/bsjtwgggMCICKiZ3h9bHtktvjr6vnhXbAubkCUZTkxNN9fbCKDsUSClzlOvEowEZ4Ye84X8qy1gByfXP+Vr8K/S754eC83nhYAS0AtR4xgEEEBgjArY8/hEZ3ymavCbKsBPVrP9zhbc9butEl2ppUlthFBIP2+mfWzCrlSc8dX7IoEp9a/rWxvxY03ksXSwftp+5w/51+n9p+x7C9r6mhjrNW6vHzECulcx9kcAAQQQGFYgz7BZO8ZGDxU8NHPYk7IDAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIjKLA/wfld/CjXEvisQAAAABJRU5ErkJggg=="/>
            </defs>
            </svg>     
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














