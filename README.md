# Ex Libris API Proxy

API Proxy for Ex Libris Cloud Apps

## Introduction
This Lambda function provides an API proxy 

## Features
* CORS support
* Validation of Cloud App [authentication token](https://developers.exlibrisgroup.com/cloudapps/docs/api/events-service/#getAuthToken)
* Ability to limit allowed Cloud Apps and institutions (see [Configuration](#configuration) below)
* Retrieval of API key from a [Secret Manager](https://aws.amazon.com/secrets-manager/) secret based on the institution code pased in an `X-For-InstCode` header
* Proxy of API request and response to Alma

## Deployment to AWS
This function assumes it is being called by an API Gateway proxy. It also uses a Secret Manager secret, so the Lambda execution role should include read-only rights on the Secret Manager service.

## Configuration
The following optional environment variables are supported:
* `CLOUDAPP_AUTHORIZER_ALLOWED_APPS`: Comma separated list of allowed Cloud App IDs (Github username/repository name, i.e. ExLibrisGroup/alma-hathitrust-availability)
* `CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES`: Comma separated list of allowed institution codes (i.e. 01MYUNI_INST)
* `API_KEYS_SECRET_NAME`: The name of the [Secret Manager](https://aws.amazon.com/secrets-manager/) secret which stores API keys in name/value pairs
