#WARNING 
* this is a work in progress. The project is not yet ready for production or even for development.


NextJS with shadcn/ui 

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
Then shadcn/ui is added to the project. `npx shadcn-ui@latest init` is used to add shadcn/ui to the project.

## build docker image
```bash
docker build -t localhost:32000/prompt2ai:latest .
docker push localhost:32000/prompt2ai:latest
```

## install helm chart form local directory charts/prompt2ai
```bash
microk8s.helm3 install prompt2ai ./charts/prompt2ai/
```
# remove helm chart
```bash
microk8s.helm3 uninstall prompt2ai
```

## Getting Started

First, run the development server:

```bash
yarn dev
```


This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



