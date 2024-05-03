import { middleware, auth } from "@includable/serverless-middleware";

const dependencies = () => ({});

export const app = async (event, {}) => {

};

export const handler = middleware(app, [auth]).register(dependencies);
