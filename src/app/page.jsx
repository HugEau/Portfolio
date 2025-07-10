import "App/assets/styles/page.scss"
import AnimatedWaves from "App/components/Waves/Waves"

export default function Home() {
	return (
		<>
			<div className="hero">
				<AnimatedWaves />
				<div className="hero__content">
					<h1 className="hero__content--title">
						Full-Stack<br/>Développeur
					</h1>
					<p className="hero__content--subtitle">
						Hugo Chesnel
					</p>
					<div className="hero__content--description">
					</div>
				</div>
			</div>
		</>
	)
}
