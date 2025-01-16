#!/usr/bin/env bash

set -e

echo "Waiting for MariaDB to be ready..."
/scripts/wait-for-it.sh -h mariadb -p 3306 -t 300
echo "MariaDB is ready."

echo "Running Prisma migrations..."
npx prisma migrate dev
echo "Prisma migrations completed."

echo "Generating Prisma client code..."
npx prisma generate
echo "Prisma client code generated."

echo "Starting the application..."
node index.js
