const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import { HCSR04 } from "obniz/parts/DistanceSensor/HC-SR04"
import OTTO from "./"
import util from "./util"

export interface EyeInterface {
}

export class Eye implements EyeInterface {
	private otto: OTTO
	private hcsr04: HCSR04
	private _temp: number
	private _distanceThreshold: number
	private _canForward: boolean = true
	
	constructor(otto: OTTO, temp = 20, distanceThreshold = 100) {
		this.otto = otto
		this.hcsr04 = otto.obniz.wired("HC-SR04", {
			trigger: otto.pinAssign.eyeTrigger,
			echo: otto.pinAssign.eyeEcho,
			vcc: otto.pinAssign.vcc,
			gnd: otto.pinAssign.gnd,
		})
		
		this._temp = temp
		this._distanceThreshold = distanceThreshold
		
		// TODO:
		// this.canForwardLoop()
	}
	
	private async canForwardLoop(): Promise<void> {
		while (true) {
			this._canForward = !!(await this.hcsr04.measureWait() > this._distanceThreshold)
			await util.sleep(100)
		}
	}
	
	get canForward(): boolean {
		return this._canForward
	}
	
	set distanceThreshold(distanceThreshold: number) {
		this._distanceThreshold = distanceThreshold
	}
	
	get distanceThreshold(): number {
		return this._distanceThreshold
	}
	
	set temp(temp: number) {
		this._temp = temp
		this.hcsr04.temp = temp
	}
	
	get temp(): number {
		return this._temp
	}
}

export default Eye
