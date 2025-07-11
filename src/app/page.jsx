import { faReact } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "App/assets/styles/page.scss"
import AnimatedWaves from "App/components/Waves/Waves"

export default function Home() {
	return (
		<>
			<div className="hero">
				<AnimatedWaves />
				<div className="hero__content">
					<h1 className="hero__content--title">
						Full-Stack<br/>Developer
					</h1>
					<p className="hero__content--subtitle">
						Hugo Chesnel
					</p>
					<div className="hero__content--description">
					</div>
				</div>
			</div>
			<div className="about">
				<div className="about__content">
					<h2 className="about__content--title">About Me</h2>
					<p className="about__content--text">
					</p>
				</div>
				<div className="about_knowledge">
					<FontAwesomeIcon icon={faReact} className="about_knowledge--icon" />
				</div>
			</div>
		</>
	)
}
