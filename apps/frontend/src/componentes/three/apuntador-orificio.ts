import * as THREE from "three";

type ResolverOrificio = (clienteX: number, clienteY: number) => number | null;

let resolver: ResolverOrificio | null = null;

export function registrarResolverOrificio(fn: ResolverOrificio | null): void {
  resolver = fn;
}

export function resolverOrificioEnPantalla(clienteX: number, clienteY: number): number | null {
  return resolver?.(clienteX, clienteY) ?? null;
}

export function crearApuntadorOrificios(
  camera: THREE.Camera,
  gl: THREE.WebGLRenderer,
  objetos: () => THREE.Object3D[],
): ResolverOrificio {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  return (clienteX, clienteY) => {
    const rect = gl.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return null;
    }
    pointer.x = ((clienteX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clienteY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(objetos(), true);
    for (const hit of hits) {
      let actual: THREE.Object3D | null = hit.object;
      while (actual) {
        if (typeof actual.userData.indiceOrificio === "number") {
          return actual.userData.indiceOrificio as number;
        }
        actual = actual.parent;
      }
    }
    return null;
  };
}
