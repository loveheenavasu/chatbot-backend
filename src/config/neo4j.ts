import neo4j from 'neo4j-driver';
import * as Handler from '../handler/handler';
import { IErrorResponse } from '../handler/error';

const driver = neo4j.driver(
    'neo4j+s://b641f24a.databases.neo4j.io',
    neo4j.auth.basic('neo4j', '8n2HGgKPToBlAoVr1GlTD2ry4Ue9yH3kCH60fUgeO20')
);
const getServerInfo = async () => {
    try {
        const serverInfo = await driver.getServerInfo();
        console.log("serverInfo----", serverInfo);
    } catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
};

getServerInfo();

const session = driver.session({ database: 'neo4j' });
export {
    driver,
    session
};