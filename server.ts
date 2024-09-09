import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from 'dotenv';
config();
import user from './src/modules/user/user.routes';
import { dbConnect } from './src/config/db';
import { connectSocket } from './src/modules/socket/socket';
const { PORT } = process.env;

(async () => {
    const app = express();
    app.set('trust proxy', true); // correctly retrieve the IP from x-forwarded-for
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: "*" }));
    app.use('/user', user);
    
    await dbConnect();
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    })

    connectSocket(server);

})();


