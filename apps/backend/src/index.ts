import Fastify from "fastify";
import cors from "@fastify/cors";
import { RegistroMotores } from "@hidroponico/motores";
import { crearBusEventosTree } from "./tree-js/bus-eventos";

const puerto = Number(process.env.PORT ?? 3001);
const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ["http://localhost:5173"],
});

const bus = crearBusEventosTree();
const registroMotores = new RegistroMotores();

app.get("/salud", async () => ({
  estado: "ok",
  servicio: "hidroponico-backend",
  eventos: bus.nombresConocidos(),
  motoresRegistrados: registroMotores.listar().map((motor) => motor.nombre),
}));

await app.listen({ port: puerto, host: "0.0.0.0" });
