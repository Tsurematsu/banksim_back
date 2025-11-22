import "dotenv/config.js";
import express from 'express'
import cors from 'cors'
import AppDataSource from './database.js'
import CryptoManager from "./tools/CryptoManager.js";
import TokenManager from "./tools/TokenManager.js";
import Usuario from "./models/Usuario.js";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.token = token;
    next();
  } else {
    return res.json({ success:false, msg: "error, token invalido" })
  }
  return next();
};

const app = express()
app.use(cors())
app.use(express.json())


app.get('/api', async (req, res) => {
  console.clear()
  return res.json({ message: 'API funcionando' })
});

app.get('/api/test', (req, res) => {
  return res.json({ msg: 'prueba de api' })
});

app.post('/api/register', async (req, res) => {
  await AppDataSource.initialize();
  console.clear()
  try {
    const {
      email, 
      fullname, 
      password
    } = req.body;
  
    const replyObj = {
      email,
      fullname,
      password_hash:CryptoManager.hashPassword(password),
    }
  
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = usuarioRepo.create(replyObj);
    await usuarioRepo.save(usuario);
    delete replyObj.password_hash
    const token = TokenManager.create(replyObj, 6200);
    return res.json({ success:true, token })
  } catch (error) {
    return res.json({ success:false, msg: "el usuario ya existe" })
  }
});


app.post('/api/login', async (req, res) => {
  await AppDataSource.initialize();
  try {
    const {
      email,  
      password
    } = req.body;
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOneBy({ email });
    if (!usuario) throw new Error("El usuairo no existe");
    const validate = CryptoManager.verifyPassword(password, usuario.password_hash)
    if (!validate) throw new Error("Contraseña invalida");
    const token = TokenManager.create({
      email,
      fullname: usuario.email,
    }, 6200);
    return res.json({ success:true, msg: "ok", token })
  } catch (error) {
     return res.json({ success:false, msg: "error, usuario o email inválidos" })
  }
})

app.get('/api/account', auth, async (req, res) => {
  const token = req.token
  const validToken = TokenManager.validate(token)
  try {
    if (!validToken) throw new Error("false");
    const dataToken = TokenManager.decode(token)
    delete dataToken.exp;
    return res.json({ msg: 'Hello!! welcome to account', data:dataToken })
  } catch (error) {
    return res.json({ success:false, msg: "error, token invalido" })
  }  
});

export default app