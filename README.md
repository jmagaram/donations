# Donations tracker

## Purpose

A web app for tracking a family's personal donations to various tax-deductible and non-tax-deductible organizations.

## Features

- Track list of organizations (name, tax-status, notes)
- Track donations (date, amount, notes, kind like pledge, budget, or paid)
- Simple reports for analysis and tax preparation
- Import (from CSV and backup JSON)
- Export (for spreadsheet analysis and backup JSON)
- Fuzzy searching by name, amount, date, etc.
- Persistent storage on an internet server (JSON, single file)
- Optimized for small mobile screens
- View data more flexibly on large desktop screens

## Technology

### Client

- React
- TypeScript

### Server

AWS, using the CDK to manage infrastructure and deployment.

- S3 for static website hosting
- S3 for storing application data (donations data)
- CloudFront Distribution: For serving the static website securely and efficiently via CDN.
- Lambda Function for handling API requests related to donations.
- API Gateway (REST API): For exposing the Lambda function as a RESTful API endpoint.
- SSM Parameter Store: For securely storing and retrieving the API shared secret.
- IAM Policies: For granting Lambda permissions to access S3 and SSM resources.

## To do
