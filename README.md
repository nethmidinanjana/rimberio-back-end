# Rimberio Back-End

The back-end API for the **Rimberio Android app**. Built with **Express.js**, this API handles user authentication, communicates with Firebase for data storage, and processes orders and user-related functionalities.

## Features

- **User Authentication**: Register, login, and manage user sessions.
- **Firebase Integration**: Real-time data sync and storage.
- **Order Management**: Handle order placements, statuses, and history.
- **User-Related Operations**: Manage user profiles and account settings.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express.js**: Web framework for building the API.
- **Firebase**: Cloud-based real-time database for user data and order management.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- Firebase project

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/nethmidinanjana/rimberio-back-end.git
   cd rimberio-back-end
   ```

2. Add your firebaseConfig.json in the root directory.

3. Create a .env file with your environment variables.

4. To start the server in development mode, run:
   ```bash
   npm run devStart
   ```
