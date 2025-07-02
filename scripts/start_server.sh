#!/bin/bash

cd /home/ec2-user/quizapp

echo "Starting Spring Boot backend..."
nohup java -jar backend/target/*.jar > backend.log 2>&1 &

echo "Deploying frontend to Nginx..."
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r frontend/dist/* /usr/share/nginx/html/
