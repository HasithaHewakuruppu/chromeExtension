import * as THREE from 'three';
import { TRIANGULATION } from './utilities';

// Create geometries
function createMeshGeometries(points) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // Points are already in OrthographicCamera coordinates
        const x = p[0];
        const y = p[1];
        const z = p[2] || 0;
        vertices.push(x, y, z);
    }

    for (let i = 0; i < TRIANGULATION.length / 3; i++) {
        indices.push(TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1], TRIANGULATION[i * 3 + 2]);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    return geometry;
}

class FaceMeshThreeJS {
    constructor(videoElement, videoParentElement) {
        this.videoElement = videoElement;
        this.videoParentElement = videoParentElement;
        this.scene = new THREE.Scene();
        const videoWidth = videoElement.offsetWidth;
        const videoHeight = videoElement.offsetHeight;
        this.camera = new THREE.OrthographicCamera(0, videoWidth, 0, videoHeight, -1000, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(videoWidth, videoHeight);
        this.renderer.setClearColor(0x000000, 0); // the default
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.zIndex = 9999; // Set a high z-index
        this.videoParentElement.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
    }

    clearScene() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }

    dispose() {
        this.scene.traverse(function(object) {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {
                    if (object.material.length) {
                        for (let i = 0; i < object.material.length; ++i) {
                            object.material[i].dispose();
                        }
                    }
                    else {
                        object.material.dispose();
                    }
                }
            }
        });
    }

    drawMesh(predictions) {
        this.clearScene();

        if (predictions.length > 0) {
            predictions.forEach((prediction) => {
                const keypoints = prediction.scaledMesh;
                const geometry = createMeshGeometries(keypoints);
                const material = new THREE.MeshBasicMaterial({ color: "aqua", wireframe: true });
                const mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);

                // Drawing points
                const dotGeometry = new THREE.BufferGeometry();
                const dotMaterial = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false, color: "aqua" });

                const dotVertices = [];

                keypoints.forEach(point => {
                    // Points are already in OrthographicCamera coordinates
                    const x = point[0];
                    const y = point[1];
                    const z = point[2] || 0;
                    dotVertices.push(x, y, z);
                });

                dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotVertices, 3));

                const dotMesh = new THREE.Points(dotGeometry, dotMaterial);
                this.scene.add(dotMesh);
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

module.exports = FaceMeshThreeJS;
