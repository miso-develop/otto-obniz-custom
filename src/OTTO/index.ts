const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { Step, Direction } from "./step"
import { Eye } from "./eye"
import { Voice } from "./voice"

namespace OTTO {
	export type ActionType = "dance" | "walkForward" | "walkBackward" | "dashForward" | "dashBackward"
	
}

type PinAssign = {
	rightLeg: number,
	leftLeg: number,
	rightFoot: number,
	leftFoot: number,
	eyeTrigger: number,
	eyeEcho: number,
	voice: number,
	vcc: number,
	gnd: number,
}

class OTTO {
	readonly fps = 60
	readonly msec: number = 1000 / this.fps
	
	obniz: Obniz
	pinAssign: PinAssign
	
	step: Step
	eye: Eye
	voice: Voice
	
	constructor(obniz: Obniz, pinAssign: any) {
		this.obniz = obniz
		this.pinAssign = pinAssign
		
		this.step = new Step(this)
		
		this.eye = new Eye(this)
		
		this.voice = new Voice(this)
	}
	
	public stop(): void {
		this.obniz.close()
	}
	
	public async walkForward(step = 1): Promise<void> {
		await this.step.walk(step, Direction.Forward)
	}
	
	public async walkBackward(step = 1): Promise<void> {
		await this.step.walk(step, Direction.Backward)
	}
	
	public async dashForward(step = 1): Promise<void> {
		await this.step.dash(step, Direction.Forward)
	}
	
	public async dashBackward(step = 1): Promise<void> {
		await this.step.dash(step, Direction.Backward)
	}
	
	public async dance(step = 1): Promise<void> {
		await this.step.dance(step)
	}
}

export default OTTO
