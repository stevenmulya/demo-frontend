import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Lenis from '@studio-freight/lenis';

const ThreeScene = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const lenis = new Lenis();
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        const images = [];
        let loadedImageCount = 0;

        function loadImages() {
            for (let i = 1; i <= 7; i++) {
                const img = new Image();
                img.onload = function () {
                    images.push(img);
                    loadedImageCount++;

                    if (loadedImageCount === 7) {
                        initializeScene();
                    }
                };
                img.onerror = function () {
                    loadedImageCount++;
                    if (loadedImageCount === 7) {
                        initializeScene();
                    }
                };
                img.src = `/img${i}.jpg`;
            }
        }

        function initializeScene() {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            const renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                powerPreference: "high-performance",
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000);

            const parentWidth = 20;
            const parentHeight = 75;
            const curvature = 20;
            const segmentsX = 200;
            const segmentsY = 200;

            const parentGeometry = new THREE.PlaneGeometry(
                parentWidth,
                parentHeight,
                segmentsX,
                segmentsY
            );

            const positions = parentGeometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                const distanceFromCenter = Math.abs(y / (parentHeight / 2));
                positions[i + 2] = Math.pow(distanceFromCenter, 2) * curvature;
            }
            parentGeometry.computeVertexNormals();

            const totalSlides = 7;
            const slideHeight = 15;
            const gap = 0.5;
            const cycleHeight = totalSlides * (slideHeight + gap);

            const textureCanvas = document.createElement("canvas");
            const ctx = textureCanvas.getContext("2d", {
                alpha: false,
                willReadFrequently: false,
            });
            textureCanvas.width = 2048;
            textureCanvas.height = 8192;

            const texture = new THREE.CanvasTexture(textureCanvas);
            renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

            const parentMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                toneMapped: false,
            });

            const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
            parentMesh.position.set(0, 0, 0);
            parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
            parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
            scene.add(parentMesh);

            const distance = 17.5;
            const heightOffset = 5;
            const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
            const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));

            camera.position.set(offsetX, heightOffset, offsetZ);
            camera.lookAt(0, -2, 0);
            camera.rotation.z = THREE.MathUtils.degToRad(-5);

            const slideTitles = [
                " ", " ", " ", " ", " ", " ", " ",
            ];

            function updateTexture(offset = 0) {
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

                const fontSize = 300;
                ctx.font = `500 ${fontSize}px Inter`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const extraSlides = 2;

                for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
                    let slideY = -i * (slideHeight + gap);
                    slideY += offset * cycleHeight;

                    const textureY = (slideY / cycleHeight) * textureCanvas.height;
                    let wrappedY = textureY % textureCanvas.height;
                    if (wrappedY < 0) wrappedY += textureCanvas.height;

                    let slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
                    let slideNumber = slideIndex + 1;

                    const slideRect = {
                        x: textureCanvas.width * 0.05,
                        y: wrappedY,
                        width: textureCanvas.width * 0.9,
                        height: (slideHeight / cycleHeight) * textureCanvas.height,
                    };

                    const img = images[slideNumber - 1];
                    if (img) {
                        const imgAspect = img.width / img.height;
                        const rectAspect = slideRect.width / slideRect.height;

                        let drawWidth, drawHeight, drawX, drawY;

                        if (imgAspect > rectAspect) {
                            drawHeight = slideRect.height;
                            drawWidth = drawHeight * imgAspect;
                            drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
                            drawY = slideRect.y;
                        } else {
                            drawWidth = slideRect.width;
                            drawHeight = drawWidth / imgAspect;
                            drawX = slideRect.x;
                            drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
                        }

                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(slideRect.x, slideRect.y, slideRect.width, slideRect.height,);
                        ctx.clip();
                        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                        ctx.restore();

                        ctx.fillStyle = "rgba(0, 0, 0)";
                        ctx.fillText(slideTitles[slideIndex], textureCanvas.width / 2, wrappedY + slideRect.height / 2);
                    }
                }
                texture.needsUpdate = true;
            }

            let currentScroll = 0;
            lenis.on("scroll", ({ scroll, limit }) => {
                currentScroll = scroll / limit;
                updateTexture(-currentScroll);
                renderer.render(scene, camera);
            });

            function handleResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }

            let resizeTimeout;
            window.addEventListener("resize", () => {
                if (resizeTimeout) clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleResize, 250);
            });

            updateTexture(0);
            renderer.render(scene, camera);
        }
        loadImages();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (renderer) renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} />;
};

export default ThreeScene;