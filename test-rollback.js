// ESCENARIO DE FALLO: intenta comprar 10 unidades con stock = 3 -> viola la regla de negocio -> ROLLBACK
const { MongoClient } = require("mongodb");

async function runRollbackTest() {
  const client = new MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0");
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const session = client.startSession();
    try {
      session.startTransaction();
      const productId = "mate-calabaza";
      const cantidadComprada = 10;                  // excede el stock disponible (3)

      const producto = await db.collection("productos").findOne({ _id: productId }, { session });
      console.log(`Stock actual en la base: ${producto.stock}. Intentando comprar ${cantidadComprada}...`);

      if (!producto || producto.stock < cantidadComprada) {
        throw new Error("¡Stock insuficiente! Abortando transacción deliberadamente.");
      }
      // Nunca se ejecuta:
      await db.collection("productos").updateOne(
        { _id: productId }, { $inc: { stock: -cantidadComprada } }, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();             // ROLLBACK
      console.error("\n--- ¡FALLO CAPTURADO CON ÉXITO! SE APLICÓ ROLLBACK (ABORT) ---");
      console.error("Motivo:", error.message);
      console.error("-> La base de datos permanece intacta y no se modificó el stock.");
    } finally {
      await session.endSession();
    }
  } catch (err) {
    console.error("Error de conexión:", err.message);
  } finally {
    await client.close();
  }
}
runRollbackTest();
