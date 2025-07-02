#!/bin/bash

echo "Stopping existing Spring Boot app..."
PID=$(pgrep -f 'quizapp.jar')
if [ -n "$PID" ]; then
  kill -9 $PID
  echo "Stopped PID $PID"
else
  echo "No running quizapp.jar"
fi
