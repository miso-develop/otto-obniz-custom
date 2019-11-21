const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { Step, Direction } from "./step"
import Eye from "./eye"
import Voice from "./voice"
import Song from "./song"

type PinNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
type PinAssign = {
	rightLeg: PinNumber,
	leftLeg: PinNumber,
	rightFoot: PinNumber,
	leftFoot: PinNumber,
	eyeTrigger: PinNumber,
	eyeEcho: PinNumber,
	voice: PinNumber,
	vcc: PinNumber,
	gnd: PinNumber,
}

class OTTO {
	step: Step
	eye: Eye
	voice: Voice
	song: Song
	
	obniz: Obniz
	pinAssign: PinAssign
	
	fps: number
	msec: number
	
	constructor(obniz: Obniz, pinAssign: PinAssign, fps = 60) {
		this.obniz = obniz
		this.pinAssign = pinAssign
		this.fps = fps
		this.msec = 1000 / fps
		
		this.step = new Step(this)
		this.eye = new Eye(this)
		this.voice = new Voice(this)
		this.song = new Song()
	}
	
	public stop(): void {
		this.obniz.close()
	}
	
	
	
	public async calibration(): Promise<void> {
		await this.step.calibration()
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
	
	public async sing(score: Song.Score): Promise<void> {
		await this.voice.sing(score)
	}
}

export default OTTO
