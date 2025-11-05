# Mail Service Administration Panel

This project provides a web-based administration panel for managing a mail server, built with Docker. It includes a `docker-mailserver` instance, a FastAPI backend, and a React frontend.

## Project Structure

-   `backend/`: FastAPI application that acts as an API gateway to the `docker-mailserver` REST API.
-   `frontend/`: React application for the administration panel UI.
-   `docker-data/`: Persistent volumes for `docker-mailserver` (mail data, state, configuration).
-   `docker-compose.yml`: Defines the services, networks, and volumes for the entire application.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Docker](https://docs.docker.com/get-docker/)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [Node.js](https://nodejs.org/en/download/) (for frontend development, if needed)
-   [Python](https://www.python.org/downloads/) (for backend development, if needed)

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:madcap15/mail.git
    cd mail
    ```

2.  **Configure `docker-compose.yml`:**
    *   Open `docker-compose.yml`.
    *   **IMPORTANT:** Change `hostname: mail.example.com` to your desired domain name for the mail server.

3.  **Build and start the Docker containers:**
    This command will build the Docker images for the backend and frontend, and then start all services defined in `docker-compose.yml` in detached mode.
    ```bash
    docker-compose up --build -d
    ```

4.  **Access the application:**
    *   **Frontend:** Open your web browser and navigate to `http://localhost:3000`.
    *   **Backend API:** The backend API will be available at `http://localhost:8000`.
    *   **Mailserver REST API:** The mailserver's REST API will be available at `http://localhost:9090/api/v1`.

## Current Features

-   **User Listing:** The frontend displays a list of email users fetched from the `docker-mailserver` via the FastAPI backend.
-   **Add User:** New email users can be added through the frontend form, which interacts with the `docker-mailserver` via the FastAPI backend.
-   **Delete User:** Existing email users can be deleted through the frontend, which interacts with the `docker-mailserver` via the FastAPI backend.
-   **Update User Password:** Passwords for existing email users can be updated through the frontend, which interacts with the `docker-mailserver` via the FastAPI backend.
-   **Domain Management:**
    -   List existing domains.
    -   Add new domains.
    -   Delete existing domains.
    All domain operations are performed through the frontend, interacting with the `docker-mailserver` via the FastAPI backend.

## Next Steps (Planned Features)

-   **User Management (CRUD):**
    -   Add new email users.
    -   Delete existing email users.
    -   Update user passwords.
-   **Domain Management (CRUD):**
    -   List configured domains.
    -   Add new domains.
    -   Delete existing domains.
-   **Improved UI/UX and Error Handling.**

## Contributing

Feel free to fork the repository and submit pull requests.

## License

[Specify your license here]