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
  var effect = "Deny";
  console.log("this is event", event);
  console.log(">>>>>>>>>>>>>>>>>hahahaha");
  //retrieve the token from the event
  var token = event.authorizationToken;

  try {
    // Giải mã token

    const decodedToken = jwt.verify(token, "secret");
    const username = decodedToken.username;

    // Kiểm tra username trong database
    const params = {
      TableName: "user", // Thay thế bằng tên bảng thực tế của bạn
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
    };

    const command = new ScanCommand(params);
    const response = await ddbClient.send(command);

    if (response.Items && response.Items.length > 0) {
      const user = unmarshall(response.Items[0]);
      if (!!user) {
        // Giả sử có trường 'active' để kiểm tra tài khoản có hợp lệ không
        effect = "Allow";
      }
    }
  } catch (error) {
    console.error("Error verifying token or querying database:", error);
  }

  // get the resource
  var resource = event.methodArn;

  //construct a response which basically it will be a policy
  var authResponse = {};
  authResponse.principalId = "user";
  var policyDocument = {};
  policyDocument.Version = "2012-10-17";
  policyDocument.Statement = [];
  var statement1 = {};
  statement1.Action = "execute-api:Invoke";
  statement1.Effect = effect;
  statement1.Resource = resource;
  policyDocument.Statement[0] = statement1;
  authResponse.policyDocument = policyDocument;

  // you could add some additional context like for example a tenant
  var context = {};
  context.tenant = "tenant1";
  authResponse.context = context;

  // return the response
  return authResponse;
};
