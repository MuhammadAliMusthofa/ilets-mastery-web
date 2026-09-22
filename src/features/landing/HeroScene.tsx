"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/src/_global/motion/gsap";

/*
 * Panggung 3D di belakang hero: empat "vibe bar" (tanda IELTS Vibe dalam 3D)
 * di kiri dan kanan judul, ditemani cincin, kapsul, dan bola berwarna skill.
 * Kursor menggeser kamera (parallax), scroll mengangkat dan memutar kelompoknya.
 * Tengah dibiarkan kosong supaya judul tetap terbaca.
 */

const SKILL = {
  listening: "#ff7a45",
  reading: "#bb3354",
  writing: "#1f5fcc",
  speaking: "#784bd1",
  green: "#00c875",
  sky: "#b9e3ff",
};

type Floater = {
  mesh: THREE.Object3D;
  base: THREE.Vector3;
  speed: number;
  amp: number;
  spin: THREE.Vector3;
  depth: number;
  /** Posisi x sebagai pecahan setengah lebar layar yang terlihat (-1 kiri, 1 kanan). */
  fx: number;
};

export function HeroScene({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.HemisphereLight("#ffffff", "#d0d4e4", 1.6));
    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#b9e3ff", 1.2);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);

    const material = (color: string) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.25 });

    const floaters: Floater[] = [];
    const add = (mesh: THREE.Object3D, position: [number, number, number], opts: Partial<Floater> = {}) => {
      mesh.position.set(...position);
      world.add(mesh);
      floaters.push({
        mesh,
        base: mesh.position.clone(),
        speed: opts.speed ?? 0.6 + Math.random() * 0.6,
        amp: opts.amp ?? 0.18 + Math.random() * 0.12,
        spin: opts.spin ?? new THREE.Vector3(Math.random() * 0.3, Math.random() * 0.4, 0),
        depth: opts.depth ?? 1,
        fx: position[0],
      });
    };

    // Vibe bar kiri: empat balok bulat setinggi berbeda, seperti meter suara.
    const bars = new THREE.Group();
    const heights = [1.6, 2.6, 2.1, 1.3];
    const colors = [SKILL.listening, SKILL.reading, SKILL.writing, SKILL.speaking];
    heights.forEach((h, i) => {
      const bar = new THREE.Mesh(new RoundedBoxGeometry(0.62, h, 0.62, 6, 0.28), material(colors[i]));
      bar.position.set(i * 0.8 - 1.2, h / 2 - 1.3, 0);
      bars.add(bar);
    });
    bars.rotation.set(0.18, 0.5, -0.08);
    add(bars, [-0.74, -0.4, 0], { amp: 0.12, spin: new THREE.Vector3(0, 0.12, 0), depth: 1.2 });

    // Cincin dan bentuk pengiring.
    add(new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.26, 32, 80), material(SKILL.sky)), [0.8, 1.4, -1], { depth: 1.4 });
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.9, 12, 24), material(SKILL.green)), [0.68, -1.7, 0.6], { depth: 1.1 });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.46, 48, 48), material(SKILL.speaking)), [0.93, -0.5, -2], { depth: 0.8 });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 48, 48), material(SKILL.listening)), [-0.6, 2.7, -1.5], { depth: 0.7 });
    add(new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.8, 0.8, 6, 0.22), material(SKILL.writing)), [-0.95, 2.1, -3], {
      depth: 0.6,
    });
    add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.14, 24, 60), material(SKILL.reading)), [0.6, 2.9, -2.5], {
      depth: 0.9,
    });

    // --- Ukuran ---
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      // Layar sempit: scene berupa strip pendek, kamera sedikit mundur.
      camera.position.z = w < 768 ? 17 : 14;
      camera.updateProjectionMatrix();
      // Bentuk ditempatkan relatif terhadap lebar yang terlihat, jadi tengah
      // (tempat judul) tetap kosong di layar lebar maupun sempit.
      floaters.forEach((f) => {
        const distance = camera.position.z - f.base.z;
        const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance * camera.aspect;
        f.base.x = f.fx * halfWidth;
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // --- Parallax kursor & scroll ---
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const scroll = { progress: 0 };
    const trigger = reduced
      ? null
      : ScrollTrigger.create({
          trigger: host,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => gsap.to(scroll, { progress: self.progress, duration: 0.4, overwrite: true }),
        });

    // Masuk: bentuk-bentuk "jatuh" ke posisinya.
    if (!reduced) {
      floaters.forEach((f, i) => {
        f.mesh.scale.setScalar(0.001);
        gsap.to(f.mesh.scale, { x: 1, y: 1, z: 1, duration: 1.1, delay: 0.25 + i * 0.08, ease: "back.out(1.7)" });
      });
    }

    // --- Loop, berhenti saat hero tidak terlihat ---
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(host);

    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      eased.x += (pointer.x - eased.x) * 0.05;
      eased.y += (pointer.y - eased.y) * 0.05;

      floaters.forEach((f, i) => {
        f.mesh.position.x = f.base.x + eased.x * 0.35 * f.depth;
        f.mesh.position.y = f.base.y + Math.sin(t * f.speed + i) * f.amp - eased.y * 0.25 * f.depth + scroll.progress * 3 * f.depth;
        f.mesh.rotation.x += f.spin.x * 0.01;
        f.mesh.rotation.y += f.spin.y * 0.01;
      });
      world.rotation.y = eased.x * 0.08 + scroll.progress * 0.5;
      world.rotation.x = eased.y * 0.05;
      camera.position.x = eased.x * 0.4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const loop = () => {
      if (visible) tick();
    };
    if (reduced) {
      tick();
    } else {
      gsap.ticker.add(loop);
    }

    return () => {
      if (!reduced) gsap.ticker.remove(loop);
      trigger?.kill();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
