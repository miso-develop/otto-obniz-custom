const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { Speaker } from "obniz/parts/Sound/Speaker"
import OTTO from "./"
import util from "./util"

export interface VoiceInterface {
	speak(): Promise<void>
}

export class Voice implements VoiceInterface {
	private otto: OTTO
	private speaker: Speaker
	
	constructor(otto: OTTO) {
		this.otto = otto
		this.speaker = otto.obniz.wired("Speaker", { 
			signal: otto.pinAssign.voice,
			gnd: otto.pinAssign.gnd,
		})
	}
	
	public async speak(): Promise<void> {
		this.speaker.play(523)
		await this.otto.obniz.wait(160)
		this.speaker.play(587)
		await this.otto.obniz.wait(160)
		this.speaker.play(659)
		await this.otto.obniz.wait(160)
		this.speaker.stop()
	}
	
	public async sing(): Promise<void> {
		this.speaker.play(1000)
		await this.otto.obniz.wait(1000)
		this.speaker.stop()
	}
}
