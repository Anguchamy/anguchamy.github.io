import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL (Lenis)
// ═══════════════════════════════════════════════════════════════════════════
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ═══════════════════════════════════════════════════════════════════════════
// THREE.JS 3D BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════
const canvas = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvas.appendChild(renderer.domElement);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

const color1 = new THREE.Color('#6366f1'); // Primary
const color2 = new THREE.Color('#22d3ee'); // Secondary
const color3 = new THREE.Color('#a855f7'); // Accent

for (let i = 0; i < particlesCount * 3; i += 3) {
  // Position
  posArray[i] = (Math.random() - 0.5) * 100;
  posArray[i + 1] = (Math.random() - 0.5) * 100;
  posArray[i + 2] = (Math.random() - 0.5) * 100;
  
  // Color - randomly pick from palette
  const colorChoice = Math.random();
  let color;
  if (colorChoice < 0.33) color = color1;
  else if (colorChoice < 0.66) color = color2;
  else color = color3;
  
  colorsArray[i] = color.r;
  colorsArray[i + 1] = color.g;
  colorsArray[i + 2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Floating geometric shapes
const shapes = [];
const geometries = [
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.OctahedronGeometry(1, 0),
  new THREE.TetrahedronGeometry(1, 0),
  new THREE.TorusGeometry(0.7, 0.3, 8, 16),
];

for (let i = 0; i < 15; i++) {
  const geometry = geometries[Math.floor(Math.random() * geometries.length)];
  const material = new THREE.MeshBasicMaterial({
    color: [0x6366f1, 0x22d3ee, 0xa855f7][Math.floor(Math.random() * 3)],
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (Math.random() - 0.5) * 60;
  mesh.position.y = (Math.random() - 0.5) * 60;
  mesh.position.z = (Math.random() - 0.5) * 40 - 10;
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  
  const scale = Math.random() * 1.5 + 0.5;
  mesh.scale.set(scale, scale, scale);
  
  shapes.push({
    mesh,
    rotationSpeed: {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
    },
    floatSpeed: Math.random() * 0.5 + 0.5,
    floatOffset: Math.random() * Math.PI * 2,
  });
  
  scene.add(mesh);
}

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Smooth mouse follow
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  
  // Rotate particles based on mouse
  particlesMesh.rotation.y = targetX * 0.3;
  particlesMesh.rotation.x = targetY * 0.3;
  
  // Slow continuous rotation
  particlesMesh.rotation.y += 0.0005;
  particlesMesh.rotation.x += 0.0002;
  
  // Animate shapes
  shapes.forEach((shape, i) => {
    shape.mesh.rotation.x += shape.rotationSpeed.x;
    shape.mesh.rotation.y += shape.rotationSpeed.y;
    shape.mesh.position.y += Math.sin(elapsedTime * shape.floatSpeed + shape.floatOffset) * 0.01;
  });
  
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════
const scrollProgress = document.getElementById('scroll-progress');

lenis.on('scroll', ({ scroll, limit }) => {
  const progress = (scroll / limit) * 100;
  scrollProgress.style.width = `${progress}%`;
});

// ═══════════════════════════════════════════════════════════════════════════
// REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
});

revealElements.forEach((el) => revealObserver.observe(el));

// ═══════════════════════════════════════════════════════════════════════════
// NAV DOTS ACTIVE STATE
// ═══════════════════════════════════════════════════════════════════════════
const sections = ['hero', 'about', 'projects', 'experience', 'skills', 'contact'];
const navDots = document.querySelectorAll('.nav-dot');

lenis.on('scroll', ({ scroll }) => {
  const windowHeight = window.innerHeight;
  const mid = scroll + windowHeight / 2;
  
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el || !navDots[i]) return;
    
    if (el.offsetTop <= mid && el.offsetTop + el.offsetHeight > mid) {
      navDots.forEach((d) => d.classList.remove('active'));
      navDots[i].classList.add('active');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TYPED TEXT ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
const roles = [
  'Generative AI Platforms',
  'Agentic AI Systems',
  'LangChain + LangGraph',
  'Distributed Systems',
  'Enterprise Infrastructure',
];

const typedElement = document.getElementById('typed-role');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeRole() {
  const currentRole = roles[roleIndex];
  
  if (isDeleting) {
    typedElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }
  
  let delay = isDeleting ? 30 : 80;
  
  if (!isDeleting && charIndex === currentRole.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 500;
  }
  
  setTimeout(typeRole, delay);
}

setTimeout(typeRole, 1500);

// ═══════════════════════════════════════════════════════════════════════════
// GSAP ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
// Hero entrance animation
gsap.from('.hero-badge', {
  opacity: 0,
  y: 30,
  duration: 1,
  delay: 0.3,
  ease: 'power3.out',
});

gsap.from('.hero-title', {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.5,
  ease: 'power3.out',
});

gsap.from('.hero-subtitle', {
  opacity: 0,
  y: 30,
  duration: 1,
  delay: 0.7,
  ease: 'power3.out',
});

// Parallax effect on scroll
lenis.on('scroll', ({ scroll }) => {
  const heroContent = document.querySelector('#hero .container');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
    heroContent.style.opacity = 1 - scroll / 800;
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL TO SECTIONS
// ═══════════════════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, {
        offset: 0,
        duration: 1.5,
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SKILL TAGS HOVER EFFECT
// ═══════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.skill-tag').forEach((tag) => {
  tag.addEventListener('mouseenter', () => {
    gsap.to(tag, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
    });
  });
  
  tag.addEventListener('mouseleave', () => {
    gsap.to(tag, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT CARDS 3D TILT
// ═══════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

console.log('🚀 Portfolio loaded successfully!');
