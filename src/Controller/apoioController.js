import db from "../db.js";
import  Router from "express";

const app = Router();

app.get("/", async (req, resp) => {
    try {
      let apoio = await db.infoc_ntc_apoio_frase.findAll({
        attributes:[['ds_frase', 'frase']],
        order: [["id_frase", "desc"]]
      });
      resp.send(apoio);
    } catch (e) {
      resp.send(e.toString());
    }
});




export default app