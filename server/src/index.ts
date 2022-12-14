import'reflect-metadata';
import { MikroORM }  from "@mikro-orm/core";
import { __prod__ } from "./constants";
import micoConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import * as redis from 'redis';
// import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";



const main = async () => {  
    const orm = await MikroORM.init(micoConfig);
    await orm.getMigrator().up();   //get migrator restart

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({ legacyMode: true }) as any;
    await redisClient.connect();
    // console.log("redis connected",redisClient.isOpen);

    app.use(
        session({
        name:'qid',
        store: new RedisStore({ 
            client: redisClient,
            disableTTL: true,
            disableTouch: true
         }),
        cookie:{
            maxAge: 1000*60*60*24*365*10,  // 10 years
            httpOnly: true,
            sameSite: 'lax', // csrf
            secure: __prod__ // cookie only works in https
        },
        saveUninitialized: false,
        secret: "keyboard cat",
        resave: false,
        })
    );
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver,PostResolver,UserResolver],
            validate: false
        }),
        context:({req, res}): MyContext => ({em: orm.em, req, res}),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({
              // options
            }),
          ],
    });

    

    await apolloServer.start();
    apolloServer.applyMiddleware({app});

    app.listen(4000, ()=>{
        console.log('server started on local:4000')
    })
};

main().catch((err) => {
    console.error(err);
});


