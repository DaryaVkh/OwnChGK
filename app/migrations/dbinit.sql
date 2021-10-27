CREATE TYPE admin_roles AS ENUM ('admin', 'superadmin');

CREATE TABLE users
(
	user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255)
);

CREATE TABLE admins
(
	admin_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
	admin_role admin_roles NOT NULL DEFAULT admin_roles('admin')
);

CREATE TABLE teams
(
	team_id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE,
	captain_id INT NOT NULL REFERENCES users (user_id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE,
	participants VARCHAR(255)[]
);

CREATE TYPE game_status AS ENUM ('not_started', 'started', 'finished');

CREATE TABLE games
(
	game_id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE,
	admin_id INT NOT NULL REFERENCES admins (admin_id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE,
	status game_status NOT NULL DEFAULT game_status('not_started')
);

CREATE TABLE rounds
(
	round_id SERIAL PRIMARY KEY,
	number INT NOT NULL,
	questions_number INT NOT NULL,
	questions_cost INT NOT NULL,
	questions_time INT NOT NULL
);

CREATE TABLE game_round_links
(
	game_id INT NOT NULL REFERENCES games
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	round_id INT NOT NULL REFERENCES rounds
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	PRIMARY KEY (game_id, round_id)
);

CREATE TABLE game_team_links
(
	game_id INT NOT NULL REFERENCES games
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	team_id INT NOT NULL REFERENCES teams
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	PRIMARY KEY (game_id, team_id)
);
