# S3 API

This API simulates the back-end of the AWS Console. A user can sign-up, login, create a bucket then delete the bucket.

This API was built using my project [anthonybudd/express-api-boilerplate.](https://github.com/anthonybudd/express-api-boilerplate)

### Main Files
- Auth Controller: [./src/routes/Auth.js](./src/routes/auth.js)
- Bucket Controller: [./src/routes/Buckets.js](./src/routes/Buckets.js)
- Model: [./src/models/Bucket.js](./src/models/Bucket.js)


### Set-up
```
cp .env.example .env
npm install

# Private RSA key for JWT signing
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

# Start the app
docker compose up
npm run _db:refresh
npm run _test
```


### Routes
| Method      | Route                            | Description                           | Payload                               | Response          | 
| ----------- | -------------------------------- | ------------------------------------- | ------------------------------------- | ----------------- |  
| **Buckets**  |                                  |                                       |                                       |                   |  
| GET         | `/api/v1/buckets`                | Get all buckets for the current user  | --                                    | [Bucket, Bucket]  |  
| POST        | `/api/v1/buckets`                | Create new bucket                     | { name: "test-bucket" }               | {Bucket}          |  
| GET         | `/api/v1/buckets/:bucketID`      | Get a single bucket                   | --                                    | {Bucket}          |  
| DELETE      | `/api/v1/buckets/:bucketID`      | Returns HTTP 202 {id}                 | --                                    | {bucketID}    |  
| **Auth**    |                                  |                                       |                                       |                   |  
| POST        | `/api/v1/auth/login`             | Login                                 | {email, password}                     | {accessToken}     |  
| POST        | `/api/v1/auth/sign-up`           | Sign-up                               | {email, password, firstName, tos}     | {accessToken}     |  
| GET         | `/api/v1/_authcheck`             | Returns {auth: true} if has auth      | --                                    | {auth: true}      |  
| **User**    |                                  |                                       |                                       |                   |  
| GET         | `/api/v1/user`                   | Get the current user                  |                                       | {User}            |  
| POST        | `/api/v1/user`                   | Update the current user               | {firstName, lastName}                 | {User}            |  


