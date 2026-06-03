// Vercel Serverless Function entrypoint
// This thin wrapper loads the compiled Express app from the monorepo.
const dotenv = require("dotenv/config");
const { default: app } = require("../apps/backend/dist/app");

module.exports = app;
