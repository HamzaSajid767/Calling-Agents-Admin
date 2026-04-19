export async function mockDelay(ms = 220 + Math.floor(Math.random() * 180))) {
  await new Promise((r) => setTimeout(r, ms));
}
