module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true }
    },
    {
      name: "no-backend-to-web",
      severity: "error",
      from: { path: "^apps/api" },
      to: { path: "^apps/web" }
    }
  ],
  options: {
    doNotFollow: {
      path: "node_modules"
    }
  }
};
