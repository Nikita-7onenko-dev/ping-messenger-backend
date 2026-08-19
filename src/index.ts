import express from "express";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

app.get("/ping", (_, res) => 
  res.json({ message: "pong" })
);


async function startApp() {
  console.log("Starting server...");
  console.log(`On PORT: ${PORT}`);

  try {

    const server = app.listen(PORT, () => {
      console.log(`RUN SERVER ON PORT ${PORT}`);
      console.log("Come GET /some!");
    })

    server.on("error", (err) => {
      console.log("Failed to start app:", err);
    })

  } catch(error) {
    console.log("Failed to start app:", error);
    process.exit(1);
  }
};

startApp();