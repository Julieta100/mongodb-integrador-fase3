// Inicializa el Replica Set "rs0": Primario (27017), Secundario (27018), Árbitro (27019)
const { MongoClient } = require("mongodb");

async function initReplicaSet() {
  // directConnection: el set todavía no existe, así que nos conectamos directo al nodo 1
  const client = new MongoClient("mongodb://localhost:27017/?directConnection=true");
  try {
    await client.connect();
    const result = await client.db("admin").command({
      replSetInitiate: {
        _id: "rs0",
        members: [
          { _id: 0, host: "localhost:27017", priority: 2 },      // Primario preferido
          { _id: 1, host: "localhost:27018", priority: 1 },      // Secundario
          { _id: 2, host: "localhost:27019", arbiterOnly: true } // Árbitro (solo vota)
        ]
      }
    });
    console.log("¡Replica Set inicializado con éxito!", result);
  } catch (err) {
    console.error("Error al inicializar:", err);
  } finally {
    await client.close();
  }
}
initReplicaSet();
