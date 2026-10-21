// ESCENARIO DE ÉXITO: compra de 2 unidades.
// Descontar stock + crear pedido deben ocurrir juntos (atomicidad) o no ocurrir.
const { MongoClient } = require("mongodb");

async function runTransactionTest() {
  const client = new MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0");
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const session = client.startSession();          // las transacciones viven dentro de una sesión
    try {
      session.startTransaction();                   // BEGIN
      const productId = "mate-calabaza";
      const cantidadComprada = 2;

      // 1. Leer stock DENTRO de la transacción (snapshot isolation)
      const producto = await db.collection("productos").findOne({ _id: productId }, { session });
      if (!producto || producto.stock < cantidadComprada) {
        throw new Error("¡Stock insuficiente! Abortando transacción.");  // regla de negocio
      }

      // 2. Descontar stock
      await db.collection("productos").updateOne(
        { _id: productId }, { $inc: { stock: -cantidadComprada } }, { session });

      // 3. Crear el pedido
      const r = await db.collection("pedidos").insertOne(
        { productoId: productId, cantidad: cantidadComprada, fecha: new Date(), estado: "Confirmado" },
        { session });
      console.log("Pedido creado con ID:", r.insertedId);

      await session.commitTransaction();            // COMMIT: ambos cambios se hacen visibles a la vez
      console.log("--- ¡TRANSACCIÓN EXITOSA (COMMIT) ---");
    } catch (error) {
      await session.abortTransaction();             // ROLLBACK: se descarta todo lo hecho
      console.error("--- ERROR EN LA TRANSACCIÓN. SE APLICÓ ROLLBACK (ABORT) ---");
      console.error("Motivo:", error.message);
    } finally {
      await session.endSession();
    }
  } catch (err) {
    console.error("Error de conexión:", err.message);
  } finally {
    await client.close();
  }
}
runTransactionTest();
