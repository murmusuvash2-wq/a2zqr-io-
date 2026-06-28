const config = require("./tools-config.cjs");
const cats = new Set();
Object.values(config).forEach(t => {
  if (t.cat) cats.add(t.cat);
});
console.log(`TOTAL CATS: ${cats.size}`);
console.log(Array.from(cats));
