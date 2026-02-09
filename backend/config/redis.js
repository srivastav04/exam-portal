import redis from "redis";

const client = redis.createClient({
  socket: {
    host: "redis",
    port: 6379,
  },
});

client.on("connect", () => console.log("Redis connected Successfully"));
client.on("error", (err) => console.log("Error Occured", err));

export default client;
