import db from "./db.js";
import express, { raw } from "express";
import cors from "cors";
import enviarEmail from "./email.js";
const app = express();
import Sequelize from 'sequelize';
const { Op, col, fn } = Sequelize;
app.use(cors());
app.use(express.json());

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.post("/cadastrar", async (req, resp) => {
  try {
    let usu = req.body;

    let regexEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!usu.nome && usu.nome.length <= 4)
      return resp.send({ erro: "O nome deve ser maior que 4 Digitos" });

    if (regexEmail.test(usu.email) == false)
      return resp.send({ erro: "O E-mail deve ser valido" });

    if (usu.senha.length <= 4 && !usu.senha)
      return resp.send({ erro: "A senha deve Maior que 4 digitos" });

    if (usu.cpf.length <= 9 && !usu.cpf)
      return resp.send({ erro: "o CPF deve ser valido" });

    if (usu.telefone.length <= 8 && !usu.telefone)
      return resp.send({ erro: "o telefone deve ser valido" });

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

app.post("/login", async (req, resp) => {
  try {
    let { email, senha } = req.body;

    let valido = await db.infoc_ntc_usuario.findOne({
      where: { ds_email: email, ds_senha: senha }
    });

    if (!valido) return resp.send({ erro: "Credenciais Inválidas" });

     resp.send(valido);
  } catch (e) {
    resp.send(e.toString());
  }
});

app.post("/recuperacao", async (req, resp) => {
  try {
    const usuaria = await db.infoc_ntc_usuario.findOne({
      where: { ds_email: req.body.email },
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

















app.post("/cadastrarDenuncia", async (req, resp) => {
  try {
    let denuncia = req.body;

    let f = await db.infoc_ntc_caracteristica_fisica.create({
      ds_pele: denuncia.pele,
      ds_cabelo: denuncia.cabelo,
      ds_cor_cabelo: denuncia.corCabelo,
      ds_complemento: denuncia.complementoFisico,
    });

    let v = await db.infoc_ntc_vestimento.create({
      ds_inferior: denuncia.inferior,
      ds_superior: denuncia.superior,
      ds_calcado: denuncia.calcado,
      ds_complemento: denuncia.complementoVestimento,
    });

    let r = await db.infoc_ntc_denuncia.create({
      id_fisico: f.id_fisico,
      id_vestimento: v.id_vestimento,
      ds_depoimento: denuncia.descricao,
      bt_ativo: denuncia.ativo,
    });
    resp.send(r);
  } catch (e) {
    resp.send(e.toString());
  }
});

app.get("/denuncia", async (req, resp) => {
  try {
    let denu = await db.infoc_ntc_denuncia.findAll({
      order: [["id_denuncia", "desc"]],
      include:[
        {
          model: db.infoc_ntc_usuario,
          as: 'id_usuario_infoc_ntc_usuario',
          attributes:['nm_usuario', 'ds_email', 'ds_telefone', 'ds_cpf'],
          required: true
        },
        {
          model: db.infoc_ntc_vestimento,
          as:"id_vestimento_infoc_ntc_vestimento",
          required: true
        },
        {
          model: db.infoc_ntc_caracteristica_fisica,
          as:"id_fisico_infoc_ntc_caracteristica_fisica",
          required: true
        },
        {
          model: db.infoc_ntc_local,
          as: 'id_local_infoc_ntc_local',
          required: true
        }

    ]
    });
    resp.send(denu);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});


app.post('/Buscardenuncia', async(req, resp) =>{
  try {
    let denu = await db.infoc_ntc_denuncia.findAll({
      where: { 
        'ds_depoimento': { [Op.like]:`%${req.body.busca}%` } 
      },
      order: [["id_denuncia", "desc"]],
      include:[
        {
          model: db.infoc_ntc_usuario,
          as: 'id_usuario_infoc_ntc_usuario',
          attributes:['nm_usuario', 'ds_email', 'ds_telefone', 'ds_cpf'],
          required: true
        },
        {
          model: db.infoc_ntc_vestimento,
          as:"id_vestimento_infoc_ntc_vestimento",
          required: true
        },
        {
          model: db.infoc_ntc_caracteristica_fisica,
          as:"id_fisico_infoc_ntc_caracteristica_fisica",
          required: true
        },
        {
          model: db.infoc_ntc_local,
          as: 'id_local_infoc_ntc_local',
          required: true
        }
  
    ]
    });

    resp.send(denu);
  } catch (error) {
    resp.send({erro: 'Houve um erro durante a busca'})
  }

})


app.get('/Buscarden/:id', async(req, resp) =>{
  try {
    let denu = await db.infoc_ntc_denuncia.findAll({
      where: { 
        id_usuario: req.params.id 
      },
      order: [["id_denuncia", "desc"]],
      include:[
        {
          model: db.infoc_ntc_usuario,
          as: 'id_usuario_infoc_ntc_usuario',
          attributes:['nm_usuario', 'ds_email', 'ds_telefone', 'ds_cpf'],
          required: true
        },
        {
          model: db.infoc_ntc_vestimento,
          as:"id_vestimento_infoc_ntc_vestimento",
          required: true
        },
        {
          model: db.infoc_ntc_caracteristica_fisica,
          as:"id_fisico_infoc_ntc_caracteristica_fisica",
          required: true
        },
        {
          model: db.infoc_ntc_local,
          as: 'id_local_infoc_ntc_local',
          required: true
        }
  
    ]
    });

    resp.send(denu);
  } catch (error) {
    resp.send({erro: 'Houve um erro durante a busca'})
  }

})



app.get('/validarDenuncia', async(req, resp) =>{
  try {
    let denu = await db.infoc_ntc_denuncia.findAll({
      order: [["id_denuncia", "desc"]],
      include:[
        {
          model: db.infoc_ntc_usuario,
          as: 'id_usuario_infoc_ntc_usuario',
          attributes:['nm_usuario', 'ds_email', 'ds_telefone', 'ds_cpf'],
          required: true
        },
        {
          model: db.infoc_ntc_vestimento,
          as:"id_vestimento_infoc_ntc_vestimento",
          required: true
        },
        {
          model: db.infoc_ntc_caracteristica_fisica,
          as:"id_fisico_infoc_ntc_caracteristica_fisica",
          required: true
        },
        {
          model: db.infoc_ntc_local,
          as: 'id_local_infoc_ntc_local',
          required: true
        }
      ],
      limit:1
    });

    resp.send(denu);
  } catch (error) {
    resp.send({erro: 'Houve um erro durante a busca'})
  }

})


app.delete("/denuncia/:id", async (req, resp) => {
  try {
    let verif = await db.infoc_ntc_denuncia.findOne({where: {id_usuario: req.params.id}});

    
    if (verif !== null) {
      let r = await db.infoc_ntc_denuncia.destroy({
        where: { id_denuncia: id },
      });
      resp.sendStatus(200);
    } else {
      resp.send("Não foi possivel excluir a denuncia");
    }
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});






















app.get("/apoio", async (req, resp) => {
  try {
    let apoio = await db.infoc_ntc_apoio_frase.findAll({
      order: [["id_frase", "desc"]],
    });
    resp.send(apoio);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.post("/apoio", async (req, resp) => {
  try {
    let apoio = req.body;
    let a = await db.infoc_ntc_apoio_frase.findOne({
      where: { ds_frase: apoio.frase },
    });
    if (a != null) return resp.send({ erro: "Frase já cadastrada" });

    let d = await db.infoc_ntc_apoio_frase.create({
      ds_frase: apoio.frase,
    });
    resp.send(d);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi cadastrada" });
  }
});

app.put("/apoio/:id", async (req, resp) => {
  try {
    let d = await db.infoc_ntc_apoio_frase.update(
      {
        ds_frase: req.body.frase,
      },
      {
        where: { id_frase: req.params.id },
      }
    );
    resp.sendStatus(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi alterado" });
  }
});

app.delete("/apoio/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let verif = await db.infoc_ntc_apoio_frase.findAll();
    if (verif !== null) {
      let r = await db.infoc_ntc_apoio_frase.destroy({
        where: { id_frase: id },
      });
      resp.sendStatus(200);
    } else {
      resp.send("Não foi possivel excluir a Frase");
    }
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});


app.get("/BuscarUsu/:id", async(req, resp) =>{
  try{
    let r = await db.infoc_ntc_usuario.findOne({
      where: {id_usuario: req.params.id}
    })
    resp.send(r)
  } catch(e){
    resp.send(e.toString())
  }
})














app.get("/localCidade", async (req,resp) => {

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
 



app.get("/localBairro", async (req,resp) => {

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

        resp.send(data);
    } catch(e){
      resp.send(e.toString())
    }
  })




   









app.get("/administrador", async (req, resp) => {
  try {
    let adm = await db.infoc_ntc_administrador.findAll({
      order: [["id_administrador", "desc"]],
    });
    resp.send(adm);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.post("/administrador", async (req, resp) => {
  try {
    let adm = req.body;

    let a = await db.infoc_ntc_administrador.findOne({
      where: { nm_administrador: adm.nome },
    });
    if (a != null) return resp.send({ erro: "Administrador já cadastrado" });

    let d = await db.infoc_ntc_administrador.create({
      nm_administrador: adm.nome,
      ds_senha: adm.senha,
    });
    resp.send(d);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, o administrador não foi cadastrado" });
  }
});

app.put("/administrador/:id", async (req, resp) => {
    try {
      let adm = req.params.id;
      let a = req.body;
  
      let d = await db.infoc_ntc_administrador.update(
        {
          nm_administrador: a.nome,
          ds_senha: a.senha,
        },
        { where: { id_administrador: adm } }
      );
      resp.sendStatus(200);
    } catch (e) {
      resp.send({ erro: "Ocorreu um erro, o administrador não foi alterado" });
    }
});

app.delete("/administrador/:id", async (req, resp) => {
    try {
      let id = req.params.id;
      console.log(id)
      let verif = await db.infoc_ntc_administrador.findAll();
      if (verif !== null) {
        let r = await db.infoc_ntc_administrador.destroy({
          where: { id_administrador: id },
        });
        resp.sendStatus(200);
      } else {
        resp.send("Não foi possivel excluir o Administrador");
      }
    } catch (e) {
      resp.send({ erro: "Ocorreu um erro" });
    }
});

















app.get("/usuario", async (req, resp) => {
  try {
    let usuario = await db.infoc_ntc_usuario.findAll({
      order: [["id_usuario", "desc"]],
      raw: true
    });
    delete usuario.ds_senha;
    resp.send(usuario);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.delete("/usuario/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let verif = await db.infoc_ntc_usuario.findAll();
    if (verif !== null) {
      let r = await db.infoc_ntc_usuario.destroy({ where: { id_usuario: id } });
      resp.sendStatus(200);
    } else {
      resp.send("Não foi possivel excluir este Usuario");
    }
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.post('/buscarUsuario', async(req, resp) =>{
    try {
      let usu = db.infoc_ntc_usuario.findAll({
        where: {
          [Op.or]: [
            { 'id_usuario_infoc_ntc_usuario.nm_usuario': { [Op.like]:`%${req.body.busca}%` } },
            { 'id_usuario_infoc_ntc_usuario.ds_email': { [Op.like]:`%${req.body.busca}%` } },
            { 'id_usuario_infoc_ntc_usuario.ds_cpf': { [Op.like]:`%${req.body.busca}%` } },
            { 'id_usuario_infoc_ntc_usuario.ds_Telefone': { [Op.like]:`%${req.body.busca}%` } },
          ]
        }
      })
      if(usu === []){
        return resp.send({erro: 'Não encontrado'})
      }
      let r = await db.infoc_ntc_denuncia.findAll({
        where: {
            id_usuario: usu.id_usuario
        },
        include:[
          {
            model: db.infoc_ntc_usuario,
            as: 'id_usuario_infoc_ntc_usuario',
            attributes:['nm_usuario', 'ds_email', 'ds_telefone', 'ds_cpf'],
            required: true
          },
          {
            model: db.infoc_ntc_vestimento,
            as:"id_vestimento_infoc_ntc_vestimento",
            required: true
          },
          {
            model: db.infoc_ntc_caracteristica_fisica,
            as:"id_fisico_infoc_ntc_caracteristica_fisica",
            required: true
          },
          {
            model: db.infoc_ntc_local,
            as: 'id_local_infoc_ntc_local',
            required: true
          }
        ],
      })
      
      resp.send(r)
    } catch (e) {
        resp.send(e.toString())
    }
})
























app.get("/caracteristicas", async (req, resp) => {
  try {
    let carac = await db.infoc_ntc_caracteristica_fisica.findAll({
      order: [["id_fisico", "desc"]],
    });
    resp.send(carac);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});



app.get("/local", async (req, resp) => {
  try {
    let local = await db.infoc_ntc_local.findAll({
      order: [["id_local", "desc"]],
    });
    resp.send(local);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.get("/vestimento", async (req, resp) => {
  try {
    let vestimenta = await db.infoc_ntc_vestimento.findAll({
      order: [["id_vestimento", "desc"]],
    });
    resp.send(vestimenta);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.post("/caracteristica", async (req, resp) => {
  try {
    let caracteristica = req.body;

    let a = await db.infoc_ntc_caracteristica_fisica.findOne({
      where: { ds_pele: caracteristica.pele },
    });
    if (a != null)
      return resp.send({ erro: "A caracteristica fisica foi cadastrada ja!" });

    let d = await db.infoc_ntc_caracteristica_fisica.create({
      ds_pele: caracteristica.pele,
      ds_cabelo: caracteristica.cabelo,
      ds_cor_cabelo: caracteristica.corCabelo,
      ds_complemento: caracteristica.complementoFisico,
    });
    resp.send(d);
  } catch (e) {
    resp.send({
      erro: "ocorreu um erro A caracteristica fisica nao foi cadastrada!",
    });
  }
});

app.post("/local", async (req, resp) => {
  try {
    let local = req.body;

    let d = await db.infoc_ntc_local.create({
      ds_latitude: local.latitude,
      ds_longitude: local.longitude,
      ds_bairro: local.bairro,
    });
    resp.send(d);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi cadastrada" });
  }
});

app.post("/vestimento", async (req, resp) => {
  try {
    let vestimenta = req.body;

    let v = await db.infoc_ntc_vestimento.create({
      ds_inferior: vestimenta.inferior,
      ds_superior: vestimenta.superior,
      ds_calcado: vestimenta.calcado,
      ds_complemento: denuncia.complementoVestimento,
    });
    resp.send(v);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi cadastrada" });
  }
});



app.put("/caracteristicas/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let caracteristica = req.body;

    let a = await db.infoc_ntc_caracteristica_fisica.update(
      {
        ds_pele: caracteristica.pele,
        ds_cabelo: caracteristica.cabelo,
        ds_cor_cabelo: caracteristica.corCabelo,
        ds_complemento: caracteristica.complementoFisico,
      },
      { where: { id_fisico: id } }
    );
    resp.send(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi alterado" });
  }
});

app.put("/cadastrarDenuncia/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let denuncia = req.body;

    let a = await db.infoc_ntc_denuncia.update(
      {
        ds_depoimento: denuncia.descricao,
        bt_ativo: denuncia.ativo,
      },
      { where: { id_denuncia: id } }
    );
    resp.send(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a denuncia não foi alterada" });
  }
});

app.put("/local/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let local = req.body;

    let a = await db.infoc_ntc_local.update(
      {
        ds_latitude: local.latitude,
        ds_longitude: local.longitude,
        ds_bairro: local.bairro,
      },
      { where: { id_local: id } }
    );
    resp.send(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, o local não foi alterada" });
  }
});

app.put("/usuaria/:id", async (req, resp) => {
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
        ds_senha_rec: usu.senhaRe,
      },
      { where: { id_usuario: id } }
    );
    resp.send(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, o local não foi alterada" });
  }
});

app.put("/vestimenta/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let v = req.body;

    let a = await db.infoc_ntc_vestimento.update(
      {
        ds_inferior: v.inferior,
        ds_superior: v.superior,
        ds_calcado: v.calcado,
        ds_complemento: v.complementoVestimento,
      },
      { where: { id_vestimento: id } }
    );
    resp.send(200);
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, o local não foi alterada" });
  }
});





app.delete("/local/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let verif = await db.infoc_ntc_local.findAll();
    if (verif !== null) {
      let r = await db.infoc_ntc_local.destroy({ where: { id_local: id } });
      resp.sendStatus(200);
    } else {
      resp.send("Não foi possivel excluir o objeto");
    }
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});


app.delete("/vestimento/:id", async (req, resp) => {
  try {
    let id = req.params.id;
    let verif = await db.infoc_ntc_vestimento.findAll();
    if (verif !== null) {
      let r = await db.infoc_ntc_vestimento.destroy({
        where: { id_vestimento: id },
      });
      resp.sendStatus(200);
    } else {
      resp.send("Não foi possivel excluir o objeto");
    }
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});

app.listen(process.env.PORT, (r) =>
  console.log(`API subiu na porta ${process.env.PORT}`)
);
