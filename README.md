
#WARNING 
* this is a work in progress. The project is not yet ready for production or even for development.


# license
This software is licensed under the AGPLv3. You are free to use and modify this software for personal use. If you offer this software as a service, you must make your modifications available to your users under the same license.

NextJS with shadcn/ui 

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
Then [shadcn/ui](https://ui.shadcn.com/) is added to the project. `npx shadcn-ui@latest init` is used to add shadcn/ui to the project.

## build docker image
```bash
docker build -t localhost:32000/dev-prompt2ai:latest .
docker push localhost:32000/dev-prompt2ai:latest

docker build -t localhost:32000/prompt2ai:latest -f Dockerfile.prod .
docker push localhost:32000/prompt2ai:latest
```

## generate secret from .env.local
```bash
kubectl create secret generic dev-prompt2ai-sercets --from-env-file=.env.development.local
kubectl create secret generic prompt2ai-sercets --from-env-file=.env.production.local
```

## install helm chart form local directory charts/prompt2ai
```bash
microk8s.helm3 install prompt2ai ./charts/prompt2ai/
microk8s.helm3 install dev-prompt2ai ./charts/dev-prompt2ai/
```
# remove helm chart
```bash
microk8s.helm3 uninstall prompt2ai
microk8s.helm3 uninstall dev-prompt2ai
```

## Getting Started

First, run the development server:

```bash
yarn dev
```


This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



