CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    real_name VARCHAR(50),
    image_path VARCHAR(50)
);

-- Lists friends.  When entering data, enter both (friend1, friend2) and (friend2, friend1).
CREATE TABLE IF NOT EXISTS friends (
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    PRIMARY KEY (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    website VARCHAR(100), -- must be in format https://www.example.com
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    image_path VARCHAR(100) NOT NULL, -- format: /resources/default_restaurant.jpg
    latitude FLOAT,
    longitude FLOAT
);

-- used to favorite restaurants
-- if a user has a favorite restaurant, their user_id and the restaurant.id will appear here
CREATE TABLE IF NOT EXISTS users_to_restaurants (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    PRIMARY KEY (user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    note VARCHAR(100),
    address VARCHAR(100) NOT NULL,
    image_path VARCHAR(100) NOT NULL,
    UNIQUE(start_date, name)
);