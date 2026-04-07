CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    website VARCHAR(100), -- must be in format https://www.example.com
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    image_path VARCHAR(100) NOT NULL -- format: /resources/default_restaurant.jpg
);

-- used to favorite restaurants
-- if a user has a favorite restaurant, their user_id and the restaurant.id will appear here
CREATE TABLE IF NOT EXISTS users_to_restaurants (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    PRIMARY KEY (user_id, restaurant_id)
);