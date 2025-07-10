"use client"

import { useEffect, useRef, useState, useCallback } from 'react';

import "App/components/Waves/Waves.scss";

import { createNoise3D } from 'simplex-noise'; // Assurez-vous d'installer 'simplex-noise'

// Initialiser le générateur de bruit de Simplex
const noise3D = createNoise3D();

/**
 * Composant AuroraCanvas
 * Ce composant utilise l'élément HTML <canvas> pour dessiner des taches amorphes
 * qui se déplacent lentement, imitant l'effet des aurores boréales diffus et lumineux.
 */
export default function AuroraCanvas({
    // Couleurs des blobs, ajustées pour le style de l'image (violets, bleus, turquoises)
    // Utilisation de RGBA pour la transparence et le mélange
    blobColors = [
        'rgba(30, 0, 80, 0.5)',      // Violet très foncé
        'rgba(60, 0, 120, 0.5)',     // Violet foncé
        'rgba(0, 50, 150, 0.6)',     // Bleu profond
        'rgba(25, 68, 124, 0.6)',     // Bleu moyen
        'rgba(0, 100, 200, 0.7)',    // Bleu vif
        'rgba(0, 150, 255, 0.8)',    // Bleu lumineux
        'rgba(0, 200, 255, 0.9)',    // Turquoise clair
        'rgba(28, 48, 94, 0.7)',    // Turquoise très clair
        'rgba(0, 255, 255, 0.4)',    // Cyan/Aqua très lumineux (le plus proche de la surface)
    ],
    numBlobs = 7, // Nombre de taches amorphes
    // minRadius et maxRadius sont maintenant des ratios de la dimension la plus petite du canvas
    minRadiusRatio = 0.2, // Rayon minimum des taches (ex: 20% de la plus petite dimension du canvas)
    maxRadiusRatio = 0.35, // Rayon maximum des taches (ex: 35% de la plus petite dimension du canvas)
    noiseScale = 0.00008, // Échelle du bruit pour la fluidité des mouvements (plus petit = plus lisse)
    animationSpeed = 0.000001, // Vitesse d'animation globale (extrêmement lente)
    shapeNoiseScale = 0.15, // Augmenté pour une déformation plus prononcée de la forme
}) {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const blobs = useRef([]);
    const time = useRef(0);
    
    // Utiliser des refs pour stocker les dimensions précédentes
    const prevDimensions = useRef({ width: 0, height: 0 });

    // Utiliser l'état pour les dimensions du canvas, initialisé à 0 pour éviter 'window is not defined'
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);

    /**
     * Calcule le rayon d'un blob en fonction des dimensions du canvas et des ratios.
     */
    const calculateBlobRadius = useCallback((width, height, randomFactor) => {
        // Utiliser la plus petite dimension pour le ratio afin d'éviter des blobs trop grands sur des écrans très larges et étroits
        const minDim = Math.min(width, height);
        return minDim * (minRadiusRatio + randomFactor * (maxRadiusRatio - minRadiusRatio));
    }, [minRadiusRatio, maxRadiusRatio]);


    /**
     * Initialise les blobs ou met à l'échelle les blobs existants.
     */
    const initializeOrScaleBlobs = useCallback((newWidth, newHeight, isInitial = false, oldWidth = 0, oldHeight = 0) => {
        if (isInitial || blobs.current.length === 0) {
            // Création initiale des blobs
            blobs.current = Array.from({ length: numBlobs }).map((_, i) => {
                const randomFactor = Math.random(); // Garder ce facteur pour le scaling du rayon
                return {
                    id: i,
                    // Position initiale aléatoire
                    x: Math.random() * newWidth,
                    y: Math.random() * newHeight,
                    // Stocker le facteur aléatoire pour le scaling proportionnel du rayon
                    randomRadiusFactor: randomFactor,
                    radius: calculateBlobRadius(newWidth, newHeight, randomFactor),
                    color: blobColors[i % blobColors.length],
                    // Offsets pour le bruit de Simplex, pour que chaque tache bouge différemment
                    noiseOffsetX: Math.random() * 1000,
                    noiseOffsetY: Math.random() * 1000,
                    noiseOffsetZ: Math.random() * 1000,
                    // Vitesse de mouvement individuelle (légèrement variée)
                    speedFactor: 0.8 + Math.random() * 0.4, // Entre 0.8 et 1.2
                };
            });
        } else {
            // Mettre à l'échelle les positions et les rayons des blobs existants lorsque le canvas est redimensionné
            // Utiliser les dimensions passées en paramètres qui représentent l'état précédent
            const scaleX = newWidth / oldWidth;
            const scaleY = newHeight / oldHeight;

            // Appliquer la mise à l'échelle uniquement si les dimensions précédentes sont valides
            if (oldWidth > 0 && oldHeight > 0) {
                blobs.current.forEach(blob => {
                    blob.x *= scaleX;
                    blob.y *= scaleY;
                    // Recalculer le rayon en fonction des nouvelles dimensions
                    blob.radius = calculateBlobRadius(newWidth, newHeight, blob.randomRadiusFactor);
                });
            }
        }
    }, [numBlobs, blobColors, calculateBlobRadius]);

    /**
     * Dessine une seule tache sur le canvas.
     */
    const drawBlob = useCallback((ctx, blob, currentTime) => {
        const numPoints = 80; // Plus de points pour une déformation plus lisse
        const shapePoints = [];

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const baseRadius = blob.radius;

            // Utiliser le bruit pour déformer le rayon à chaque angle
            const deformation = noise3D(
                blob.noiseOffsetX + Math.cos(angle) * shapeNoiseScale,
                blob.noiseOffsetY + Math.sin(angle) * shapeNoiseScale,
                blob.noiseOffsetZ + currentTime * animationSpeed * blob.speedFactor * 0.1 // Animation de déformation plus lente
            );

            // Ajuster le facteur de déformation pour un effet plus ou moins prononcé
            const deformedRadius = baseRadius + deformation * (baseRadius * 1.0); // Augmenté pour plus de déformation
            const x = blob.x + Math.cos(angle) * deformedRadius;
            const y = blob.y + Math.sin(angle) * deformedRadius;
            shapePoints.push({ x, y });
        }

        // Créer un dégradé radial pour le remplissage
        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0, // Centre du dégradé (début)
            blob.x, blob.y, blob.radius * 1.8 // Le dégradé s'étend plus loin pour plus de flou
        );
        // Couleur au centre (plus opaque)
        gradient.addColorStop(0, blob.color.replace(/,(\s*\d+\.?\d*)\)$/, ', 0.8)'));
        // Couleur à la périphérie (complètement transparente)
        gradient.addColorStop(1, blob.color.replace(/,(\s*\d+\.?\d*)\)$/, ', 0)'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(shapePoints[0].x, shapePoints[0].y);
        for (let i = 1; i < shapePoints.length; i++) {
            // Utilisation de quadraticCurveTo pour des formes plus lisses
            const p0 = shapePoints[i - 1];
            const p1 = shapePoints[i];
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        // Fermer le chemin en douceur
        const lastP = shapePoints[shapePoints.length - 1];
        const firstP = shapePoints[0];
        const midXLastFirst = (lastP.x + firstP.x) / 2;
        const midYLastFirst = (lastP.y + firstP.y) / 2;
        ctx.quadraticCurveTo(lastP.x, lastP.y, midXLastFirst, midYLastFirst);

        ctx.closePath();
        ctx.fill();
    }, [animationSpeed, shapeNoiseScale]);

    /**
     * Fonction d'animation principale qui met à jour les positions des blobs et les redessine.
     */
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        // Si le canvas n'est pas prêt ou les dimensions ne sont pas définies, on attend
        if (!canvas || canvasWidth === 0 || canvasHeight === 0) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }
        const ctx = canvas.getContext('2d');

        // Effacer le canvas pour chaque nouvelle frame
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Mettre à jour et dessiner chaque tache
        blobs.current.forEach(blob => {
            // Mettre à jour la position de la tache en utilisant le bruit de Simplex
            const dx = noise3D(
                blob.noiseOffsetX + time.current * animationSpeed * blob.speedFactor,
                blob.noiseOffsetY,
                blob.noiseOffsetZ
            );
            const dy = noise3D(
                blob.noiseOffsetX,
                blob.noiseOffsetY + time.current * animationSpeed * blob.speedFactor,
                blob.noiseOffsetZ
            );

            // Appliquer le mouvement en fonction du bruit et de l'amplitude souhaitée
            blob.x += dx * 0.5; // Très petite impulsion pour un mouvement subtil
            blob.y += dy * 0.5;

            // Faire en sorte que les taches restent dans les limites du canvas en les "enroulant"
            // Cette logique est cruciale pour le mouvement continu et est la seule qui gère les limites.
            if (blob.x < -blob.radius) blob.x = canvasWidth + blob.radius;
            if (blob.x > canvasWidth + blob.radius) blob.x = -blob.radius;
            if (blob.y < -blob.radius) blob.y = canvasHeight + blob.radius;
            if (blob.y > canvasHeight + blob.radius) blob.y = -blob.radius;

            drawBlob(ctx, blob, time.current); // Passer time.current
        });

        time.current += 1; // Incrémenter le temps pour l'animation
        animationFrameId.current = requestAnimationFrame(animate); // Boucler l'animation
    }, [canvasWidth, canvasHeight, animationSpeed, drawBlob]);

    // Effet pour définir les dimensions initiales du canvas et démarrer l'animation
    useEffect(() => {
        // Définir les dimensions initiales côté client
        if (typeof window !== 'undefined') {
            const initialWidth = canvasRef.current.parentElement.offsetWidth;
            const initialHeight = canvasRef.current.parentElement.offsetHeight;

            setCanvasWidth(initialWidth);
            setCanvasHeight(initialHeight);
            
            // Stocker les dimensions initiales
            prevDimensions.current = { width: initialWidth, height: initialHeight };
            
            // Initialiser les blobs pour la première fois avec les dimensions réelles
            initializeOrScaleBlobs(initialWidth, initialHeight, true, initialWidth, initialHeight);
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Démarrer la boucle d'animation
        animationFrameId.current = requestAnimationFrame(animate);

        // Nettoyage : arrêter l'animation lors du démontage du composant
        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [animate, initializeOrScaleBlobs]);

    /**
     * Gère le redimensionnement de la fenêtre pour ajuster le canvas et les positions des blobs.
     */
    const handleResize = useCallback(() => {
        if (typeof window !== 'undefined') {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            
            // Mettre à jour l'état des dimensions, ce qui déclenchera un re-rendu
            setCanvasWidth(newWidth);
            setCanvasHeight(newHeight);
        }
    }, []);

    // Effet pour gérer le redimensionnement des blobs quand les dimensions changent
    useEffect(() => {
        if (canvasWidth > 0 && canvasHeight > 0) {
            // Utiliser les dimensions stockées dans la ref (les vraies anciennes dimensions)
            const oldWidth = prevDimensions.current.width;
            const oldHeight = prevDimensions.current.height;
            
            // Si ce n'est pas la première fois et qu'on a des dimensions précédentes valides
            if (oldWidth > 0 && oldHeight > 0 && (oldWidth !== canvasWidth || oldHeight !== canvasHeight)) {
                // Mettre à l'échelle les blobs existants aux nouvelles dimensions
                initializeOrScaleBlobs(canvasWidth, canvasHeight, false, oldWidth, oldHeight);
            }
            
            // Mettre à jour les dimensions stockées
            prevDimensions.current = { width: canvasWidth, height: canvasHeight };
        }
    }, [canvasWidth, canvasHeight, initializeOrScaleBlobs]);

    // Effet pour ajouter et supprimer l'écouteur d'événement de redimensionnement
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [handleResize]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'block',
                zIndex: 1,
                pointerEvents: 'none',
            }}
        />
    );
}