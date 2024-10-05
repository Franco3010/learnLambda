// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({
  endpoint: "http://192.168.96.75:8000",
  region: "local-env",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
});
export { ddbClient };
