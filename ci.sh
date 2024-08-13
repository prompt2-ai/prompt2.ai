#!/bin/bash
GIT_HASH=`git log --pretty=format:"%h" -n1`
REDIS_URL="redis://168.119.154.47:6379"

# check if redis is running on localhost
nc -z localhost 6379
if [ $? -ne 0 ]; then
  echo "Redis is not running on localhost so port forwarding to redis"

 # gwt a pod name that starts with prompt2ai-prompt2ai-cache
  pod_name=$(microk8s.kubectl get pods -n default | grep prompt2ai-prompt2ai-cache | awk '{print $1}')
  if [ -z "$pod_name" ]; then
    echo "No pod found with name prompt2ai-prompt2ai-cache"
    exit 1
  fi
  microk8s.kubectl port-forward $pod_name 6379:6379 --address 0.0.0.0 &
  if [ $? -ne 0 ]; then
    echo "Port forward failed"
    exit 1
  fi
  #wait 2 seconds for port forward to start
  sleep 2
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
