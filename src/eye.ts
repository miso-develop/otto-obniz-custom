const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { HCSR04 } from "obniz/parts/DistanceSensor/HC-SR04"
import util from "./util"

export interface EyeInterface {
	canForward(): Promise<boolean>
}

export class Eye implements EyeInterface {
	private hcsr04: HCSR04
	private _distanceThreshold = 100
	private _temp = 15
	
	constructor(obniz: Obniz) {
		this.hcsr04 = obniz.wired("HC-SR04", {trigger:4, echo:5, vcc:7, gnd:8})
	}
	
	public async canForward(): Promise<boolean> {
		return await this.hcsr04.measureWait() > this._distanceThreshold
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

export class EyeFactory {
	public static create(obniz: Obniz): Eye {
		return new Eye(obniz)
	}
}
