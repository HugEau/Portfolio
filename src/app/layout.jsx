import Head from "next/head"

import Header from "App/components/Header/Header"

import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"

import "App/assets/styles/layout.scss"

config.autoAddCss = false

export const metadata = {
	title: "Hugo Chesnel",
	description: "Portfolio de Hugo Chesnel, développeur Full Stack"
}

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
					rel="stylesheet"
				/>
			</Head>

			<body>
				<Header />
				{children}
			</body>
		</html>
	)
}
