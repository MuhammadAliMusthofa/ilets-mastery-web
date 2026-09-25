"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap, prefersReducedMotion } from "@/src/_global/motion/gsap";

/*
 * Panggung 3D untuk showcase skill: satu objek per kategori (headphone, buku,
 * pensil, mikrofon, balok huruf). Ganti kategori → objek lama berputar keluar,
 * objek baru berputar masuk. Scroll → seluruh rig naik, berputar, mengecil,
 * lalu memudar sampai hilang.
 */

export type StageKey = "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "BASIC";

const INK = "#181b34";
const WHITE = "#ffffff";

const mat = (color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.7,
    clearcoatRoughness: 0.3,
    transparent: true,
    ...extra,
  });

function headphones() {
  const group = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.16, 24, 80, Math.PI), mat(INK));
  band.position.y = 0.25;
  group.add(band);
  const cushion = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.11, 16, 60, Math.PI * 0.7), mat("#292f4c"));
  cushion.position.set(0, 0.25, 0.1);
  cushion.rotation.z = Math.PI * 0.15;
  group.add(cushion);
  [-1, 1].forEach((side) => {
    const cup = new THREE.Mesh(new RoundedBoxGeometry(0.62, 1.05, 0.62, 6, 0.26), mat(WHITE));
    cup.position.set(side * 1.35, -0.2, 0);
    group.add(cup);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 40), mat(INK));
    pad.rotation.z = Math.PI / 2;
    pad.position.set(side * 1.05, -0.2, 0);
    group.add(pad);
  });
  return group;
}

function book() {
  const group = new THREE.Group();
  [-1, 1].forEach((side) => {
    const cover = new THREE.Mesh(new RoundedBoxGeometry(1.5, 2.1, 0.12, 4, 0.05), mat(INK));
    cover.position.set(side * 0.74, 0, -0.08);
    cover.rotation.y = side * -0.35;
    group.add(cover);
    const pages = new THREE.Mesh(new RoundedBoxGeometry(1.36, 1.95, 0.22, 4, 0.06), mat("#fbfaf5", { clearcoat: 0 }));
    pages.position.set(side * 0.7, 0, 0.06);
    pages.rotation.y = side * -0.35;
    group.add(pages);
    // Garis-garis teks di halaman.
    for (let line = 0; line < 5; line++) {
      const bar = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.07, 0.02, 2, 0.03), mat("#c3c6d4", { clearcoat: 0 }));
      bar.position.set(side * 0.72, 0.55 - line * 0.25, 0.19);
      bar.rotation.y = side * -0.35;
      group.add(bar);
    }
  });
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.1, 20), mat(INK));
  spine.position.z = -0.12;
  group.add(spine);
  group.rotation.x = -0.25;
  return group;
}

function pencil() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.6, 6), mat("#ffcb00"));
  group.add(body);
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 6), mat("#f3c89a", { clearcoat: 0 }));
  wood.position.y = -1.65;
  wood.rotation.x = Math.PI;
  group.add(wood);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 12), mat(INK));
  lead.position.y = -1.9;
  lead.rotation.x = Math.PI;
  group.add(lead);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24), mat("#c3c6d4", { metalness: 0.8, roughness: 0.25 }));
  band.position.y = 1.45;
  group.add(band);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.35, 24), mat("#ff7aa2"));
  eraser.position.y = 1.78;
  group.add(eraser);
  group.rotation.z = -0.7;
  return group;
}

function microphone() {
  const group = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 48), mat("#dfe2ee", { metalness: 0.6, roughness: 0.3 }));
  head.position.y = 0.95;
  group.add(head);
  const grille = new THREE.Mesh(
    new THREE.SphereGeometry(0.64, 16, 12),
    new THREE.MeshBasicMaterial({ color: "#676879", wireframe: true, transparent: true, opacity: 0.6 })
  );
  grille.position.y = 0.95;
  group.add(grille);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.25, 32), mat(INK));
  collar.position.y = 0.28;
  group.add(collar);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 1.6, 32), mat(INK));
  handle.position.y = -0.65;
  group.add(handle);
  const button = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.3, 0.1, 2, 0.04), mat("#00c875"));
  button.position.set(0, -0.2, 0.28);
  group.add(button);
  group.rotation.z = 0.25;
  return group;
}

function letterTexture(letter: string, bg: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = INK;
  ctx.font = "700 170px Poppins, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 128, 140);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function letterBlocks() {
  const group = new THREE.Group();
  const blocks: Array<[string, string, [number, number, number], number]> = [
    ["A", "#ffffff", [-0.62, -0.55, 0], 0.15],
    ["B", "#fdab3d", [0.62, -0.55, 0.1], -0.2],
    ["C", "#b9e3ff", [0, 0.62, 0.05], 0.3],
  ];
  blocks.forEach(([letter, bg, position, spin]) => {
    const texture = letterTexture(letter, bg);
    const cube = new THREE.Mesh(
      new RoundedBoxGeometry(1.15, 1.15, 1.15, 6, 0.14),
      Array.from({ length: 6 }, () => mat("#ffffff", { map: texture, clearcoat: 0.4 }))
    );
    cube.position.set(...position);
    cube.rotation.y = spin;
    group.add(cube);
  });
  return group;
}

const BUILDERS: Record<StageKey, () => THREE.Group> = {
  LISTENING: headphones,
  READING: book,
  WRITING: pencil,
  SPEAKING: microphone,
  BASIC: letterBlocks,
};

const materialsOf = (object: THREE.Object3D) => {
  const list: THREE.Material[] = [];
  object.traverse((node) => {
    if (node instanceof THREE.Mesh) list.push(...(Array.isArray(node.material) ? node.material : [node.material]));
  });
  return list;
};

export function SkillStage({
  active,
  progress,
  className,
}: {
  active: StageKey;
  /**
   * Progres scroll 0–1 yang diisi oleh section (dari ScrollTrigger pin-nya).
   * Dibaca setiap frame, jadi panggung tidak perlu menghitung posisi scroll sendiri.
   */
  progress: React.RefObject<number>;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ show: (key: StageKey) => void } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 11);
    scene.add(new THREE.HemisphereLight("#ffffff", "#8a8fa8", 1.8));
    const key = new THREE.DirectionalLight("#ffffff", 2.6);
    key.position.set(3, 5, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#ffffff", 1.2);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    // rig = transform scroll & parallax; float = ayunan idle; objek per kategori di dalamnya.
    const rig = new THREE.Group();
    const float = new THREE.Group();
    rig.add(float);
    scene.add(rig);

    const objects = {} as Record<StageKey, THREE.Group>;
    (Object.keys(BUILDERS) as StageKey[]).forEach((stageKey) => {
      const group = BUILDERS[stageKey]();
      const holder = new THREE.Group();
      holder.add(group);
      holder.visible = false;
      holder.scale.setScalar(0.001);
      float.add(holder);
      objects[stageKey] = holder;
    });

    let current: StageKey | null = null;
    const show = (next: StageKey) => {
      if (next === current) return;
      const previous = current ? objects[current] : null;
      const incoming = objects[next];
      current = next;
      if (reduced) {
        if (previous) previous.visible = false;
        incoming.visible = true;
        incoming.scale.setScalar(1);
        return;
      }
      if (previous) {
        gsap.killTweensOf([previous.scale, previous.rotation]);
        gsap.to(previous.rotation, { y: previous.rotation.y + Math.PI, duration: 0.45, ease: "power2.in" });
        gsap.to(previous.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          duration: 0.45,
          ease: "back.in(1.6)",
          onComplete: () => {
            previous.visible = false;
          },
        });
      }
      gsap.killTweensOf([incoming.scale, incoming.rotation]);
      incoming.visible = true;
      incoming.rotation.set(0, -Math.PI * 0.9, 0);
      gsap.to(incoming.rotation, { y: 0, duration: 1.1, delay: previous ? 0.3 : 0, ease: "power3.out" });
      gsap.fromTo(
        incoming.scale,
        { x: 0.001, y: 0.001, z: 0.001 },
        { x: 1, y: 1, z: 1, duration: 1, delay: previous ? 0.3 : 0, ease: "back.out(1.7)" }
      );
    };
    apiRef.current = { show };

    const layout = { baseY: 0 };
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      // Layar sempit: objek lebih kecil dan sedikit naik supaya tidak menabrak teks di bawahnya.
      const narrow = w < 768;
      camera.position.z = narrow ? 21 : 11;
      layout.baseY = narrow ? 1.1 : 0;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Scroll: rig naik, berputar, mengecil, lalu memudar sampai hilang.
    // target dari section, p dihaluskan tiap frame supaya gerakan tidak patah.
    const scroll = { target: 0, p: 0 };

    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Cek langsung posisi elemen, bukan IntersectionObserver: pin ScrollTrigger memindahkan
    // section ke dalam pin-spacer dan bisa membuat observer tertinggal di status "tidak terlihat".
    const inView = () => {
      const rect = host.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const allMaterials = materialsOf(float);
    const baseOpacity = new Map(allMaterials.map((m) => [m, m.opacity]));
    const clock = new THREE.Clock();

    const tick = () => {
      const t = clock.getElapsedTime();
      eased.x += (pointer.x - eased.x) * 0.06;
      eased.y += (pointer.y - eased.y) * 0.06;
      scroll.target = reduced ? 0 : progress.current ?? 0;
      scroll.p += (scroll.target - scroll.p) * 0.12;
      const p = scroll.p;

      float.position.y = Math.sin(t * 1.2) * 0.12;
      float.rotation.y = Math.sin(t * 0.5) * 0.25 + eased.x * 0.35;
      float.rotation.x = eased.y * 0.18;

      rig.position.y = layout.baseY + p * 4.2;
      rig.position.x = p * -1.6;
      rig.rotation.z = p * 0.9;
      rig.rotation.y = p * Math.PI * 1.4;
      rig.scale.setScalar(1 - p * 0.55);
      // Mulai memudar di paruh kedua scroll, hilang total di akhir.
      const fade = Math.max(0, Math.min(1, 1 - (p - 0.35) / 0.5));
      allMaterials.forEach((m) => (m.opacity = (baseOpacity.get(m) ?? 1) * fade));

      renderer.render(scene, camera);
    };
    const loop = () => {
      if (inView()) tick();
    };
    if (reduced) tick();
    else gsap.ticker.add(loop);

    return () => {
      if (!reduced) gsap.ticker.remove(loop);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      apiRef.current = null;
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => {
            (m as THREE.MeshPhysicalMaterial).map?.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  useEffect(() => {
    apiRef.current?.show(active);
  }, [active]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
