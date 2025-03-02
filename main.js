import WindowManager from './WindowManager.js';
import * as THREE from 'three';

const t = THREE;
let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let planets = [];
let forceLines = []; // Store the gravitational force lines
let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

// Gravitational constant
const G = 6.67430e-11;

// Get time in seconds since the beginning of the day
function getTime() {
    return (new Date().getTime() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear")) {
    localStorage.clear();
} else {
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState != 'hidden' && !initialized) {
            init();
        }
    });

    window.onload = () => {
        if (document.visibilityState != 'hidden') {
            init();
        }
    };

    function init() {
        initialized = true;

        setTimeout(() => {
            setupScene();
            setupWindowManager();
            resize();
            updateWindowShape(false);
            render();
            window.addEventListener('resize', resize);
        }, 500);
    }

    function setupScene() {
        camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
        camera.position.z = 2.5;
        near = camera.position.z - .5;
        far = camera.position.z + 0.5;

        scene = new t.Scene();
        scene.background = new t.Color(0.0);
        scene.add(camera);

        renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
        renderer.setPixelRatio(pixR);

        world = new t.Object3D();
        scene.add(world);

        renderer.domElement.setAttribute("id", "scene");
        document.body.appendChild(renderer.domElement);
    }

    function setupWindowManager() {
        windowManager = new WindowManager();
        windowManager.setWinShapeChangeCallback(updateWindowShape);
        windowManager.setWinChangeCallback(windowsUpdated);

        let metaData = { foo: "bar" };

        windowManager.init(metaData);
        windowsUpdated();
    }

    function windowsUpdated() {
        updateNumberOfPlanets();
    }

    function updateNumberOfPlanets() {
        let wins = windowManager.getWindows();
    
        // Limit the number of planets to 4
        let maxPlanets = 4;
        if (wins.length > maxPlanets) {
            wins = wins.slice(0, maxPlanets); // Trim the array to 4 windows at most
        }
    
        // Remove excess planets if there are fewer windows than planets
        while (planets.length > wins.length) {
            let removedPlanet = planets.pop();
            world.remove(removedPlanet);
        }
    
        for (let i = 0; i < wins.length; i++) {
            let win = wins[i];
    
            // Only create new planet if it doesn't exist
            if (!planets[i]) {
                let color = new t.Color();
                color.setHSL(i * 0.1, 1.0, 0.5);
    
                let radius = 100 + i * 50;
                let planet = new t.Mesh(
                    new t.SphereGeometry(radius, 16, 16),
                    new t.MeshBasicMaterial({ color: color, wireframe: true })
                );
    
                planet.position.x = win.shape.x + (win.shape.w * 0.5);
                planet.position.y = win.shape.y + (win.shape.h * 0.5);
    
                world.add(planet);
                planets.push(planet);
            }
            createGravitationalLines();
        }

    }
    

    // Create gravitational lines between planets
    function createGravitationalLines() {
        for (let i = 0; i < planets.length - 1; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                let planet1 = planets[i];
                let planet2 = planets[j];

                // Calculate distance between planets
                let dx = planet2.position.x - planet1.position.x;
                let dy = planet2.position.y - planet1.position.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate gravitational force
                let force = (G * planet1.geometry.parameters.radius * planet2.geometry.parameters.radius) / (distance * distance);

                // Create a line to represent the gravitational force
                let points = [
                    new t.Vector3(planet1.position.x, planet1.position.y, 0),
                    new t.Vector3(planet2.position.x, planet2.position.y, 0)
                ];
                let geometry = new t.BufferGeometry().setFromPoints(points);
                let material = new t.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
                let line = new t.Line(geometry, material);

                world.add(line);
                forceLines.push(line);
            }
        }
    }

    function updateWindowShape(easing = true) {
        sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
        if (!easing) sceneOffset = sceneOffsetTarget;
    }

    function render() {
        let t = getTime();

        windowManager.update();

        let falloff = 0.05;
        sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
        sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);

        world.position.x = sceneOffset.x;
        world.position.y = sceneOffset.y;

        let wins = windowManager.getWindows();

        for (let i = 0; i < planets.length; i++) {
            let planet = planets[i];
            let win = wins[i];
            let _t = t;

            let posTarget = { x: win.shape.x + (win.shape.w * 0.5), y: win.shape.y + (win.shape.h * 0.5) };

            planet.position.x = planet.position.x + (posTarget.x - planet.position.x) * falloff;
            planet.position.y = planet.position.y + (posTarget.y - planet.position.y) * falloff;
            planet.rotation.x = _t * 0.5;
            planet.rotation.y = _t * 0.3;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
}
