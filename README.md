# Server_v3

docker cp backup.sql database:/backup.sql

docker exec -it database bash

psql -U postgres

DROP DATABASE IF EXISTS server_version_3;

CREATE DATABASE server_version_3;

exit

psql -U postgres server_version_3 < /backup.sql;

tk: ipaclab

mk: 123456