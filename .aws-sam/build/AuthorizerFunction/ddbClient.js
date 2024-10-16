// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Create an Amazon DynamoDB service client object.
// const ddbClient = new DynamoDBClient({
//   region: "localhost",
//   endpoint: "http://192.168.96.75:8000",
//   credentials: {
//     accessKeyId: "accessKeyId",
//     secretAccessKey: "secretAccessKey",
//   },
// });
const ddbClient = new DynamoDBClient({});
export { ddbClient };
