import { getUsersOver, insertUser } from "./users.js";

async function main() {
  const data = [
    { age: 50, name: "Andrew" },
    { age: 51, name: "Carol" },
    { age: 52, name: "Bob" },
    { age: 21, name: "Jake" },
    { age: 22, name: "Kate" },
    { age: 23, name: "Larry" },
  ];
  
  // insert users
  for (const user of data) {
    console.log(await insertUser(user), user);
  }

  // select users
  console.log(await getUsersOver(50));
}

await main();