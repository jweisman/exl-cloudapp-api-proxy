# Ex Libris API Proxy

API Proxy for Ex Libris Cloud Apps

## Introduction
This Lambda function provides an API proxy for use by Ex Libris Cloud Apps to access data in other institutions (for example, in a corsortial topology). The API can be hosted on AWS infrastructure

## Features
* CORS support
* Validation of Cloud App [authentication token](https://developers.exlibrisgroup.com/cloudapps/docs/api/events-service/#getAuthToken)
* Ability to limit allowed Cloud Apps and institutions (see [Configuration](#configuration) below)
* Retrieval of API key from an [AWS Secret Manager](https://aws.amazon.com/secrets-manager/) secret based on the institution code pased in an `X-For-InstCode` header
* Proxy of API request and response to Alma

## Deployment to AWS
To deploy to AWS, create a `.npmrc` file with the following content:
```
s3_bucket_name = BUCKET_NAME # Name of bucket in your AWS account to upload the assets to
region = eu-central-1 # Region to deploy to
cloud_formation_stack_name = ExlApiProxy # Stack name
allowed_apps =  # Optional list of allowed apps
allowed_inst_codes =  # Optional list of allowed institution codes
```

Then run the following:
```
$ npm run deploy
```

The output will include the URL of the proxy and the command to add the API keys to the secret.

## Configuration
The following optional environment variables are supported:
* `CLOUDAPP_AUTHORIZER_ALLOWED_APPS`: Comma separated list of allowed Cloud App IDs (Github username/repository name, i.e. ExLibrisGroup/alma-hathitrust-availability)
* `CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES`: Comma separated list of allowed institution codes (i.e. 01MYUNI_INST)
* `API_KEYS_SECRET_NAME`: The name of the [Secret Manager](https://aws.amazon.com/secrets-manager/) secret which stores API keys in name/value pairs
