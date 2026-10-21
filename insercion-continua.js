// Inserta un documento por segundo en el Replica Set.
// Se usa durante la prueba de failover: mientras corre, se mata el proceso del Primario.
// retryWrites + writeConcern majority => el driver reintenta la escritura cuando hay nuevo Primario.
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI ||
  "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0&retryWrites=true";

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  await client.connect();
  const col = client.db("testFailover").collection("registros");
  for (let i = 1; ; i++) {
    try {
      const r = await col.insertOne({ n: i, ts: new Date() }, { writeConcern: { w: "majority" } });
      console.log(`[${new Date().toISOString()}] insert #${i} OK  id=${r.insertedId}`);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] insert #${i} FALLÓ: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
})();
