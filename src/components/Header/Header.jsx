import "App/components/Header/Header.scss"

export default function Header() {
	return (
		<header>
			<div className="header">
				<a className="header__title" href="/">
					HC
				</a>
				<ul className="header__nav">
					<li className="header__nav--item">
						<a href="#about" className="header__nav--link">
							À propos
						</a>
					</li>
					<li className="header__nav-item">
						<a href="#projects" className="header__nav--link">
							Projets
						</a>
					</li>
					<li className="header__nav-item">
						<a href="#contact" className="header__nav--link specialBtn">
							Contact
						</a>
					</li>
				</ul>
			</div>
		</header>
	)
}
