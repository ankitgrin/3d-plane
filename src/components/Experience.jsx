import { Float, Line, OrbitControls } from "@react-three/drei";
import Background from "./Background";
import { Airplane } from "./Airplane";
import { Cloud } from "./Cloud";
import { useMemo } from "react";
import { CatmullRomCurve3, Shape, Vector3 } from "three";

const LINE_NB_POINTS = 2000;

export const Experience = () => {
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      [
        new Vector3(0, 0, 0),
        new Vector3(0, 0, -10),
        new Vector3(-2, 0, -20),
        new Vector3(-3, 0, -30),
        new Vector3(0, 0, -40),
        new Vector3(5, 0, -50),
        new Vector3(7, 0, -60),
        new Vector3(5, 0, -70),
        new Vector3(0, 0, -80),
        new Vector3(0, 0, -90),
        new Vector3(0, 0, -100),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  const linePoints = useMemo(() => {
    return curve.getPoints(LINE_NB_POINTS);
  }, [curve]);

  const shape = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.2);
    shape.lineTo(0, -0.2);

    return shape;
  }, [curve]);

  return (
    <>
      <OrbitControls />
      <Background />
      <Float floatIntensity={2} speed={2}>
        <Airplane
          rotation-y={Math.PI / 2}
          scale={[0.2, 0.2, 0.2]}
          position-y={0.1}
        />
      </Float>

      {/* LINE */}
      <group position-y={-2}>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve,
              },
            ]}
          />
          <meshStandardMaterial
            color={"white"}
            transparent
            envMapIntensity={2}
          />
        </mesh>
      </group>

      <Cloud opacity={0.5} scale={[0.3, 0.3, 0.3]} position={[-2, 1, -3]} />
      <Cloud opacity={0.5} scale={[0.2, 0.3, 0.4]} position={[1.5, -0.5, -2]} />
      <Cloud
        opacity={0.7}
        scale={[0.3, 0.3, 0.4]}
        rotation-y={Math.PI / 9}
        position={[2, -0.2, -2]}
      />
      <Cloud
        opacity={0.7}
        scale={[0.4, 0.4, 0.4]}
        rotation-y={Math.PI / 9}
        position={[1, -0.2, -12]}
      />
      <Cloud opacity={0.7} scale={[0.5, 0.5, 0.5]} position={[-1, 1, -53]} />
    </>
  );
};