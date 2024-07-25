# Backend README

Welcome to the backend repository for the Sandoog project. It provides a RESTful API for managing user authentication, transactions, savings, budgets, and summaries. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [User Authentication](#user-authentication)
  - [Transactions](#transactions)
  - [Summary](#summary)
  - [Savings](#savings)
  - [Budgets](#budgets)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hallomer/sandoog.git
   ```

2. Navigate to the backend directory:

   ```bash
   cd sandoog/backend
   ```

3. Create and activate a virtual environment (optional but recommended):

   ```bash
   python3 -m venv env
   source env/bin/activate
   ```

4. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Set up the environment variables by creating a `.env` file in the backend directory and adding the following variables:

   ```env
   SAND00G_MYSQL_USER=<YOUR_MYSQL_USERNAME>
   SAND00G_MYSQL_PWD=<YOUR_MYSQL_PASSWORD>
   SAND00G_MYSQL_HOST=<YOUR_MYSQL_HOST>
   SAND00G_MYSQL_DB=<YOUR_MYSQL_DATABASE>
   JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>
   ```

   Replace the placeholders with your actual values.

## Usage

1. Start the backend server:

   ```bash
   python3 -m api.app
   ```

   The server will run on `http://localhost:5000` by default.

2. You can now interact with the API endpoints using tools like Insomnia or curl.

## API Endpoints

### User Authentication

- **Register**
  - **URL**: `/register`
  - **Method**: `POST`
  - **Description**: Register a new user.
  - **Request Body**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Responses**:
    - `201 Created`: User registered successfully.
    - `400 Bad Request`: Missing data or user already exists.

- **Login**
  - **URL**: `/login`
  - **Method**: `POST`
  - **Description**: Login an existing user.
  - **Request Body**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Responses**:
    - `200 OK`: Login successful.
    - `400 Bad Request`: Missing data or invalid username/password.

- **Guest Session**
  - **URL**: `/guest_session`
  - **Method**: `POST`
  - **Description**: Create a guest session.
  - **Responses**:
    - `201 Created`: Guest session created successfully.

- **Delete User**
  - **URL**: `/users/<user_id>`
  - **Method**: `DELETE`
  - **Description**: Delete a user by id.
  - **Request Header**:
    - `Authorization`: Bearer token
  - **Responses**:
    - `204 No Content`: User deleted successfully.
    - `403 Forbidden`: Unauthorized action.
    - `404 Not Found`: User not found.

- **Check User**
  - **URL**: `/check_user`
  - **Method**: `POST`
  - **Description**: Check if a user exists.
  - **Request Body**:
    ```json
    {
      "username": "string"
    }
    ```
  - **Responses**:
    - `200 OK`: User existence status.

- **Refresh Token**
  - **URL**: `/refresh`
  - **Method**: `POST`
  - **Description**: Refresh the access token using the refresh token.
  - **Request Header**:
    - `Authorization`: Bearer refresh token
  - **Responses**:
    - `200 OK`: New access token issued.

### Transactions

- **Create Transaction**
  - **URL**: `/transactions`
  - **Method**: `POST`
  - **Description**: Create a new transaction.
  - **Request Body**:
    ```
    {
      "amount": float,
      "description": "string",
      "type": "string",
      "date": "YYYY-MM-DD"
    }
    ```
  - **Responses**:
    - `201 Created`: Transaction created.
    - `400 Bad Request`: Missing data or required fields.
    - `404 Not Found`: User not found.

- **Get User Transactions**
  - **URL**: `/transactions`
  - **Method**: `GET`
  - **Description**: Get all transactions for the current user.
  - **Responses**:
    - `200 OK`: List of transactions.

- **Delete Transaction**
  - **URL**: `/transactions/<transaction_id>`
  - **Method**: `DELETE`
  - **Description**: Delete a transaction.
  - **Responses**:
    - `200 OK`: Transaction deleted.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Transaction not found.

### Summary

- **Get Summary**
  - **URL**: `/summary`
  - **Method**: `GET`
  - **Description**: Get the summary for the current user.
  - **Responses**:
    - `200 OK`: Summary data.

### Savings

- **Create Saving**
  - **URL**: `/savings`
  - **Method**: `POST`
  - **Description**: Create a new savings entry.
  - **Request Body**:
    ```
    {
      "name": "string",
      "goal": float,
      "saved": float (optional, default is 0.0)
    }
    ```
  - **Responses**:
    - `201 Created`: Savings entry created.
    - `400 Bad Request`: Missing data or required fields.
    - `404 Not Found`: User not found.

- **Get User Savings**
  - **URL**: `/savings`
  - **Method**: `GET`
  - **Description**: Get all savings for the current user.
  - **Responses**:
    - `200 OK`: List of savings.

- **Get Saving**
  - **URL**: `/savings/<savings_id>`
  - **Method**: `GET`
  - **Description**: Retrieve a savings entry by its ID.
  - **Responses**:
    - `200 OK`: Savings entry data.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Savings entry not found.

- **Update Saving**
  - **URL**: `/savings/<savings_id>`
  - **Method**: `PUT`
  - **Description**: Update a savings entry.
  - **Request Body**:
    ```
    {
      "name": "string (optional)",
      "goal": float (optional),
      "saved": float (optional),
      "contributions": list (optional)
    }
    ```
  - **Responses**:
    - `200 OK`: Savings entry updated.
    - `400 Bad Request`: Missing data or validation error.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Savings entry not found.

- **Delete Saving**
  - **URL**: `/savings/<savings_id>`
  - **Method**`: `DELETE`
  - **Description**: Delete a savings entry.
  - **Responses**:
    - `200 OK`: Savings entry deleted.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Savings entry not found.

### Budgets

- **Create Budget**
  - **URL**: `/budgets`
  - **Method**: `POST`
  - **Description**: Create a new budget.
  - **Request Body**:
    ```
    {
      "name": "string",
      "amount": float,
      "spent": float (optional, default is 0.0)
    }
    ```
  - **Responses**:
    - `201 Created`: Budget created.
    - `400 Bad Request`: Missing data or required fields.
    - `404 Not Found`: User not found.

- **Get User Budgets**
  - **URL**: `/budgets`
  - **Method**: `GET`
  - **Description**: Get all budgets for the current user.
  - **Responses**:
    - `200 OK`: List of budgets.

- **Get Budget**
  - **URL**: `/budgets/<budget_id>`
  - **Method**: `GET`
  - **Description**: Retrieve a budget by its ID.
  - **Responses**:
    - `200 OK`: Budget data.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Budget not found.

- **Update Budget**
  - **URL**: `/budgets/<budget_id>`
  - **Method**: `PUT`
  - **Description**: Update a budget.
  - **Request Body**:
    ```
    {
      "name": "string (optional)",
      "amount": float (optional),
      "spent": float (optional),
      "expenses": list (optional)
    }
    ```
  - **Responses**:
    - `200 OK`: Budget updated.
    - `400 Bad Request`: Missing data or validation error.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Budget not found.

- **Delete Budget**
  - **URL**: `/budgets/<budget_id>`
  - **Method**: `DELETE`
  - **Description**: Delete a budget.
  - **Responses**:
    - `200 OK`: Budget deleted.
    - `403 Forbidden`: Unauthorized access.
    - `404 Not Found`: Budget not found.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](../LICENSE).
