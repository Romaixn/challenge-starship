import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    GreenShip_Body: THREE.Mesh
    GreenShip_LandingGearItem1: THREE.Mesh
    GreenShip_LandingGearItem2: THREE.Mesh
    GreenShip_LandingGearItem3: THREE.Mesh
    GreenShip_LandingGearItem4: THREE.Mesh
  }
  materials: {
    GreenShip: THREE.MeshStandardMaterial
    LandingGear1: THREE.MeshStandardMaterial
  }
}

const Spaceship = (props: JSX.IntrinsicElements['group']) => {
  const { nodes, materials } = useGLTF('/models/spaceship.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group position={[-30, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GreenShip_Body.geometry}
          material={materials.GreenShip}
          position={[0, 10.474, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GreenShip_LandingGearItem1.geometry}
          material={materials.LandingGear1}
          rotation={[0, Math.PI / 4, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GreenShip_LandingGearItem2.geometry}
          material={materials.LandingGear1}
          rotation={[0, -Math.PI / 4, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GreenShip_LandingGearItem3.geometry}
          material={materials.LandingGear1}
          rotation={[-Math.PI, Math.PI / 4, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GreenShip_LandingGearItem4.geometry}
          material={materials.LandingGear1}
          rotation={[Math.PI, -Math.PI / 4, Math.PI]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/spaceship.glb')

export default Spaceship
