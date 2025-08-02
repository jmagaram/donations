import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class DonationsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for static website hosting
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: false, // Use CloudFront for access
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT for production!
      autoDeleteObjects: true, // NOT for production!
    });

    // S3 bucket for application data (not a website)
    const dataBucket = new s3.Bucket(this, "DataBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT for production!
      autoDeleteObjects: true, // NOT for production!
      versioned: true,
    });

    // Lambda function for donations API
    const donationsHandler = new lambda.Function(this, "DonationsHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "donationsHandler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      environment: {
        BUCKET_NAME: dataBucket.bucketName,
        SHARED_SECRET: "MY_SHARED_SECRET", // Change this to your actual secret
      },
    });

    // API Gateway REST API for Lambda
    const api = new apigateway.LambdaRestApi(this, "DonationsApi", {
      handler: donationsHandler,
      proxy: false,
      restApiName: "Donations Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-Api-Key"],
      },
    });

    // /donations resource
    const donations = api.root.addResource("donations");
    donations.addMethod("GET");
    donations.addMethod("PUT");
    donations.addMethod("DELETE");

    // Grant Lambda read/write/delete access to the data bucket
    dataBucket.grantReadWrite(donationsHandler);

    // CloudFront Origin Access Control
    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      "OAC",
    );

    // CloudFront distribution for the S3 bucket
    const distribution = new cloudfront.Distribution(
      this,
      "WebsiteDistribution",
      {
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(
            websiteBucket,
            { originAccessControl },
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
      },
    );

    // Output the CloudFront URL
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, "WebsiteBucketName", {
      value: websiteBucket.bucketName,
    });

    // Output the data bucket name
    new cdk.CfnOutput(this, "DataBucketName", {
      value: dataBucket.bucketName,
    });

    // Output the Lambda function name
    new cdk.CfnOutput(this, "DonationsHandlerFunctionName", {
      value: donationsHandler.functionName,
    });

    // Output the API endpoint
    new cdk.CfnOutput(this, "DonationsApiUrl", {
      value: api.url + "donations",
    });
  }
}
