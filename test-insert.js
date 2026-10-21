// Prueba simple de escritura contra el Replica Set
const { MongoClient } = require("mongodb");

async function runTest() {
  const uri = "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("¡Conectado al Replica Set para la prueba de escritura!");
    const resultado = await client.db("testPráctico").collection("registros").insertOne({
      alumno: "Julieta",
      materia: "Base de Datos III",
      estado: "Prueba exitosa de replicación",
      fecha: new Date()
    });
    console.log("¡Documento insertado con éxito! ID:", resultado.insertedId);
  } catch (err) {
    console.error("Error en la inserción:", err);
  } finally {
    await client.close();
  }
}
runTest();
