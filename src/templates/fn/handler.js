import { middleware } from "@flexible-agency/serverless-middleware";

const dependencies = () => ({});

export const app = async (event, {}) => {

};

export const handler = middleware(app).register(dependencies);
