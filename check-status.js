// Muestra el rol (PRIMARY / SECONDARY / ARBITER) de cada nodo
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI ||
  "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0";

async function checkStatus() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const status = await client.db("admin").command({ replSetGetStatus: 1 });
    console.log("\n--- ESTADO DEL REPLICA SET ---");
    status.members.forEach(m =>
      console.log(`Nodo [ID: ${m._id}] - Host: ${m.name} - Estado: ${m.stateStr}`));
  } catch (err) {
    console.error("Error al consultar el estado:", err.message);
  } finally {
    await client.close();
  }
}
checkStatus();
