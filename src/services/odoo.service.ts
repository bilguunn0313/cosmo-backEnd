// src/services/erp.service.ts
import Odoo from "odoo-await";

const odoo = new Odoo({
  baseUrl: process.env.ERP_URL!,
  db: process.env.ERP_DB!,
  username: process.env.ERP_USER!,
  password: process.env.ERP_PASSWORD!,
});

// export async function connectOdoo() {
//   await odoo.connect();
//   console.log("✅ Connected to Odoo ERP");
//   return odoo;
// }

// // ERP API ашиглах функц
// export const erpService = {
//   async getUsers() {
//     const odoo = await connectOdoo();
//     const users = await odoo.searchRead(
//       "res.users",
//       [],
//       ["id", "name", "email"]
//     );
//     return users;
//   },
// };
