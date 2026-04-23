# System Architecture Diagram

This diagram visualizes the high-level architecture of the Flatiron Meal Plan Map, showing the interactions between the frontend, backend, database, and external services.

```mermaid
graph LR
    subgraph "Client Side (Frontend)"
        User((User)) --> Browser[Web Browser]
        Browser --> Pages[Handlebars Templates / HTML]
        Browser --> CSS[Vanilla CSS / Bootstrap]
        Browser --> ClientJS[map.js / login.js / register.js]
    end

    subgraph "Server Side (Backend - Node.js/Express)"
        Browser <--> Express[Express Server - index.js]
        Express --> Auth[Session Management / bcryptjs]
        Express --> Scraper[Axios + Cheerio Scrapers]
        Express --> AWS_SDK[AWS SDK - S3 Handler]
    end

    subgraph "Data & External Services"
        Express <--> Postgres[(PostgreSQL Database)]
        Scraper -- Fetches Data --> FlatironSite[Flatiron Meal Plan Website]
        AWS_SDK <--> S3[AWS S3 - User Images]
        ClientJS -- Tile Layers --> OSM[OpenStreetMap API]
    end

    %% Styling
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Postgres fill:#336791,color:#fff
    style Express fill:#339933,color:#fff
    style S3 fill:#FF9900,color:#fff
```

## Component Breakdown

- **Frontend**: Handles the user interface using Handlebars for templating and Leaflet.js (OpenStreetMap) for the interactive map.
- **Backend**: A Node.js and Express server that manages routing, authentication (via bcryptjs and sessions), and communication with external APIs.
- **Database**: A PostgreSQL instance (hosted on Render) that stores persistent data for users and restaurants.
- **Scrapers**: Custom logic using Axios and Cheerio to keep restaurant data and deals updated by pulling directly from the Flatiron Meal Plan site.
- **AWS S3**: Used for storing and serving user-uploaded profile images.
