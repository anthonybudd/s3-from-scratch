# S3 API


This API was built using my [Express API Boilerplate](https://github.com/anthonybudd/express-api-boilerplate)

The S3 API is for users of S3 to create and delete buckets. This API simulates the back-end of AWS, a user can sign-up, login, create a bucket then delete the bucket.


### Routes
| Method      | Route                            | Description                           | Payload                               | Response          | 
| ----------- | -------------------------------- | ------------------------------------- | ------------------------------------- | ----------------- |  
| **Bucket**  |                                  |                                       |                                       |                   |  
| GET         | `/api/v1/buckets`                | Get all buckets for the current user  | --                                    | [Bucket, Bucket]  |  
| POST        | `/api/v1/buckets`                | Create new bucket                     | { name: "test-bucket" }               | {Bucket}          |  
| GET         | `/api/v1/buckets/:bucketID`      | Get a single bucket                   | --                                    | {Bucket}          |  
| DELETE      | `/api/v1/buckets/:bucketID`      | Returns HTTP 202 {id}                 | --                                    | {id: bucketID}    |  
| **Auth**    |                                  |                                       |                                       |                   |  
| POST        | `/api/v1/auth/login`             | Login                                 | {email, password}                     | {accessToken}     |  
| POST        | `/api/v1/auth/sign-up`           | Sign-up                               | {email, password, firstName, tos}     | {accessToken}     |  
| GET         | `/api/v1/_authcheck`             | Returns {auth: true} if has auth      | --                                    | {auth: true}      |  
| **User**    |                                  |                                       |                                       |                   |  
| GET         | `/api/v1/user`                   | Get the current user                  |                                       | {User}            |  
| POST        | `/api/v1/user`                   | Update the current user               | {firstName, lastName}                 | {User}            |  


