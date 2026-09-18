import { Quaternion, Vector3 } from "three";

export type Vec3 = [number, number, number];

export type TramoTuberia = {
  position: Vec3;
  quaternion: [number, number, number, number];
  largo: number;
  radio: number;
  color: string;
};

/**
 * Cilindro entre dos puntos (eje Y local → dirección del tramo).
 * @param desde - Extremo A en coordenadas del módulo.
 * @param hasta - Extremo B.
 * @param radio - Radio del tubo.
 * @param color - Color del PE o PVC.
 */
export function tramoTuberia(
  desde: Vec3,
  hasta: Vec3,
  radio: number,
  color: string,
): TramoTuberia {
  const dx = hasta[0] - desde[0];
  const dy = hasta[1] - desde[1];
  const dz = hasta[2] - desde[2];
  const largo = Math.hypot(dx, dy, dz) || 0.001;
  const quat = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    new Vector3(dx / largo, dy / largo, dz / largo),
  );
  return {
    position: [
      (desde[0] + hasta[0]) / 2,
      (desde[1] + hasta[1]) / 2,
      (desde[2] + hasta[2]) / 2,
    ],
    quaternion: [quat.x, quat.y, quat.z, quat.w],
    largo,
    radio,
    color,
  };
}
