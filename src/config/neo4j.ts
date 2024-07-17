import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'neo4j+s://b641f24a.databases.neo4j.io',
  // 'bolt://127.0.0.1:7687',
  neo4j.auth.basic('neo4j', '8n2HGgKPToBlAoVr1GlTD2ry4Ue9yH3kCH60fUgeO20')
);
driver.getServerInfo().then(serverInfo => {
  console.log("serverInfo----", serverInfo);
}).catch(error => {
  console.error("Error getting server info:", error);
});
const session = driver.session({database:'neo4j'});
// console.log("session ---", session)
export {
  driver,
  session
};