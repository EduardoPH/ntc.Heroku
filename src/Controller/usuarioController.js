

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
        background: #f3f3f3 !important;
      }
    
      .header {
        background: #f3f3f3;
      }
    </style>
    
    <spacer size="16"></spacer>
    
    <container>
    
      <row class="header">
        <columns>
    
          <spacer size="16"></spacer>
          
          <h2 class="Recuperação de Senha</h2>
        </columns>
      </row>
      <row>
        <columns>
    
          <spacer size="32"></spacer>
    
          <center>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA81BMVEX////z8/Pr6+vl5eXk5OQiHx/m5ub6+vrEQDDj4+P7+/sAAAD39/fv7+8gHR0YFBRQUFGxsbHc3Ny4uLgWEhIPDAyXhoSWjo0JAADDOijZ2dloZ2fDOCZsa2txcHDCMx9GRke/IwChoaHBLRbBKA6Kioqrq6vAwMDUjojmxMHn0tHdqqbLcGjIyMjPwcDCQjPCSz69AADTlZDOeHHv29mZlZV9fX1cT05QSEhjXVzv5eTXr6zg09LFU0jKYVfdurfTenLThH0pHRw/Pj4VAAC0pKI1KypUPz1MLis7MjJwZWQ7KSfcxsT37+7VoZ3KZ15oU1GRg886AAARSElEQVR4nO2dC3uiutaAk6BQCZHxdqpTWzfV3rwcbWs7rb26Z87eZ+9T7ff/f82XK4ICYqstdJt5nqFLFpBFwlp5kxAAAMDQdA3SLdL1zJcTdZCMfGzawoyUNbH7S4k6MAzDQghBwzAJ3ZpfTgSalkHUWpjRcibd5r6cCGhN5TKtuQbdZr6cSMtQkxZnDH4DvpoI4FdPwpdqGeF5tNyXEzVu4edHrQ3HQzMnLc7wG/C1RA3QiEFoBIF0a9EI8uVEg0YLTfrWjHC1X038B8TDTEa0AHIZ0SD4cqLwNJmceC4zuS8nMteaBJ++pactPW3pCXy+T9/S05aewpPwpZ/OOFt62tLTlp7A5zPOlp629BQuCk/z6YyzpafU0JP2URf6BHoihFWezPcJu6Xw69ET/b9wcIN5+n3v6vvGLvQ59KQjUviJcTmf5SlvV/CvIx26USv19GSh3SqW1qmUr+C9Hvwi9AQKuDJnH0823ofWpi/OMwA2SjG6fjtffm4qV0sw9fQEergcYh+rq/iapJ2eTkILUCR8a27kuh9FT9Z/8Fyh2bbtN7nyzUoxPaGC10DqPvFf+3u3dGP7TITppacTj4F5/MdVD/IAXCzc4orHxFsrrfQEPc8g/tmjtzIjL0zQtXffLljrdT+MnuBPe1aAVxD59pJefuZjcU9PIz2RXbeO2tUinNurIXLr7s/bKIX0RL7PDMzDQOUjV6NyTXKbycbm6MkAN6qO5qsEBCqDa9dE/J2kjZ70mR/FRT1EGX5Tz6L9I3X0BP9QvhKXjFBlkne17jcXtDZCT6ikirC8F6E8e1jtW5guegK/qacQk0i9fVVP8feNkZTwpWvGlqIqm+ohilLWdLesr9NFT0cV5UdRtDJRmlmcLnpSHqRyhaKVdbe08UmK6MnqudnWlymDv21VTWF66MnarSgPaS1VVncj/wumh57c9ky1QJYru+X9fblyUujJdDMdQ9k4KCu3S9abjc3Rk64qnn0T41hLNQ5ovEgLPaHjqvKkMY61VEjM/wXSQk/oXxXVJI11rFunQVroydqzFVWAGMeCGxk8sZYaevpTZXmkxTiWKFeDe+vNxgbpSXWJYhLn2Fml/vd6s7FBenKbmlYmxrHoavbYpoSeVDjM/y/WuS3lenFhMwAlfOk6sQXiss1S5b/xjj3GXN3GBZQGeqINebh3IBMXEWubcp8WIvak/t4JEXsTTU/F48PDw0KpVCocHx+XCgUmHhcKhUP2c5golOkxVCytJRsboyfrAFffmbCtJ5meruYG096S7N9JgunpV/RwaLzEg0ZS6WkNRcgoCrwzG5ujJ7gWC3GJJJae1mXh/EBVYuhJW1sZJpaerHWVYXLpaT2e5hi8MxsbpKdlFuYr1WrFXqIkLEwoPUVbmMf5o+Pjwx9Rs6Q8ZZhEejIjLaz87LFn3gCj60i96rohSvjStXBKpC+t3s6Ue1GKzJcmlZ6iLLRvoUf5JEJzI/FwPZwS2abB/MJK2dgPfxZZmyap9BThaSpXwKc8CVetHpvJpafwbOPRnPJNaNBQ0SKR9BRh4bzyVSVMdf3x8CPoKZ+dVy5UQy1MJT3lbcuvjMLLMKX0hOfm5qHrUGeaUnrCJeRTtsI7PFJKT/YPw6sMS1E3I530hHse5Qz4I7zPKrX0hO/RbF7fbQRepJae8sxHigvnvoWGimya6SmL/y2wCPyKBMTU0hMfARXK2ciO47TSk7SQKy+zMJ30JCwUykvLMI30JCwkXNmItjCl9CQsFE7cWmYheGc2PoWehIVoFQvTRU++MoRLLEwlPUkLpfJyT5NCepIWflq0+JixJx7x41iYSnqSFoqpekvLMJX0lF0xWqSQnj4xWnzY2FP1UFhIlqill57yf/FrmcdRdJhqespW/qaNYCtqVIalFNMTNfHX9dFvy5RSTE805cvlpdOmUkxPMVOK6Sm2heCd2fg0elrRwhTSU1wLk0xP65l92UsuPZF1zKDN40S/9/QNV96ZML5P9HtP4GT3XzTt0jTbrCQewuAlJhJCTzlNZzfOQO67BiuLlpaG954SJm5XLE9/Er40kkT8jdqEim+iJ4IIew0JWBbfmHKbTFF/Az3BwtHt7/m8WEaOtlbY+2XZRIr/uz0qFSFaiZ6AdXyDcYWeIxXJpi2Fn8e8RzMuPR1X2cJ4doW/bMWS3CZUZJPH8xgfQj0ePUHyF85nbYxvdwsssRfnxKaUTPHw6AdbqjCPfxYBiEFP6IRr/yhI+9liDpZ8YhMqIkJ6bJ3UPOYrFC+jJzYLu8ruRnJWHY8h6rD3B2bL3KCl9MRWp8LXINDzJlrU+Rp3uKcHRAsPa2gmLWz8H7gWmPpw8Rhn8xXdv3eenqz9chZfWZ/+kaa3iewt1vIeiKSnImYL4C2SiKYe8RWwRfqDDSiHiRn4zeZLaUbQ0wEtwgwACyTSvrt7Ojs7u2vHwxZ9RJU7d3d3k5iM055SZXrMO3FJR7QQD4jmixZ+emIK1kx0SeTFaTRpcs70WNiiv5w3m41G43wYk3FOWw12gXPznbgErmkRoXB6YsMmuBc09tNu7bDUbMdElhX1rWmD6zvvhTm2zhg+8VkgfKlsp6LdShYD00siltg7cUQOoBCNMNQC9zoXR8LClhJRMOPoOenxpIV9IMRikHIscYJZj2soPaGDcv5PXwdhp2GYTLSkhRMeeUijExKXpq0M76tB0sIi32vWL2BgEEMPl1xEd9zC2qPBs/HCavfbwiP8M18+CKcntG+X9z3oQaZO7UEUqbTQZHvRoOZ0YNCgT4fqI4+Fjs73PtRap2hBGZjosd68YKL+JCzs8lUz2s6OM3zjYBO5te29cHoCe7a9P1v7DnRoPutdGl8gVLWUKoPXOv1rChYGfeCUatVfefeZ1GfHWl2q3+rABUyzutQueq8sw2w3uYXP7FhSY0e24ZsGm2g08JqwQE/Uwj2iRFoi3FucUhHVhOdgjviU32+ns8ApU67fGBPq04SFdVZFxkJ/CucwDXXFjicqDXmZ18dsrbA+v5bT9inHHmxiFqJwevJaiESG2e0HkAz4nwOowY6ogMxEf1zqSP3mlGSA1Kd7lX5rivxBTBi4w2okGImbM7U08liXP7ff1H3ILCS+eOijp5mFuYz+IHOw45xZ5KEmLERP0o6dxuMcpzy6+k8IPNa456Cx3NV/0L1Qk7l3anJPcwKEr250LHLpnmX6psGmWRkG0RPzNAeuCLvuxYagy3PcldWJ5aY7zynksin3nQ8tqU9eZvrzyGPsSBNrfV1viTIEHXUO5468BabQnvA0IfREuIUzcawu17QueY6fofqlNSbzXlujLRNljv4sLBypm9QcL7p4ayArJHXYogyf3BrinIHMW6IF4RaG0pMowxl6EPUo1h7GPMeXD/K2Ox0riGLUo1jrC/3xQOq3LsiCMo0Wr/IGNMbc1pp7i5rDN8KUtDCMniC30IMe0L2nNc//rAqBQIoBYfodKxB5oKrYNf+mNQJvhClqArUwnJ7YDUBe9EDuc+RNzgsKoRg4dIL0zwKVmXgacP7ajqm/ebBp5mkC6WnmS+nP3OOh9kKWa802EqFGR+6xpopLw2Zt/gDnBQif7l2DVV7XnC6cv/HgDXHvjxY+enItHL20R7JnfzSYy0HfotWd7jQm7Zeculvt4cTUeUveepjTH4yYZQDlRu2hJS80GbZFq9uAT02/ep01VYkFiTUattHKMOUtw0V6Mvdou9Tg9HPebDmOMxh0n09P6/4cnJ4+d2nLlKbmuaKj0XnTcVqtGtMf+wuxPh4/dx/6dG/L1bcunGaL/hs8Uv1Xv37/Yvz8Omi0Wg7VX5mmjP2yvWeG05P0pZreVo9HrVafr3X0F/VTayhRa+JE68vfmm1BHuhCxYkA/frs/A5YlZ6ULw2hJzceziyMTtRCcewkyMEspgULlyRnTfHQR0+sTaOtYKEcqFrNQn0VC1ejp7149GQO41nYbMtj72PqD01xoWljuTKz0NgYPXktXHiuPDl+kQHgPqb+UF6o0whV9/7Qgtqm6GnosL4v5i9rg0t/HmrdQd/hnrHZcFwLeV8c9X9Of9Cd039l+tTxNhoNZygvNHXPP3h89BvY7w7q8vSNc2tj9DSa3j0NhyOgE2LM57hLG5R6cTQcnt1N78WxWrFzdjZ8uS+yyr9wR9gZTRo8n+46E3mhYefu6aU9ob+T0VwRNjosV8X79vDsaYo2Sk/UETHGGcw7hXrf46aUMmFsQUUt01/QH5iEdWXyCiOhRhxLPb2x2MxrXhIxnKTrfDnTDdITc8SThXDFyGES5rXBfT9AvzYK+6ITeQpwwo1XFD88vI+edDRq+lr9nrZ/MMUMG0H6O04bBSLPDM98m/pDkPIm6Am+qDtcl8zuUn/bCpq5N+uy4E2xmuK/ndYZDEAeS5FFTbTc3PPXdizzQ+jpzCXutiDaZ9cE3kM2RzHozt075Ehbex7OmJ1k5pBHg6oPodYXfXPN9qn6pX7/xqGo2PRERZfYGcDKMnF72mRvos9ruyDUmgLZizFDYudifgFz4pZwcwJkTxToKj+lehM3RU9URGO3S+HCnPW1Xcx6ahbGj5T+KQHyjgDg6jfHPuTJFB+UMefDWV8benCf3bM3jD3FpycmuJ0olyZ0+z8hUN19jde5QaqutKXRBa6+CU2l37z0q4+UX3GeDCh7hC/oKZUzdu6857eWptXoKePpTaw/sm82iftdF4MNwg7opxidiIeo/sjik7C2T/HFkPrjeeSRvYmtDlQt/fopDYCTprTbt4B5j82eKZ2cnLBJNHSzIJbQSvQkRWZirc+/2aTGIdiAEbvL1MDF3kRWXNQNApc1HML2sg63xutiELP4iU6Z+CLGLfjIDLfWufN/0GPv52/R6f/gSvSkxp6oiTWoecaemLKeazIDgyiG6jdFE0fq83IwGqz/eEEZmMV+rf66OPZEvRP1Y37l/W9Lks/CcHraL+f/NLyvMr3KMSBdjgeO+Ly+odOFgRQDu+cj/m14Nbo2Mele0j7vgkDksfoDPt0OSAv5uJUFOucd6FeGB8ss/BsIE35QVxJBT1eVLCYzkfUmCr8k6cjJcb9svSAtkGJ0MuSirspQzFTQ20HKTJyMdC5KmhqYYm8baT7lHIljIVeu5itHEfTExvHv/d9dkjMV5Lj8vS77GpfMiZB82Rx6+xojYpq00DFDIl6sMmQXGlELCr5BLj89GThbOYKuOAOTF6fOkpqLsYxi9LbUH8YcPzptcv1zM0SZ7C9xNL/9zZV5LSxqofSUIz/sfDUITEbjU5bGw5gU0xb6py96rPEj/U6oj0Nx6XD36OiIvXZyNNvuerZHVzxaQJy1b6Nm7iFaTSvXMGTaN1oBauSLIqHTr4NmY8u3SkK4jO5llQ7OXkHxi1z5usK/yBM+c0+DN3YWnxAVxD9/Mt5qYo8W4U//3vmZeyTHZzDCxEzGW0UUM0eL0TP3ADrmJoK1vAb1sSIosZmjhaXvPUE+D/UAIT1B7y7FEc0DlvGrGO89wSt6K8r4iE/i0mYzqj1zJJMm0saLdYXL2Tw+BHHeezJLbNn0Cr45PCmylKP/vovt92SKJ1c3uMKyfBJgjvCl/nEcpO8zG23xUkMaEnvhoowPjPjvPZHiAT1sHS8uf0xiL83s50BopF0cx8nRtsXJ9c1nF03s9O2oJF5DW2nVCPYsT1hFpz9l6JY+zyiRIiHs/bW3rhohfamauJBM8eNWjUimuIGv5SZMFJ4mGe8ubURc56oRyRQ38LXchIkb+Fpu0sQNfC03YeI/IFpsV41IfRK+dC2r2yVTXPfXcpMnrvlruQkU1/q13ESKa11zL5niPyAebukp7eKWntIvbunpC4j/gGixpafUJ+FLP51xtvS0pactPYHPZ5wtPb0jHn55C/8fp0YNL3RY5ioAAAAASUVORK5CYII="/>
          </center>
    
          <spacer size="16"></spacer>
    
          <h1 class="text-center">Recuperação de Senha</h1>
          
          <spacer size="16"></spacer>
    
          <p class="text-center">It happens. Click the link below to reset your password.</p>
          <button class="large expand" href="#">${numero}</button>
    
          <hr/>
    
          <p><small>  Esse email é automatico, nao responda!!! </small></p>
        </columns>
      </row>
    
      <spacer size="16"></spacer>
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














