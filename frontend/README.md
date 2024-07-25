# Sandoog Frontend

Welcome to the frontend of the Sandoog project! This README provides an overview of the frontend structure, setup, and usage.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hallomer/sandoog.git
   ```

2. Navigate to the frontend directory:

   ```bash
   cd sandoog/frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up the environment variables by creating a `.env` file in the frontend directory and adding the following variable:

   ```env
   REACT_APP_API_BASE_URL=<Your API Base URL>
   ```

   Replace `<Your API Base URL>` with the actual base URL of your API.

## Usage

1. Start the development server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000` by default.

## Features

- User authentication and authorization
- Guest Sessions (15 min)
- Income & Expenses Tracking
- Budget management
- Savings management
- Summary and Graphs
- Bilingual support (Arabic & English)
- Responsive Design

## Tech Stack

- React.js
- CSS for styling
- Context API for state management
- Axios for API requests

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](../LICENSE).
