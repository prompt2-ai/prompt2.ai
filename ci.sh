#!/bin/bash
docker build -t localhost:32000/prompt2ai:latest -f Dockerfile.prod .
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
