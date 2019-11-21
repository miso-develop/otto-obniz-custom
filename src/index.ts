const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import OTTO from "./OTTO/"

;import Util from "./OTTO/util";
 (async () => {
	
	const obnizId = process.env.OBNIZ_ID || ""
	if (!obnizId) throw new Error("Error: obniz id is invalid!")
	const obniz: Obniz = new Obniz(obnizId)
	if (!(await obniz.connectWait({timeout: 3}))) {
		obniz.close()
		throw new Error("Error: Failed to connect obniz!")
	}
	
	// `obniz.wired("OTTO", {rightLeg: 0, leftLeg: 1 ...})`の代わり
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
	
	await otto.calibration()
	await Util.sleep(1000)
	// await otto.walkForward(100)
	
	await Promise.race([
		otto.dance(100),
		otto.sing(otto.song.paprika),
	])
	
	
	otto.stop()
	
})()

log("OTTO Obniz start!")
