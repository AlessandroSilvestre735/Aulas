/* =====================================================================
   DB — conexão MongoDB reutilizável entre invocações da função serverless.
   Em serverless, invocações "quentes" reaproveitam a mesma conexão.
   ===================================================================== */
"use strict";
const { MongoClient } = require("mongodb");
const config = require("./config");

let clientPromise = globalThis.__mongoClientPromise || null;

function client() {
  if (!clientPromise) {
    clientPromise = new MongoClient(config.mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    }).connect();
    globalThis.__mongoClientPromise = clientPromise;
  }
  return clientPromise;
}

async function getDb() {
  const c = await client();
  return c.db(config.dbName);
}

module.exports = { getDb };
