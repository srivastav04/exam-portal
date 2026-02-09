import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 100 }, // ramp to 100
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  let res = http.get("http://localhost:80");
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
