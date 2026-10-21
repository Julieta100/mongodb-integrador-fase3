// Crea el administrador general y el usuario de aplicación con privilegios mínimos.
// Las contraseñas vienen de variables de entorno (no las subas al repositorio).
const { MongoClient } = require("mongodb");
const ADMIN_PWD = process.env.ADMIN_PWD || "CAMBIAR_ADMIN_PWD";
const APP_PWD = process.env.APP_PWD || "CAMBIAR_APP_PWD";

async function createUsers() {
  const client = new MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0");
  try {
    await client.connect();
    // 1. Administrador general (gestión de usuarios + lectura/escritura global)
    try {
      await client.db("admin").command({
        createUser: "adminUser", pwd: ADMIN_PWD,
        roles: [{ role: "userAdminAnyDatabase", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" }]
      });
      console.log("-> Usuario 'adminUser' creado con éxito.");
    } catch (e) { console.log("-> 'adminUser' ya existía o arrojó aviso:", e.message); }

    // 2. Usuario de aplicación: readWrite SOLO sobre 'ecommerce'
    try {
      await client.db("ecommerce").command({
        createUser: "appUser", pwd: APP_PWD, roles: [{ role: "readWrite", db: "ecommerce" }]
      });
      console.log("-> Usuario de aplicación 'appUser' creado con éxito en la base 'ecommerce'.");
    } catch (e) { console.log("-> 'appUser' ya existía o arrojó aviso:", e.message); }
  } catch (err) {
    console.error("Error al crear usuarios:", err.message);
  } finally {
    await client.close();
  }
}
createUsers();
