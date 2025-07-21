const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

require("dotenv").config({ path: ".env.local" });

async function testUnaccent() {
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // Verificar si la extensión unaccent está instalada
    console.log("🔍 Verificando extensión unaccent...");
    const extensions = await client`
      SELECT extname 
      FROM pg_extension 
      WHERE extname = 'unaccent'
    `;

    if (extensions.length > 0) {
      console.log("✅ Extensión unaccent está instalada");

      // Probar la función unaccent
      console.log("\n🧪 Probando función unaccent:");
      const test = await client`
        SELECT 
          'café' as original,
          unaccent('café') as sin_acentos,
          'José María' as original2,
          unaccent('José María') as sin_acentos2
      `;

      console.log("Resultados:", test[0]);
    } else {
      console.log("❌ Extensión unaccent NO está instalada");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

testUnaccent();
