const bcrypt = require("bcrypt");

const DEMO_PASSWORD = "password123";

const rawUsers = [
  { id: 1, name: "Admin", email: "admin@mail.com", role: "admin" },
  { id: 2, name: "Staff", email: "staff@mail.com", role: "staff" },
  { id: 3, name: "Customer", email: "customer@mail.com", role: "customer" }
];

const users = rawUsers.map(u => ({
  ...u,
  password: bcrypt.hashSync(DEMO_PASSWORD, 10)
}));

module.exports = { users, DEMO_PASSWORD };
