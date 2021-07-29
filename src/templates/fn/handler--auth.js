import { middleware, auth } from "@flexible-agency/serverless-middleware";

const dependencies = () => ({});

export const app = async (event, {}) => {

};

export const handler = middleware(app, [auth]).register(dependencies);
