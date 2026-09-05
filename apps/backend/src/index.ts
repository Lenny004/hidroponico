import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  motorInsumos,
  motorMinerales,
  motorOxigeno,
  motorPlagas,
  RegistroMotores,
} from "@hidroponico/motores";
import { crearBusEventosTree } from "./tree-js/bus-eventos";
import { registrarRutaGrafo } from "./rutas/grafo";
import { registrarRutaPipeline } from "./rutas/pipeline";

const puerto = Number(process.env.PORT ?? 3001);
const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:5174"],
});

const bus = crearBusEventosTree();
const registroMotores = new RegistroMotores();
registroMotores.registrar(motorMinerales);
registroMotores.registrar(motorOxigeno);
registroMotores.registrar(motorPlagas);
registroMotores.registrar(motorInsumos);

await registrarRutaPipeline(app, bus, registroMotores);
await registrarRutaGrafo(app);

app.get("/salud", async () => ({
  estado: "ok",
  servicio: "hidroponico-backend",
  eventos: bus.nombresConocidos(),
  motoresRegistrados: registroMotores.listar().map((motor) => motor.nombre),
}));

await app.listen({ port: puerto, host: "0.0.0.0" });

