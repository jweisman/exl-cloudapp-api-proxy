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
To deploy to AWS, follow the steps below:

1. Clone repository
```
$ git clone https://github.com/jweisman/exl-cloudapp-api-proxy
```
2. Install dependencies
```
$ cd exl-cloudapp-api-proxy/dependencies/nodejs/ && npm install && cd ../../
```
3. Create a `.npmrc` file with the following content:
```
s3_bucket_name = BUCKET_NAME # Name of bucket in your AWS account to upload the assets to
region = eu-central-1 # Region to deploy to
cloud_formation_stack_name = ExlApiProxy # Stack name
allowed_apps =  # Optional list of allowed apps
allowed_inst_codes =  # Optional list of allowed institution codes
```
4. Run the following to deploy the CloudFormation template. The output will include the URL of the proxy and the identifier of the API keys secret. 
```
$ npm run deploy
```
5. Update the secret by creating a JSON file with the institution codes and API keys as name/value pairs, and then running the following command, for example:
```
$ echo '{"01_MYINST":"l7xx......"}' > apikeys.json
$ npm run update-keys --file=apikeys.json
```

The Angular component in [this Gist](https://gist.github.com/jweisman/7cb7b298a191206dfa985cd7f9fb5df6) can be added to a Cloud App and used to test the proxy. Don't forget to add the proxy URL to the [`contentSecurity` section of the manifest](https://developers.exlibrisgroup.com/cloudapps/docs/manifest/).

## Configuration
The following optional environment variables are supported in the Lambda function. They can also be set in the `.npmrc` file as described above.
* `CLOUDAPP_AUTHORIZER_ALLOWED_APPS`: Comma separated list of allowed Cloud App IDs (Github username/repository name, e.g. ExLibrisGroup/alma-hathitrust-availability)
* `CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES`: Comma separated list of allowed institution codes (e.g. 01MYUNI_INST1, 01MYUNI_INST2)
* `API_KEYS_SECRET_NAME`: The name of the [Secret Manager](https://aws.amazon.com/secrets-manager/) secret which stores API keys in name/value pairs
