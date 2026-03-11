#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting local MongoDB data dump..."
# Dump local buildtrack_pro database
mongodump --uri="mongodb://localhost:27017/buildtrack_pro" -o "./dump"

echo "Restoring data to MongoDB Atlas..."
# Restore to MongoDB Atlas
mongorestore --uri="mongodb+srv://construction:3FQMm2qXgsjs7QFi@construction.fs8erhu.mongodb.net/" -d buildtrack_pro "./dump/buildtrack_pro"

echo "Migration completed successfully!"
