import db from "../db.js";
import  Router  from "express";

const app = Router();

// FUNCTION COM O RETORNO DAS TABELAS DO DENUNCIA
function retornoDenuncia() {
  return [
    ["id_denuncia", "id"],
    ["ds_depoimento", "depoimento"],
    ["dt_cadastro", "data"],
    ["bt_ativo", "ativo"],
    ["id_usuario", "idUsu"]
  ];
}
function fkDenuncia() {
  return [
    {
      model: db.infoc_ntc_usuario,
      as: "id_usuario_infoc_ntc_usuario",
      attributes: [
        ['id_usuario', 'idUsu'],
        ["nm_usuario", "nome"],
        ["ds_email", "email"],
        ["ds_telefone", "telefone"],
        ["ds_cpf", "cpf"],
      ],
      required: true,
    },
    {
      model: db.infoc_ntc_vestimento,
      as: "vestimento", 
      attributes: [
        ["ds_inferior", "partInferior"],
        ["ds_superior", "partSuperior"],
        ["ds_calcado", "calcado"],
      ],
      required: true,
    },
    {
      model: db.infoc_ntc_caracteristica_fisica,
      as: "id_fisico_infoc_ntc_caracteristica_fisica",
      attributes: [
        ["ds_pele", "pele"],
        ["ds_cabelo", "cabelo"],
        ["ds_cor_cabelo", "corCabelo"],
        ["ds_complemento", "complemento"],
      ],
      required: true,
    },
    {
      model: db.infoc_ntc_local,
      as: "id_local_infoc_ntc_local",
      attributes: [
        ["ds_latitude", "lat"],
        ["ds_longitude", "lgn"],
      ],
      required: true,
    },
  ];
}
function retornoUsuario() {
  return[
    ['id_usuario', 'idUsu'],
    ["nm_usuario", "nome"],
    ["ds_email", "email"],
    ["ds_telefone", "telefone"],
    ["ds_cpf", "cpf"],
  ]
}


// VERBOS DA VALIDAÇÃO DAS DENÚNCIAS
app.get("/denuncia", async (req, resp) => {
  try {
    let denuncias = await db.infoc_ntc_denuncia.findAll({
      attributes: retornoDenuncia(),
      include: fkDenuncia(),
      where: {
        bt_ativo: false,
      },
      order: ["id_denuncia"],
      limit: 1,
    });
    resp.send(JSON.stringify(denuncias[0]));
  } catch (e) {
    resp.send({ erro: "Não foi possível listar as Denuncias" });
  }
});
app.put("/denuncia/:id", async (req, resp) => {
  try {
    let { id } = req.params;
    let { depoimento } = req.body;
    let denuncia = await db.infoc_ntc_denuncia.update(
      {
        ds_depoimento: depoimento,
        bt_ativo: true,
      },
      { where: { id_denuncia: id } }
    );
    if (denuncia === 1) return resp.send({ retorno: "Validada com sucesso" });
    else return resp.send({ retorno: "Houve um erro na Validação" });
  } catch (e) {
    resp.send({ erro: "Não foi possivel cadastrar a denuncia" });
  }
});
app.delete("/denuncia/:id", async (req, resp) => {
  
  try {
    let { id } = req.params;
    let denuncia = await db.infoc_ntc_denuncia.destroy({
      where: { id_denuncia: id },
    });
    resp.sendStatus(200);    
  } catch (e) {
      resp.send({erro: 'Não foi possível excluir esta denúncia'})
  }
  
});



// VERBOS DA ARÉA DE APOIO(FRASES)
app.get("/apoio", async (req, resp) => {
  try {
    let apoio = await db.infoc_ntc_apoio_frase.findAll({
      order: [[
          "id_frase", "desc"
        ]],
        attributes:[
            ['id_frase', 'id'],
            ['ds_frase', 'frase']
        ]
    });
    resp.send(apoio);
  } catch (e) {
    resp.send({ 
        erro: "Ocorreu um erro" 
    });
  }
});
app.post("/apoio", async (req, resp) => {
  try {
    let { frase } = req.body

    let frasesCadastradas = await db.infoc_ntc_apoio_frase.findOne({
      where: { 
          'ds_frase': frase 
      } 
    });

    if (frasesCadastradas != null) 
        return resp.send({ erro: "Frase já cadastrada" });

    let cadastrada = await db.infoc_ntc_apoio_frase.create({
        'ds_frase':frase,
    });

    resp.send(cadastrada);
    
  } catch (e) {
    resp.send({ 
        erro: "Ocorreu um erro, a frase não foi cadastrada" 
    });
  }
});
app.put("/apoio/:id", async (req, resp) => {
  try {
    let { id } = req.params;
    let { frase } = req.body;

    let r = await db.infoc_ntc_apoio_frase.update(
      {
        'ds_frase': frase,
      },
      {
        where: { 
            'id_frase': id 
        },
      }
    );
    resp.sendStatus(200);

  } catch (e) {
    resp.send({ erro: "Ocorreu um erro, a frase não foi alterado" });
  }
});
app.delete("/apoio/:id", async (req, resp) => {
  try {
    let {id} = req.params;
    
    let verif = await db.infoc_ntc_apoio_frase.findOne({
        where: { 'id_frase': id },
    });

    if( verif === null)
        return resp.send('Esta Frase já foi excluída')   

    await db.infoc_ntc_apoio_frase.destroy({
        where: { 'id_frase': id },
    });

    resp.sendStatus(200);
    
  } catch (e) {
    resp.send({ erro: "Ocorreu um erro" });
  }
});



// VERBOS DA AREA DE ADMININSTRADOR
app.get("/cargos", async (req, resp) => {
    try {
        let adm = await db.infoc_ntc_administrador.findAll({
            order: [["id_administrador", "desc"]],
            attributes:[
                ['id_administrador', 'id'],
                ['nm_administrador', 'nome'],
                ['ds_senha', 'senha']
            ]
        });
        resp.send(adm);
    } catch (e) {
        resp.send({ erro: "Ocorreu um erro" });
    }
});
app.post("/cargos", async (req, resp) => {
    try {
        let {nome, senha} = req.body;

        let cadastrados = await db.infoc_ntc_administrador.findOne({
            where: { 'nm_administrador': nome },
        });

        if (cadastrados !== null) 
            return resp.send({ erro: "Administrador já cadastrado" });

        let r = await db.infoc_ntc_administrador.create({
            nm_administrador: nome,
            ds_senha: senha
        });
        
        resp.send(r)
    } catch (e) {
        resp.send({ 
            erro: "Ocorreu um erro, o administrador não foi cadastrado" 
        });
    }
});
app.put("/cargos/:id", async (req, resp) => {
    try {
        let { id } = req.params;
        let { nome, senha } = req.body;

        let r = await db.infoc_ntc_administrador.update(
            {
                'nm_administrador': nome,
                'ds_senha': senha,
            },
            { where:{ 
                    'id_administrador': id 
                }
            }
        );

        resp.sendStatus(200);
        
    } catch (e) {
        resp.send({ 
            erro: "Ocorreu um erro, o administrador não foi alterado" 
        });
    }
});
app.delete("/cargos/:id", async (req, resp) => {
    try {
        let {id} = req.params;

        let verif = await db.infoc_ntc_administrador.findOne({
            where:{'id_administrador': id}
        });
        
        if(verif === null){
            return resp.send({erro: 'Administrador não encontrado'})
        }

        let r = await db.infoc_ntc_administrador.destroy({
            where:{'id_administrador': id}
        })

        resp.sendStatus(200)

    } catch (e) {
        resp.send({ 
            erro: "Ocorreu um erro" 
    });
    }
});
// LOGIN DO ADM
app.post("/login", async(req, resp) =>{

  try {
    let {nome, senha} = req.body

    let r = await db.infoc_ntc_administrador.findOne({
      where: {
        'nm_administrador': nome,
        'ds_senha': senha
      }
    }) 
    
    if(!r)
      return resp.send({erro: 'Credenciais inválidas'})

    resp.send(r)

  } catch (e) {
    resp.send(e.toString())
  }
  
})
  


//VERBOS DA LISTA DE USUARIOS
app.get('/usuarios', async(req, resp) =>{    
    try{
        let r = await db.infoc_ntc_usuario.findAll({
        })
        resp.send(r)
    } catch(e){
        resp.send({
            erro: 'Houve um problema ao listar as Usuarias'
        })
    }
})
app.get('/buscarUsuario/:id', async(req, resp) =>{
  try {
    let { id } = req.params
    
    let r = await db.infoc_ntc_usuario.findOne({
      where:{'id_usuario': id},
      attributes: retornoUsuario()
    })

    if(!r)
      return resp.send({erro: 'Usuario não encontrado'})
    
    resp.send(r)

  } catch (e) {
    resp.send({erro: 'Não foi possível encontrar as denuncias deste Usuario'})
  }
})


//VERBOS DA DENUNCIA
app.get('/listadenuncias', async(req, resp) =>{
    try{
        let r = await db.infoc_ntc_denuncia.findAll({
            include: fkDenuncia(),
            attributes: retornoDenuncia(),
        })
        resp.send(r)
    } catch(e) {
        resp.send({erro: 'Não foi possível listas as denúncias'})
    }
})
app.get('/buscarDenuncia/:id', async(req, resp) =>{

  try {
    let { id } = req.params
    
    let r = await db.infoc_ntc_denuncia.findAll({
      where: {'id_usuario': id},
      attributes: retornoDenuncia()
    })

    resp.send(r)
  } catch (e) {
    resp.send({
      erro: 'Não foi possível encontrar as denúncias deste usuario'
    })
  }


})




export default app;
