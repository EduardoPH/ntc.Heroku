
import nodemailer from 'nodemailer'

const sender = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: 'newtimecorporationnsf@gmail.com', 
    pass: 'NTC-NTCNS',
  },
});


async function enviarEmail(para, assunto, mensagem) {
  const r = await sender.sendMail({
    from: '"NTC INSF" <newtimecorporationnsf@gmail.com>',
    to: para, 
    subject: assunto,
    html: mensagem
  })
  return r;
}


export default enviarEmail;