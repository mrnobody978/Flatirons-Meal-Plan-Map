# Flatirons Meal Plan Map

## 📌 Project Overview
The Flatirons Meal Plan Map is a web application that helps users explore and discover restaurants included in the Flatirons Meal Plan. The platform provides an interactive map with restaurant locations, a dashboard with personalized recommendations, weekly deals, and the ability to favorite restaurants.

---

## 👥 Contributors
- Ryan Falender (@Ryan-3010)
- Pranav Konijeti (@Pranav-Konijeti) 
- Hayden Sandau (@mrnobody978) 
- Garrett Smith (@GarrettSmit)
- Marie Viita (@marieviita)  

---

## ⚙️ Technology Stack
- **Backend:** Node.js, Express  
- **Frontend:** Handlebars (HBS), HTML, CSS, Bootstrap  
- **Database:** PostgreSQL  
- **Mapping:** Leaflet & OpenStreetMap  
- **Cloud Storage:** AWS S3  
- **Web Scraping:** Axios & Cheerio  
- **Testing:** Mocha & Chai  
- **Containerization:** Docker  
- **Deployment:** Render  
- **Version Control:** GitHub  

---

## 📋 Prerequisites
- Docker & Docker Compose (recommended)

### Optional (for running without Docker)
- Node.js
- npm
- PostgreSQL

---

## ▶️ Running the Application Locally

The application is currently configured for deployment using Render and may not run locally without additional environment configuration (e.g., database credentials and AWS access).

Users are encouraged to access the deployed version of the application at:

👉 https://flatirons-meal-plan-map.onrender.com/

If running locally, navigate to the source code directory:

    cd ProjectSourceCode

---

## 🧪 Running Tests

Run:

    npm test  

Note: Tests are located in the `ProjectSourceCode/test/` directory and are designed to validate server routes and core functionality.

---

## 📁 Directory Structure

- **MilestoneSubmissions/**  
  Contains milestone deliverables and project documentation such as the architecture diagram, release notes, UAT document, use case diagram, and wireframes.

- **ProjectSourceCode/**  
  Contains the main application code and configuration files.
  - **docker-compose.yaml** – Docker setup for the application and database
  - **init_db.sh** – Database initialization script
  - **package.json** – Node.js dependencies and scripts
  - **resources/** – Static image assets
  - **src/** – Main source code
    - **index.js** – Express server and route handling
    - **init_data/** – SQL schema and initialization files
    - **resources/** – Client-side JavaScript, CSS, scrapers, AWS S3 handler, and images
    - **views/** – Handlebars layouts, pages, and partial templates
  - **test/** – Test files for backend/server functionality

- **TeamMeetingLogs/**  
  Contains meeting notes and project planning records.

- **ReadMe.md**  
  Contains the project overview, setup instructions, and deployment information.

---

## 🌐 Deployed Application

👉 https://flatirons-meal-plan-map.onrender.com/

---

## 📌 Notes
- Interactive map with restaurant pins  
- Restaurant search and favorites  
- Weekly deal scraping  
- AWS S3 for profile images  
