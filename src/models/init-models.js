import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _infoc_ntc_administrador from  "./infoc_ntc_administrador.js";
import _infoc_ntc_apoio_frase from  "./infoc_ntc_apoio_frase.js";
import _infoc_ntc_caracteristica_fisica from  "./infoc_ntc_caracteristica_fisica.js";
import _infoc_ntc_denuncia from  "./infoc_ntc_denuncia.js";
import _infoc_ntc_local from  "./infoc_ntc_local.js";
import _infoc_ntc_usuario from  "./infoc_ntc_usuario.js";
import _infoc_ntc_vestimento from  "./infoc_ntc_vestimento.js";

export default function initModels(sequelize) {
  var infoc_ntc_administrador = _infoc_ntc_administrador.init(sequelize, DataTypes);
  var infoc_ntc_apoio_frase = _infoc_ntc_apoio_frase.init(sequelize, DataTypes);
  var infoc_ntc_caracteristica_fisica = _infoc_ntc_caracteristica_fisica.init(sequelize, DataTypes);
  var infoc_ntc_denuncia = _infoc_ntc_denuncia.init(sequelize, DataTypes);
  var infoc_ntc_local = _infoc_ntc_local.init(sequelize, DataTypes);
  var infoc_ntc_usuario = _infoc_ntc_usuario.init(sequelize, DataTypes);
  var infoc_ntc_vestimento = _infoc_ntc_vestimento.init(sequelize, DataTypes);

  infoc_ntc_denuncia.belongsTo(infoc_ntc_caracteristica_fisica, { as: "id_fisico_infoc_ntc_caracteristica_fisica", foreignKey: "id_fisico"});
  infoc_ntc_caracteristica_fisica.hasMany(infoc_ntc_denuncia, { as: "infoc_ntc_denuncia", foreignKey: "id_fisico"});
  infoc_ntc_denuncia.belongsTo(infoc_ntc_local, { as: "id_local_infoc_ntc_local", foreignKey: "id_local"});
  infoc_ntc_local.hasMany(infoc_ntc_denuncia, { as: "infoc_ntc_denuncia", foreignKey: "id_local"});
  infoc_ntc_denuncia.belongsTo(infoc_ntc_usuario, { as: "id_usuario_infoc_ntc_usuario", foreignKey: "id_usuario"});
  infoc_ntc_usuario.hasMany(infoc_ntc_denuncia, { as: "infoc_ntc_denuncia", foreignKey: "id_usuario"});
  infoc_ntc_denuncia.belongsTo(infoc_ntc_vestimento, { as: "id_vestimento_infoc_ntc_vestimento", foreignKey: "id_vestimento"});
  infoc_ntc_vestimento.hasMany(infoc_ntc_denuncia, { as: "infoc_ntc_denuncia", foreignKey: "id_vestimento"});

  return {
    infoc_ntc_administrador,
    infoc_ntc_apoio_frase,
    infoc_ntc_caracteristica_fisica,
    infoc_ntc_denuncia,
    infoc_ntc_local,
    infoc_ntc_usuario,
    infoc_ntc_vestimento,
  };
}
