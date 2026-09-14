'use strict';
// Animation partagée du logo SVG (ECG + silhouette coureur) — Calor Run
// Utilisé par : live_trail.html, participants.html, podiums.html, resultats.html, statistiques.html

const CONFIG = {
    ecg: { speed: 2, trailLength: 25, sampleStep: 1 },
    path: { duration: 3000, pauseBetween: 100, trailLength: 12 }
};

const $ = id => document.getElementById(id);

const setCirclePosition = (circle, point) => {
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
};

const updateTrail = (trailElement, points, maxLength) => {
    if (points.length > maxLength) points.shift();
    trailElement.setAttribute("points", points.join(" "));
    trailElement.style.opacity = 0.2 + 0.4 * (points.length / maxLength);
};

const samplePolylineUniform = (polyline, step = 1) => {
    const pts = [];
    const len = polyline.getTotalLength();
    for (let l = 0; l <= len; l += step) pts.push(polyline.getPointAtLength(l));
    return pts;
};

// ECG animation
function animateECG() {
    const ecgDot = $("ecgDot"), ecgHalo = $("ecgHalo"), ecgTrail = $("ecgTrail");
    const left = samplePolylineUniform($("ecg_left"), CONFIG.ecg.sampleStep);
    const right = samplePolylineUniform($("ecg_right"), CONFIG.ecg.sampleStep);
    const all = [...left, ...right];
    const trailPts = [];
    let i = 0;

    function frame() {
        const p = all[i];
        setCirclePosition(ecgDot, p);
        setCirclePosition(ecgHalo, p);
        trailPts.push(`${p.x},${p.y}`);
        updateTrail(ecgTrail, trailPts, CONFIG.ecg.trailLength);
        i = (i + 1) % all.length;
        setTimeout(frame, CONFIG.ecg.speed);
    }
    frame();
}

// Path animation
async function animatePath(path, duration = CONFIG.path.duration) {
    const pulse = $("pulse"), halo = $("halo"), trail = $("trail");
    const pts = [];
    const len = path.getTotalLength();
    const start = performance.now();
    return new Promise(resolve => {
        function frame(t) {
            const prog = Math.min((t - start) / duration, 1);
            const p = path.getPointAtLength(prog * len);
            setCirclePosition(pulse, p);
            setCirclePosition(halo, p);
            pts.push(`${p.x},${p.y}`);
            updateTrail(trail, pts, CONFIG.path.trailLength);
            if (prog < 1) requestAnimationFrame(frame);
            else resolve();
        }
        requestAnimationFrame(frame);
    });
}

async function animatePathLoop() {
    const paths = ["coeur_gauche", "coeur_droit", "coureur"].map($);
    const trail = $("trail");
    while (true) {
        for (const p of paths) {
            trail.setAttribute("points", "");
            await animatePath(p);
            await new Promise(r => setTimeout(r, CONFIG.path.pauseBetween));
        }
    }
}

animateECG();
animatePathLoop();
