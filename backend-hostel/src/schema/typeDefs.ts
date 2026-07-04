export const typeDefs = /* GraphQL */ `
  type Query {
    health: String!
    me: MeResult
     posts: [Post!]!
      post(id: ID!): Post
     comments(postId: String!): [Comment!]!
     reports: [Report!]!
  }
    

  type MeResult {
    displayId: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    displayId: String!
  }
    type Post {
    id: ID!
    content: String!
    authorDisplayId: String!
    createdAt: String!
  }
    type Comment {
    id: ID!
    content: String!
    authorDisplayId: String!
    createdAt: String!
  }
     type Report {
    id: ID!
    targetType: String!
    targetId: String!
    reason: String!
    status: String!
    createdAt: String!
  }


  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createPost(content: String!): Post!
    createComment(postId: String!, content: String!): Comment!
    deletePost(postId: String!): Boolean!
    deleteComment(commentId: String!): Boolean!
    banUser(userId: String!): Boolean!
    reportContent(targetType: String!, targetId: String!, reason: String!): Report!
  }
`;