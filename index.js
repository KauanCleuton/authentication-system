// const express = require('express');
// const path = require('path');
// const app = express();

// const { addUser, comparePasswords, getUserByUsername, hashPassword, db } = require('./db')


// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use(express.urlencoded({ extended: true }));

// app.get('/', (request, response) => {
//   response.render('register');
// });

// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   const hashedPassword = await hashPassword(password)
//   addUser(username, hashedPassword)
//   res.redirect('/login');
// });

// app.get('/login', (request, response) => {
//   response.render('login');
// });

// app.post('/login', async (request, response) => {
//   const { username, password } = request.body;

//   const user = await getUserByUsername(username);

//   if (!user || !(await comparePasswords(password, user.password))) {
//     response.status(401).send('Credenciais inválidas.');
//   } else {
//     response.redirect('/dashboard');
//   }
// });

// app.get('/dashboard', (request, response) => {
//   response.render('dashboard');
// });

// app.listen(3000, () => {
//   console.log('Server is running');
// });

const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto'); // Importa o módulo 'crypto' para gerar a chave secreta
const app = express();
const db = require('./db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

const minhaChaveSecreta = crypto.randomBytes(32).toString('hex');


app.use(
  session({
    secret: minhaChaveSecreta,
    resave: false,
    saveUninitialized: false,
  })
);

app.get('/', (request, response) => {
  response.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await db.hashPassword(password);
    await db.addUser(username, hashedPassword);
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).send('Ocorreu um erro ao cadastrar o usuário.');
  }
});

app.get('/login', (request, response) => {
  response.render('login');
});

app.post('/login', async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await db.getUserByUsername(username);

    if (!user || !(await db.comparePasswords(password, user.password))) {
      response.status(401).send('Credenciais inválidas.');
    } else {

      request.session.username = username;
      response.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    response.status(500).send('Ocorreu um erro ao realizar o login.');
  }
});

app.get('/dashboard', (request, response) => {

  if (!request.session.username) {
    return response.redirect('/login');
  }

  response.render('dashboard', { username: request.session.username });
});


app.get('/logout', (request, response) => {

  request.session.destroy((err) => {
    if (err) {
      console.error('Erro ao realizar logout:', err);
      return response.status(500).send('Ocorreu um erro ao fazer logout.');
    }

    response.redirect('/login');
  });
});

app.listen(3000, () => {
  console.log('Server is running');
});
