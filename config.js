const local = false;
export const SERVICE_URL = local
  ? "http://localhost:5000"
  : "awseb--AWSEB-2HTI0fbpF1kO-1472035706.ap-south-1.elb.amazonaws.com";

// socket io client
export const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};
