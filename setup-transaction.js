// Prepara el escenario: producto "mate-calabaza" con stock = 5
const { MongoClient } = require("mongodb");

async function setup() {
  const client = new MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0");
  try {
    await client.connect();
    const db = client.db("ecommerce");
    await db.collection("productos").deleteMany({});
    await db.collection("pedidos").deleteMany({});
    await db.collection("productos").insertOne({
      _id: "mate-calabaza", nombre: "Mate de Calabaza Tradicional", precio: 15000, stock: 5
    });
    console.log("¡Base de datos preparada exitosamente!");
    console.log("Producto cargado: Mate de Calabaza Tradicional (Stock: 5)");
  } catch (err) {
    console.error("Error al preparar la base de datos:", err.message);
  } finally {
    await client.close();
  }
}
setup();
