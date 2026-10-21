// Conexión AUTENTICADA (debe funcionar) y conexión ANÓNIMA (debe ser rechazada)
const { MongoClient } = require("mongodb");
const nodes = "localhost:27017,localhost:27018,localhost:27019";
const pwd = encodeURIComponent(process.env.ADMIN_PWD || "CAMBIAR_ADMIN_PWD");

async function testSecureConnection() {
  const auth = new MongoClient(`mongodb://adminUser:${pwd}@${nodes}/?replicaSet=rs0&authSource=admin`);
  try {
    await auth.connect();
    const info = await auth.db("admin").command({ buildInfo: 1 });
    console.log("¡ÉXITO TOTAL! Conexión autenticada. Versión:", info.version);
  } catch (e) { console.error("Error de conexión segura:", e.message); }
  finally { await auth.close(); }

  const anon = new MongoClient(`mongodb://${nodes}/?replicaSet=rs0`);
  try {
    await anon.connect();
    await anon.db("ecommerce").collection("productos").find().toArray();
    console.log("⚠ PELIGRO: el acceso anónimo funcionó");
  } catch (e) { console.log("Acceso anónimo RECHAZADO ->", e.message); }
  finally { await anon.close(); }
}
testSecureConnection();
