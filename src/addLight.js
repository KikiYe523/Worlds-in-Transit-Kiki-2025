import * as THREE from 'three'

export const addLight = () => {
	const light = new THREE.DirectionalLight(0xffffff, 1.5)
	light.position.set(20, 20, 20)
	return light
}

export const addTopLight = () => {
	const light = new THREE.DirectionalLight(0xffffff, 1.5)
	light.position.set(0, 10, -20)
	console.log(light)
	return light
}
export const addLeftLight = () => {
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(-50, 10, 0);
  console.log(light);
  return light;
};
export const addRightLight = () => {
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(50, 10, 0);
  console.log(light);
  return light;
};
export const addBackLight = () => {
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 10, 50);
  console.log(light);
  return light;
};
export const addCeilingLight = () => {
  const light = new THREE.DirectionalLight(0xffffff, 2);
	light.position.set(0, 0, 50);
  console.log(light);
  return light;
};