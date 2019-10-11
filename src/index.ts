const log = (...v: any[]) => console.log(...v)
require("dotenv").config()
import OTTO from "./otto"

; (async () => {
	const obnizId = process.env.OBNIZ_ID || ""
	
	const action: OTTO.ActionType = "walkForward"
	const step = 10
	
	const otto: OTTO = await new OTTO().init(obnizId)
	await otto[action](step)
	
})()

log("OTTO Obniz start!")
