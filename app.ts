import express from "express";

const app = express();
const PORT = 3000;

interface User {
  id: number;
  username: string;
  password: string;
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

app.use((req, res, next) => {
  console.log(`Middleware global, método: ${req.method}, path: ${req.path}`);
  next();
});

app.use(express.json());

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
  res.send(`Hola ${username}, tu contraseña es ${password}`);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.send(`Hola ${username}, tu contraseña es ${password}`);
});

app.post("/logout", (req, res) => {
  res.send("Logout exitoso");
});

app.listen(PORT, () => {
  console.log(`Hola mundo estamos en el puerto ${PORT}`);
});
