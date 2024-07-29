#!/bin/bash
GIT_HASH=`git log --pretty=format:"%h" -n1`
REDIS_URL="redis://168.119.154.47:6379"

# check if redis is running on localhost
nc -z localhost 6379
if [ $? -ne 0 ]; then
  echo "Redis is not running on localhost"
  exit 1
fi

docker build --build-arg GIT_HASH=${GIT_HASH} --build-arg REDIS_URL=${REDIS_URL} -t localhost:32000/prompt2ai:latest -f Dockerfile.prod .
# catch exit code and exit if not 0
if [ $? -ne 0 ]; then
  echo "Docker build failed"
  exit 1
fi

docker push localhost:32000/prompt2ai:latest
# catch exit code and exit if not 0
if [ $? -ne 0 ]; then
  echo "Docker push failed"
  exit 1
fi
microk8s.kubectl rollout restart deployment prompt2ai  -n default
# catch exit code and exit if not 0
if [ $? -ne 0 ]; then
  echo "Kubectl rollout restart failed"
  exit 1
fi
