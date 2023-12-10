# Svelte con Express & Prisma

Esta fue mi forma de hacerlo, no creo que sea la forma mas optima pero es hasta donde mi conocimiento y mis apuntes pudieron llevarme

## Como lo logre

En esta parte decidi usar SQLite por su facilidad y rapidez

Despues de crear el proyecto con Svelte, instalamos estas dependencias extra

```sh
npm i -D prisma
npm i express
npm i cors
```

`@prisma/client` debe instalar en automatico con la instalacion de prisma, pero por si no se instala este es el comando

```sh
npm i @prisma/client
```

Luego tenemos que iniciar nuestro proyecto de `prisma`

```sh
npx prisma init --datasource-provider sqlite
```

Se nos creara una carpeta `prisma` con esta estructura

```txt
📦Svelte_CRUD
 ┗ 📂prisma
    ┗ 📜schema.prisma
```

En el archivo `schema.prisma` [crearemos nuestro modelo](https://github.com/Wilovy09/Prisma-Curso-ORM/blob/main/README.md)

```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Aqui va nuestro modelo, para ponder datos que no son obligatorios usamos '?'
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  fullname  String?
  user      String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

Haremos la migracion

```sh
npx prisma migrate dev
```

Ahora si podemos iniciar nuestra API

Crearemos una carpeta `server` a la misma altura que la carpeta `src` del proyecto de Svelte

La carpeta server debe contener la sig estrucutra

```txt
📦Svelte_CRUD
 ┣ 📂server
 ┃ ┣ 📂routes
 ┃ ┃ ┗ 📜user.routes.js
 ┃ ┣ 📜db.js
 ┃ ┗ 📜index.js
 ┃
 ┗ 📂src
```

En el archivo `db.js` crearemos nuestra instancia de `prisma`

```js
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

En el archivo `index.js` pondremos nuestra configuracion de `CORS` y `Express`

```js
import express from 'express';
import cors from 'cors';
// importamos nuestro archivo de rutas
import userRoutes from './routes/user.routes.js';

// iniciamos express
const app = express();

// configuramos CORS
app.use(cors({
    // queremos aceptar peticiones del puerto 5173 (donde se aloja nuestro front)
    "origin":"http://localhost:5173",

    // y solo aceptaremos estos metodos
    "methods":"GET,HEAD,PUT,POST,DELETE",
}))

// queremos que use json
app.use(express.json());

// queremos que todas nuestras rutas empiecen por /api/RUTA
app.use('/api', userRoutes);

// Aqui establecemos que queremos que la api este en el purto 8000
app.listen(8000)
```

Y por ultimo pero no menos importante, crearemos nuestras rutas CRUD para hacer las peticiones desde nuestro frontend

En el archivo `user.routes.js` agregaremos las rutas que necesitemos

```js
// Esta es la base, sin esto no funcionan las rutas
import { Router } from "express";
import { prisma } from "../db.js"

const router = Router();

// AQUI AGREGAREMOS NUESTRAS RUTAS SEGUN SEA NECESARIO

export default router;
```

### GET - Obtener todos los usuarios

```js
// Queremos que la peticion se haga a /users osea .../api/users
// Usamos el item `router` con nuestra peticion `router.get`
// Queremos que sea async y le pasamos req & res
router.get('/users', async (req, res) =>{
    //                            user = Modelo que creamos
    // usamos nuestro item prisma.user.findMany();
    const users = await prisma.user.findMany();
    // que nos responsa con un json con los datos que le devolvio users
    res.json(users);
})
```

### POST - Crear un nuevo ususario

```js
// Queremos que la peticion se haga a /user
router.post('/user', async (req,res)=>{
    // .create es para crear datos en nuestra DB
    const newUser = await prisma.user.create({
        // la data que le pasaremos vendra del body de la request
        data: req.body,
    })
    // respondemos con los datos que nos devuelve newUser
    res.json(newUser);
})
```

### GET - Obtener usuario por ID

```js
// Aqui pasamos /:id en nuestra ruta para referirnos a ese dato ID
router.get('/users/:id', async (req,res)=>{
    // Devolvemos el primer match que haga cuando encuentre esa ID
    const userFound = await prisma.user.findFirst({
        // aqui le decimos que datos queremos buscar
        where:{
            // aqui pasamos de str a int nuestro id
            id: parseInt(req.params.id),
        },
    })
    // si no encuentra el user
    if (!userFound)
        // regresa un status 400 con un json que diga error: User not found
        return res.status(404).json({error: "User not found"})
    
    // Si si lo encuentra que regrese un json con el dato encontrado
    res.json(userFound);
})
```

### DELETE - Eliminar usuario

Es muy similar a la peticion anterior solo que ahora usaremos delete como `request` no usaremos `get`

```js
// peticion .delete
router.delete('/user/:id', async (req,res)=>{
    const userDeleted = await prisma.user.delete({
        where:{
            id: parseInt(req.params.id),
        }
    })
    if (!userDeleted)
        return res.status(404).json({error: "User not found"})
    
    res.json(userDeleted);
})
```

### PUT - Actualizar usuario

Esto es una combinacion de crear usuario y buscar por id

```js
// peticon PUT
router.put('/user/:id', async (req,res)=>{
    const userUpdated =  await prisma.user.update({
        // busca esta ID
        where:{
            id: parseInt(req.params.id),
        },
        // Estos son los datos que queremos cambiar, los sacara del request body
        data: req.body,
    })
    if (!userUpdated)
        return res.status(404).json({error: "User not found"})

    return res.json(userUpdated);
})
```

Y listo esas son las rutas que necesitaremos por el momento, ahora tendremos que ir a nuestro `frontend`

Esta sera la estructura de carpetas/archivos con los que terminaremos, recomiendo crearla en estos momento

```txt
📦Svelte_Login
 ┗ 📂src
    ┣ 📂lib
    ┣ 📂routes
    ┃ ┣ 📂[id]
    ┃ ┃ ┣ 📂deleteUser
    ┃ ┃ ┃ ┣ 📜+page.js
    ┃ ┃ ┃ ┗ 📜+page.svelte
    ┃ ┃ ┣ 📂updateUser
    ┃ ┃ ┃ ┣ 📜+page.js
    ┃ ┃ ┃ ┗ 📜+page.svelte
    ┃ ┃ ┣ 📜+page.js
    ┃ ┃ ┗ 📜+page.svelte
    ┃ ┣ 📂createUser
    ┃ ┃ ┗ 📜+page.svelte
    ┃ ┗ 📜+page.svelte
    ┗ 📜app.html
```

### Svelte - GET - Obtener todos los usuarios

```html
<script>
    // Importamos onMount para el momento en el que se muestre la pagina
    // haga ciertas acciones
    import { onMount } from 'svelte'

    // declaramos users como una lista
    let users = [];
    
    // declaramos una constante que contenta nuesta url
    // es a donde haremos fetch
    const url = 'http://localhost:8000/api/users/';

    // creamos una constante con una funcion flecha que sea asyncrona
    const getUsers = async ()=>{
        // intenta
        try{
            // constantes que guarda el valor de fetch
            const response = await fetch(url);
            // users es igual a la respuesta JSON del fetch
            users = await response.json();
        // Si no es posible regrea un error  
        } catch (error){
            console.error('Error fetching users:', error);
        }
    }

    // cuando se muestre la pagina ejecuta...
    onMount(()=>{
        // la funcion que creamos
        getUsers();
    });
</script>

<h1>USERS</h1>

<!-- Por cada user en users -->
{#each users as user}
    <div>
        <!-- extraemos los datos que queremos -->
        <h2>{user.user}</h2>
        <h2>{user.fullname}</h2>
        <p>{user.email}</p>
        <!-- aqui hacmos enlace para nuestra sig pagina -->
        <a href="/{user.id}/">Ver perfil</a>
    </div>
{/each}
```

### Svelte - POST - Crear usuario

Nos dirijimos a nuestro archivo `[id]/createUser/+page.svelte`

```html
<script>
    // Con esto hacemos redirecciones
    import { goto } from '$app/navigation';

    // creamos variables para los inputs del form
    let user = '';
    let fullname = '';
    let email = '';
    let password = '';

    // aqui validamos los datos ingresados en los inputs
    let validFields = () => {
        return user.trim().length > 0 && fullname.trim().length > 3 && email.trim().length > 5 && password.trim().length > 2;
    };

    // cuando se haga SUBMIT
    let handleSubmit = async () => {
        // si no pasa la validacion no avanzamos
        if (!validFields()) {
            alert('Campos inválidos');
            return;
        }

        // igualamos a el valor de los inputs
        const trimmedUser = user.trim();
        const trimmedFullname = fullname.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // creamos lo que ira nuestro BODY del request
        // Igualamos los datos que actualizaremos con los valores de su input
        const data = {
            email: trimmedEmail,
            password: trimmedPassword,
            fullname: trimmedFullname,
            user: trimmedUser
        };

        // fetch
        const url = 'http://localhost:8000/api/user';

        try {
            // Configuramos el metodo que usaremos
            const opciones = {
                // POST
                method: 'POST',
                // Avisamos que llevamos datos
                headers: {
                    'Content-Type': 'application/json'
                },
                // Nuestro body es igual a nuestra constante data
                body: JSON.stringify(data)
            };

            // hacemos fetch
            const response = await fetch(url, opciones);

            // si todo sale bien
            if (response.ok) {
                // guardamos la respuesta
                const responseData = await response.json();
                // redireccionamos a inicio
                goto('/');
            } else {
                throw new Error('Error en la llamada AJAX');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
</script>

<h2>Create User</h2>

<!-- Creamos un form -->
<!-- cuando se haga submit|evitamos el comportamiento habitual y lo rederijimos a nuestra funcion handleSubmit -->
<form on:submit|preventDefault={handleSubmit}>
    <div class="">
        <label for="user">User</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={user} type="text" id="user" name="user" placeholder="User">
    </div>
    <br>
    <div class="">
        <label for="fullname">Full Name</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={fullname} type="text" id="fullname" name="fullname" placeholder="Full Name">
    </div>
    <br>
    <div class="">
        <label for="email">Email</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={email} type="email" id="email" name="email" placeholder="Email">
    </div>
    <br>
    <div class="">
        <label for="password">Password</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={password} type="password" id="password" name="password" placeholder="Password">
    </div>
    <br>
    <!-- BTN para hacer SUBMIT -->
    <button type="submit">Create User</button>
</form>
```

### Svelte - GET - Obtener usuario por ID

En el archivo `[id]/+page.js` capturaremos nuestra ID

```js
export function load({ params }) {
    return {
        id: params.id
    };
}
```

Y en el archivo `[id]/+page.svelte` haremos la request, ya sabemos para que sirven varios elementos que usaremos asi que explicare los nuevos

```html
<script>
    import { onMount } from 'svelte'

    // data es donde se almacena la id que capturamos anteriormente en el +page.js
    export let data;
    let user;
    
    
    onMount(async function(){
        // hacemos nuestra request pero para asignar el valor de nuestra ID
        // Usaremos un template string `` con ${data.id}
        const url = `http://localhost:8000/api/users/${data.id}`;
        let response = await fetch(url);
        if (response.ok){
            user = await response.json();
        } else {
            console.error('Error fetching user:', response.status);
        }
    })
    
</script>

<h1>USER</h1>

<!-- Si si existe usuario -->
{#if user}
    <div>
        <!-- Extraemos la informacion que queremos -->
        <h2>{user.user}</h2>
        <h2>{user.fullname}</h2>
        <p>{user.email}</p>

        <!-- Conectamos con la pagina para editar el usuario -->
        <a href="/{user.id}/updateUser/">Editar perfil</a>
        
        <!-- Conectamos con la pagina para eliminar el usuario -->
        <a href="/{user.id}/deleteUser/">Eliminar perfil</a>
    </div>
{/if}
```

### Svelte - DELETE - Eliminar usuario

Nos vamos a nuestro archivo `[id]/deleteUser/+page.js`

```js
export function load({ params }) {
    return {
        id: params.id
    };
}
```

Nos vamos a nuestro archivo `[id]/deleteUser/+page.svelte`

```html
<script>
    import { onMount } from 'svelte'
    
    // esto es para redireccionar de pagina
    import { goto } from '$app/navigation';
    
    export let data;

    onMount(async ()=>{
        try {
            const url = `http://localhost:8000/api/user/${data.id}`;
            // Aqui agregamos nuestro metodo que usaremos para nuestra request
            const opciones = {method: 'DELETE',};
            
            // Hacemos fetch con nuestra url y opciones
            const response = await fetch(url, opciones);

            if (response.ok) {
                const responseData = await response.json();
                goto('/');
            } else {
                throw new Error('Error en la llamada AJAX');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })
</script>
```

### Svelte - PUT - Actualizar usuario

Nos iremos a nuesto archivo `[id]/updateUser/+page.js`

```js
export function load({ params }) {
    return {
        id: params.id
    };
}
```

`[id]/updateUser/+page.svelte`

Este paso puede ser un poco mas complicado, pero es solo la combinacion de 2 elementos

```html
<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data;
    // Creamos las variables que usaremos en el formulario
    let user = '';
    let fullname = '';
    let email = '';
    let password = '';

    // igualamos nuesta variable id al id que capturamos en data
    let id = data.id;

    // esto lo usaremos para rellenar los inputs del form con el valor actual
    let userPREV;

    // con esto validaremos los datos ingresados
    let validFields = () => {
        return user.trim().length > 0 && fullname.trim().length > 3 && email.trim().length > 5 && password.trim().length > 2;
    };

    // Cuando se haga SUBMIT
    let handleSubmit = async () => {
        // Si no pasan la validacion, no avanzamos    
        if (!validFields()) {
            alert('Campos inválidos');
            return;
        }

        // igualamos con los valores que tienen los input
        const trimmedUser = user.trim();
        const trimmedFullname = fullname.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // este es nuestro BODY
        // igualamos los parametros del body con las variables nuevas
        const data = {
            email: trimmedEmail,
            password: trimmedPassword,
            fullname: trimmedFullname,
            user: trimmedUser
        };

        // nuesta request
        const url = `http://localhost:8000/api/user/${id}`;

        try {
            // nuesta confiiguracion
            const opciones = {
                // el metodo que usaremos
                method: 'PUT',
                // el header para avisar que llevamos datos
                headers: {
                    'Content-Type': 'application/json'
                },
                // nuestro body igualado a la constante data
                body: JSON.stringify(data)
            };

            // hacemos fetch
            const response = await fetch(url, opciones);

            // si todo sale bien
            if (response.ok) {
                // guardamos el resultado en una variable
                const responseData = await response.json();
                // redirigimos a inicio
                goto('/');
            } else {
                throw new Error('Error en la llamada AJAX');
            }
        } catch (error) {
            console.error('Error:', error);
        }

    };

    // aqui obtendremos los datos para rellenar con los inputs con los datos antes de actualizar
    onMount(async function(){
        const url = `http://localhost:8000/api/users/${data.id}`;
        let response = await fetch(url);
        if (response.ok) {
            userPREV = await response.json();
            user = userPREV.user;
            fullname = userPREV.fullname;
            email = userPREV.email;
            password = userPREV.password;
        } else {
            console.error('Error fetching user:', response.status);
        }
    })
</script>

<h2>Create User</h2>

<!-- Creamos un form -->
<!-- cuando se haga submit|evitamos el comportamiento habitual y lo rederijimos a nuestra funcion handleSubmit -->
<form on:submit|preventDefault={handleSubmit}>
    <div class="">
        <label for="user">User</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={user} type="text" id="user" placeholder="User">
    </div>
    <br>
    <div class="">
        <label for="fullname">Full Name</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={fullname} type="text" id="fullname" placeholder="Full Name">
    </div>
    <br>
    <div class="">
        <label for="email">Email</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={email} type="email" id="email" placeholder="Email">
    </div>
    <br>
    <div class="">
        <label for="password">Password</label>
        <!-- enlazamos cada una de los valores con su variable -->
        <input bind:value={password} type="password" id="password" placeholder="Password">
    </div>
    <br>
    <!-- BTN para hacer SUBMIT -->
    <button type="submit">Create User</button>
</form>
```
