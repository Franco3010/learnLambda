import { LambdaRestApi, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
  basketMicroservice: IFunction;
  orderingMicroservices: IFunction;
  authMicroservice: IFunction;
  authorizeMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);
    // Product api gateway
    this.createProductApi(
      props.productMicroservice,
      props.authorizeMicroservice
    );
    // Basket api gateway
    this.createBasketApi(props.basketMicroservice, props.authorizeMicroservice);
    // Ordering api gateway
    this.createOrderApi(
      props.orderingMicroservices,
      props.authorizeMicroservice
    );
    // Auth api gateway
    this.createAuthApi(props.authMicroservice);
  }

  private createTokenAuthorizer(
    authorizeMicroservice: IFunction,
    name: string
  ) {
    const tokenAuthorizer = new TokenAuthorizer(this, name, {
      handler: authorizeMicroservice,
    });
    return tokenAuthorizer;
  }

  private createProductApi(
    productMicroservice: IFunction,
    authorizeMicroservice: IFunction
  ) {
    // Product microservices api gateway
    // root name = product

    // GET /product
    // POST /product

    // Single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}

    const authorizer = this.createTokenAuthorizer(
      authorizeMicroservice,
      "productAuthorizer"
    );
    const apigw = new LambdaRestApi(this, "productApi", {
      restApiName: "Product Service",
      handler: productMicroservice,
      proxy: false,
    });

    const product = apigw.root.addResource("product");
    product.addMethod("GET", undefined, { authorizer }); // GET /product
    product.addMethod("POST", undefined, { authorizer }); // POST /product

    const singleProduct = product.addResource("{id}"); // product/{id}
    singleProduct.addMethod("GET", undefined, { authorizer }); // GET /product/{id}
    singleProduct.addMethod("PUT", undefined, { authorizer }); // PUT /product/{id}
    singleProduct.addMethod("DELETE", undefined, { authorizer }); // DELETE /product/{id}
  }

  private createBasketApi(
    basketMicroservice: IFunction,
    authorizeMicroservice: IFunction
  ) {
    // Basket microservices api gateway
    // root name = basket

    // GET /basket
    // POST /basket

    // // Single basket with userName parameter - resource name = basket/{userName}
    // GET /basket/{userName}
    // DELETE /basket/{userName}

    // checkout basket async flow
    // POST /basket/checkout

    const authorizer = this.createTokenAuthorizer(
      authorizeMicroservice,
      "basketAuthorizer"
    );
    const apigw = new LambdaRestApi(this, "basketApi", {
      restApiName: "Basket Service",
      handler: basketMicroservice,
      proxy: false,
    });

    const basket = apigw.root.addResource("basket");
    basket.addMethod("GET", undefined, { authorizer }); // GET /basket
    basket.addMethod("POST", undefined, { authorizer }); // POST /basket

    const singleBasket = basket.addResource("{userName}");
    singleBasket.addMethod("GET", undefined, { authorizer }); // GET /basket/{userName}
    singleBasket.addMethod("DELETE", undefined, { authorizer }); // DELETE /basket/{userName}

    const basketCheckout = basket.addResource("checkout");
    basketCheckout.addMethod("POST", undefined, { authorizer }); // POST /basket/checkout
    // expected request payload : { userName : swn }
  }

  private createOrderApi(
    orderingMicroservices: IFunction,
    authorizeMicroservice: IFunction
  ) {
    // Ordering microservices api gateway
    // root name = order

    // GET /order
    // GET /order/{userName}
    // expected request : xxx/order/swn?orderDate=timestamp
    // ordering ms grap input and query parameters and filter to dynamo db
    const authorizer = this.createTokenAuthorizer(
      authorizeMicroservice,
      "orderAuthorizer"
    );
    const apigw = new LambdaRestApi(this, "orderApi", {
      restApiName: "Order Service",
      handler: orderingMicroservices,
      proxy: false,
    });

    const order = apigw.root.addResource("order");
    order.addMethod("GET", undefined, { authorizer }); // GET /order

    const singleOrder = order.addResource("{userName}");
    singleOrder.addMethod("GET", undefined, { authorizer }); // GET /order/{userName}
    // expected request : xxx/order/swn?orderDate=timestamp
    // ordering ms grap input and query parameters and filter to dynamo db

    return singleOrder;
  }

  private createAuthApi(authMicroservice: IFunction) {
    const apigw = new LambdaRestApi(this, "authApi", {
      restApiName: "Auth Service",
      handler: authMicroservice,
      proxy: false,
    });

    const authRoot = apigw.root.addResource("auth");
    const loginAuth = authRoot.addResource("login");
    loginAuth.addMethod("POST"); // POST /auth/login

    const registerAuth = authRoot.addResource("register");
    registerAuth.addMethod("POST"); // POST /auth/register
    // expected request : xxx/register
    // ordering ms grap input and query parameters and filter to dynamo db
  }
}
