import { middleware } from "@includable/serverless-middleware";

const dependencies = () => ({});

export const app = async (event, {}) => {

};

export const handler = middleware(app).register(dependencies);
