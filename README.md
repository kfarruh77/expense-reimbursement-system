# Expense Reimbursement System

## Startup

To start the application, simply run npm install to install all necessary node packages, and then `node server.js` to start the server. The server is configured to run on PORT 3000, but you can change the PORT number to something else. You also need to create environment variables to be able to connect to the AWS (for the DynamoDB and S3 bucket access):

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_DEFAULT_REGION

## Endpoints

### Register Endpoint

Request

- HTTP Method
  - POST
- URL
  - /users
- Headers
  - Content-Type: application/json
- Body
  ```json
  {
    "email": "user123@gmail.com",
    "password": "password123"
  }
  ```

Response Scenarios

1. Successful registration

   - Status Code
     - 201 Created
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "User created"
     }
     ```

2. Same email registration

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Email is already in use"
     }
     ```

3. No email and/or password provied
   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Please provide an email and password"
     }
     ```

### Login Endpoint

Request

- HTTP Method
  - POST
- URL
  - /login
- Headers
  - Content-Type: application/json
- Body
  ```json
  {
    "email": "user123@gmail.com",
    "password": "password123"
  }
  ```

Response Scenarios

1. Successful login

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Successful Login",
       "token": "SomeToken"
     }
     ```

2. Invalid email login

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "User does not exist"
     }
     ```

3. Invalid password login

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Email and password do not match"
     }
     ```

### Submit reimbursement ticket endpoint

Request

- HTTP Method
  - POST
- URL
  - /tickets
- Headers
  - Authorization: "Bearer someRandomToken123"
  - Content-Type: multipart/form-data
- Body

  ```form-data
  amount: someNumber
  description: "someDescription"
  type: "someType"
  image: image.jpg
  ```

Response Scenarios

1. Successful submission

   - Status Code
     - 201 Created
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Ticket created"
     }
     ```

2. Invalid amount/description/type

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Please provide valid amount, description and/or type"
     }
     ```

3. Manager ticket submission

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "You are not an employee"
     }
     ```

4. Invalid token

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Token verification failure"
     }
     ```

5. Not logged in

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Not logged in"
     }
     ```

### View reimbursement tickets endpoint

Request

- HTTP Method
  - GET
- URL
  - /tickets
- Headers
  - Authorization: "Bearer someRandomToken123"
- Body: None
- Parameters

  | Name   | DataType | Required/Optional |
  | ------ | -------- | ----------------- |
  | status | string   | optional          |
  | type   | string   | optional          |

Response Scenarios

1. Successful view with valid employee or manager authorization wiht no params

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     [
       {
         "ticket_id": "bdf225f5-8cf5-4f0a-bbdf-376d398b9bfd",
         "submittedBy": "employee2@gmail.com",
         "status": "denied",
         "amount": 50,
         "receiptImage": "No image",
         "description": "movie",
         "type": "others"
       },
       {
         "ticket_id": "711f0955-395a-43c0-af58-a1029c885d54",
         "submittedBy": "employee2@gmail.com",
         "status": "approved",
         "amount": 50,
         "receiptImage": "https://reimbursement-receipt-images.s3.us-east-2.amazonaws.com/7e942389-58a5-41db-8ede-2c2dc32029a8-receipt.jpg",
         "description": "lunch",
         "type": "food"
       }
     ]
     ```

2. Successful view with a valid status param(approved/**denied**/pending)

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     [
       {
         "ticket_id": "bdf225f5-8cf5-4f0a-bbdf-376d398b9bfd",
         "submittedBy": "employee2@gmail.com",
         "status": "denied",
         "amount": 50,
         "receiptImage": "No image",
         "description": "movie",
         "type": "others"
       }
     ]
     ```

3. View tickets filtered by valid type (food, lodging, travel, **others**)

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     [
       {
         "ticket_id": "bdf225f5-8cf5-4f0a-bbdf-376d398b9bfd",
         "submittedBy": "employee2@gmail.com",
         "status": "denied",
         "amount": 50,
         "receiptImage": "No image",
         "description": "movie",
         "type": "others"
       }
     ]
     ```

4. View tickets filtered by invalid status

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Please provide a proper status (pending/approved/denied)"
     }
     ```

5. View tickets filtered by invalid type

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Please provide a proper type (lodging/food/travel/others)"
     }
     ```

6. Invalid token

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Token verification failure"
     }
     ```

7. Not logged in

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Not logged in"
     }
     ```

### Validate reimbursement tickets endpoint

Request

- HTTP Method
  - PATCH
- URL
  - /tickets/:id/status
- Headers
  - Authorization: "Bearer someRandomToken123"
- Body:
  ```json
  {
    "status": "statusChange"
  }
  ```

Response Scenarios

1. Validate reimbursement tickets

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Ticket status successfully updated"
     }
     ```

2. Validate already validated reimbursement tickets

   - Status Code
     - 403 Forbidden
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Ticket status already validated"
     }
     ```

3. Validate incorrect ticket id

   - Status Code
     - 404 Not Found
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Ticket not found"
     }
     ```

4. Validate with invalid status change

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Please provide a proper validation status (denied/approved)"
     }
     ```

5. Validate with employee authorization

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "You are not a manager"
     }
     ```

6. Invalid token

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Token verification failure"
     }
     ```

7. Not logged in

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Not logged in"
     }
     ```

### View users list endpoint

Request

- HTTP Method
  - GET
- URL
  - /users
- Headers
  - Authorization: "Bearer someRandomToken123"
- Body:
  - None

Response Scenarios

1. View as a manager

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     [
       {
         "email": "employee4@gmail.com",
         "role": "employee"
       },
       {
         "email": "user125@gmail.com",
         "role": "manager"
       }
     ]
     ```

2. View as an employee

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "You are not a manager"
     }
     ```

3. Invalid token

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Token verification failure"
     }
     ```

4. Not logged in

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Not logged in"
     }
     ```

### Change users role endpoint

Request

- HTTP Method
  - Patch
- URL
  - /users/:email
- Headers
  - Authorization: "Bearer someRandomToken123"
- Body:
  - None

Response Scenarios

1. Valid change role as a manager

   - Status Code
     - 200 OK
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "User with email user@email.com became a changedRole"
     }
     ```

2. Change role as a manager (user has pending tickets)

   - Status Code
     - 403 Forbidden
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "User has pending tickets"
     }
     ```

3. Change role as a manager (email is invalid)

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "User does not exist"
     }
     ```

4. Change your own role as a manager

   - Status Code
     - 403 Forbidden
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "You are not allowed to change your own role"
     }
     ```

5. Change role as an employee

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "You are not a manager"
     }
     ```

6. Invalid token

   - Status Code
     - 400 Bad Request
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Token verification failure"
     }
     ```

7. Not logged in

   - Status Code
     - 401 Unauthorized
   - Headers
     - Content-Type: application/json
   - Body
     ```json
     {
       "message": "Not logged in"
     }
     ```
