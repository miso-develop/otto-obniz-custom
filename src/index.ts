const log = (...v: any[]) => console.log(...v)
require("dotenv").config()
import Obniz from "obniz"
import OTTO from "./OTTO/"

; (async () => {
	const obnizId = process.env.OBNIZ_ID || ""
	if (!obnizId) throw new Error("Error: obniz id is invalid!")
	const obniz: Obniz = new Obniz(obnizId)
	if (!(await obniz.connectWait({timeout: 3}))) {
		obniz.close()
		throw new Error("Error: Failed to connect obniz!")
	}
	
	// `obnizId,wired("OTTO", {rightLeg: 0, leftLeg: 1 ...})`の代わり
	const otto: OTTO = await new OTTO(obniz, {
		rightLeg: 0,
		leftLeg: 1,
		rightFoot: 2,
		leftFoot: 3,
		eyeTrigger: 4,
		eyeEcho: 5,
		voice: 6,
		vcc: 10,
		gnd: 11
	})
	
	otto.step.calibration()
	otto.walkForward(100)
	
})()

log("OTTO Obniz start!")
