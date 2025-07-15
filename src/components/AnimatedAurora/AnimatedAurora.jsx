"use client"

import { createNoise3D } from "simplex-noise"

import { useEffect, useRef } from "react"

export default function AnimatedAurora(props) {
	const backgroundColor = props.backgroundColor || "#02010f"
	const canvasRef = useRef(null)

	useEffect(() => {
		if (typeof window === "undefined") return
		const canvas = canvasRef.current
		if (!canvas) return
		const parent = canvas.parentElement
		if (!parent) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		function resize() {
			const dpr = window.devicePixelRatio || 1
			const w = parent.clientWidth
			const h = parent.clientHeight
			canvas.width = w * dpr
			canvas.height = h * dpr
			canvas.style.width = `${w}px`
			canvas.style.height = `${h}px`
			ctx.scale(dpr, dpr)
		}

		resize()
		window.addEventListener("resize", resize)

		const noise3D = createNoise3D()
		let t = 0
		let raf
		const layers = 5
		const freq = 0.002
		const amplitudeFactor = 0.4

		const baseColors = [
			{
				0: "rgba(80,180,255,0.7)",
				0.35: "rgba(120,255,210,0.25)",
				0.7: "rgba(180,255,240,0.13)",
				1: "rgba(32,20,60,0.1)"
			},
			{
				0: "rgba(90,120,255,0.6)",
				0.3: "rgba(160,120,255,0.18)",
				0.65: "rgba(200,180,255,0.08)",
				1: "rgba(32,20,60,0.1)"
			},
			{
				0: "rgba(110,220,200,0.5)",
				0.45: "rgba(120,255,210,0.22)",
				0.8: "rgba(180,120,255,0.12)",
				1: "rgba(32,20,60,0.1)"
			},
			{
				0: "rgba(60,80,180,0.5)",
				0.5: "rgba(120,255,210,0.13)",
				0.8: "rgba(120,120,255,0.18)",
				1: "rgba(32,20,60,0.1)"
			},
			{
				0: "rgba(120,180,255,0.45)",
				0.5: "rgba(180,255,240,0.09)",
				0.8: "rgba(200,180,255,0.13)",
				1: "rgba(32,20,60,0.1)"
			}
		]

		function drawLayer(i, w, h) {
			// Prepare gradient
			const grad = ctx.createLinearGradient(0, 0, 0, h)
			Object.entries(baseColors[i]).forEach(([stop, col]) =>
				grad.addColorStop(parseFloat(stop), col)
			)
			ctx.fillStyle = grad
			ctx.globalCompositeOperation = "lighter"
			// ctx.filter = "blur(10px)"

			// Top wave
			const topPoints = []
			for (let x = 0; x <= w; x += 5) {
				const noiseVal = noise3D(x * freq * 0.6 + i * 80 + t * 0.5, t * 0.3, 0)
				const y = h / 2 + noiseVal * h * amplitudeFactor - i * 10
				topPoints.push({ x, y })
			}

			// Bottom wave independent but equal impact
			const bottomPoints = []
			for (let x = 0; x <= w; x += 5) {
				const noiseVal = noise3D(x * freq * 0.6 + i * 80 - t * 0.5, t * 0.3, 1)
				const y = h / 2 + noiseVal * h * amplitudeFactor * 1.5 + i * 20
				bottomPoints.push({ x, y })
			}

			// Draw combined shape
			ctx.beginPath()
			// Draw top
			topPoints.forEach((pt, idx) =>
				idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
			)
			// Draw bottom reverse
			for (let j = bottomPoints.length - 1; j >= 0; j--) {
				const pt = bottomPoints[j]
				ctx.lineTo(pt.x, pt.y)
			}
			ctx.closePath()
			ctx.fill()
		}

		function draw() {
			const w = parent.clientWidth
			const h = parent.clientHeight

			// Clear
			ctx.save()
			ctx.globalCompositeOperation = "source-over"
			ctx.filter = "none"
			ctx.fillStyle = backgroundColor
			ctx.fillRect(0, 0, w, h)
			ctx.restore()

			// Slow movement
			t += 0.00025
			for (let i = 0; i < layers; i++) {
				drawLayer(i, w, h)
			}

			raf = requestAnimationFrame(draw)
		}

		draw()

		return () => {
			window.removeEventListener("resize", resize)
			cancelAnimationFrame(raf)
		}
	}, [backgroundColor])

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: -1,
				pointerEvents: "none",
				filter: "blur(5px)"
			}}
		/>
	)
}
