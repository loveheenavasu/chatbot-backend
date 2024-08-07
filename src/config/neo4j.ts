import neo4j from 'neo4j-driver';
import * as Handler from '../handler/handler';
import { IErrorResponse } from '../handler/error';
import { config } from 'dotenv';
config();
const NEO_URL = process.env.NEO_URL as string;
const NEO_USERNAME = process.env.NEO_USERNAME as string;
const NEO_PASSWORD = process.env.NEO_PASSWORD as string;

const driver = neo4j.driver(NEO_URL, neo4j.auth.basic(NEO_USERNAME, NEO_PASSWORD));

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