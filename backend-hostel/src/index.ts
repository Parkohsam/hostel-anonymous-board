import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from "./schema/typeDefs.ts";
import { healthResolvers } from "./schema/resolvers/health.resolvers.ts";
import { connectDB } from "./db.ts";
import { authResolvers } from "./schema/resolvers/auth.resolvers.ts";
import { createContext } from "./context/context.ts";
import { postResolvers } from "./schema/resolvers/post.resolvers.ts";
import { commentResolvers } from "./schema/resolvers/comment.resolvers.ts";
import { moderationResolvers } from "./schema/resolvers/modration.resolvers.ts";
import { reportResolvers } from "./schema/resolvers/reports.resolvers.ts";

async function startServer() {
  await connectDB();

  const app = express();
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
    })
  );

  const yoga = createYoga({
    schema: createSchema({
      typeDefs,
      resolvers: [healthResolvers, authResolvers, postResolvers, commentResolvers, moderationResolvers, reportResolvers],
    }),
    context: createContext,
    graphqlEndpoint: "/graphql",
  });

  app.use("/graphql", yoga);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
  });
}

startServer();