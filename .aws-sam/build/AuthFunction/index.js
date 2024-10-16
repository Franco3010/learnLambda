import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  console.log(">>>>>>testttt", "zzzzzzzzzzzzz");
  let body;

  try {
    switch (event.httpMethod) {
      case "POST":
        if (event.path === "/auth/login") {
          body = await login(event); // POST /auth/login
        } else if (event.path === "/auth/register") {
          body = await register(event); // POST /auth/register
        }
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    console.log(body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully finished operation: "${event.httpMethod}"`,
        body: body,
      }),
    };
  } catch (e) {
    console.error(">>>>>>>this is error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const register = async (event) => {
  console.log(`register function. event : "${event}"`);
  try {
    const registerRequest = JSON.parse(event.body);
    // set productid
    const hashPassword = await bcryptjs.hash(registerRequest.password, 10);
    registerRequest.id = uuidv4();
    registerRequest.password = hashPassword;

    console.log("registerRequest", registerRequest);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME || "user",
      Item: marshall(registerRequest || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));

    console.log(createResult);
    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const login = async (event) => {
  console.log(`login function. event : "${event}"`);

  const loginRequest = JSON.parse(event.body);

  if (!loginRequest.username || !loginRequest.password) {
    throw new Error("Username and password are required");
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME || "user",
    FilterExpression: "#username = :username",
    ExpressionAttributeNames: {
      "#username": "username",
    },
    ExpressionAttributeValues: marshall({
      ":username": loginRequest.username,
    }),
  };

  const { Items } = await ddbClient.send(new ScanCommand(params));
  console.log(">>>>>>Items", Items);
  if (!Items || Items.length === 0) {
    throw new Error("User not found");
  }

  const isPasswordMatch = bcryptjs.compare(
    loginRequest.password,
    Items[0].password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ username: loginRequest.username }, "secret", {
    expiresIn: "1h",
  });
  return { token };
};
