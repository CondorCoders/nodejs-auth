import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;
// NOTA: En un proyecto real, el secret key debería estar en una variable de entorno
// y no hardcodeada en el código
const SECRET_KEY = "7ad78e54-b12f-4cd6-a3bc-1a8c39b770d9";

interface User {
  id: string;
  username: string;
  password: string;
}

interface UserPublic {
  id: string;
  username: string;
}

const user: User[] = [];

const loggerMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.log(
    `Middleware personalizado, método: ${req.method}, path: ${req.path}`,
  );
  next();
};

const validateCredentials = (
  username: string,
  password: string,
): string | null => {
  if (!username || !password) {
    return "Username y password son requeridos";
  }

  if (username.length < 3 || password.length < 6) {
    return "Username debe tener al menos 3 caracteres y password al menos 6 caracteres";
  }
  return null;
};

app.use((req, res, next) => {
  console.log(`Middleware global, método: ${req.method}, path: ${req.path}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Path simple
app.get("/", (req, res) => {
  res.json({ message: "Hola mundo" });
});

// Path con parámetros
app.get("/user/:id", loggerMiddleware, (req, res) => {
  const { id } = req.params;
  res.send(`Hola usuario con id ${id}`);
});

// Path con query parameters
app.get("/search", (req, res) => {
  const { category, day } = req.query;

  // Buscamos en la base de datos segun los parametros
  res.send(`Hola desde search, categoría: ${category}, día: ${day}`);
});

// Path con body

// Auth system
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).send(validationError);
  }

  if (user.find((u) => u.username === username)) {
    return res.status(400).send("Username ya existe");
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    password: bcrypt.hashSync(password, 10), // Encriptamos la contraseña
  };

  // Ingresar en la base de datos
  user.push(newUser);

  const newUserPublic: UserPublic = {
    id: newUser.id,
    username: newUser.username,
  };
  res.status(201).json(newUserPublic);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const validationError = validateCredentials(username, password);
  if (validationError) {
    return res.status(400).send(validationError);
  }
  const existingUser = user.find((u) => u.username === username);

  if (!existingUser) {
    return res.status(400).send("Usuario no encontrado");
  }

  const passwordMatch = bcrypt.compareSync(password, existingUser.password);

  if (!passwordMatch) {
    return res.status(400).send("Contraseña incorrecta");
  }

  const userPublic: UserPublic = {
    id: existingUser.id,
    username: existingUser.username,
  };

  // Aquí podríamos generar un token JWT para autenticación
  const token = jwt.sign(
    { id: existingUser.id, username: existingUser.username },
    SECRET_KEY,
    { expiresIn: "1h" },
  );

  res
    .cookie("access_token", token, {
      httpOnly: true, // no es accesible desde JavaScript
      secure: false, // solo se envía por HTTPS
      sameSite: "strict", // no se envía en solicitudes cross-site
    })
    .json({ message: "Login exitoso", user: userPublic });
});

app.get("/profile", (req, res) => {
  console.log(req.cookies);
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).send("No autenticado");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as UserPublic;
    res.json({ message: "Perfil del usuario", user: decoded });
  } catch (err) {
    res.status(401).send("Token inválido");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("access_token").json({ message: "Logout exitoso" });
});

app.listen(PORT, () => {
  console.log(`Hola mundo estamos en el puerto ${PORT}`);
});
