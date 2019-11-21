const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import { Speaker } from "obniz/parts/Sound/Speaker"
import OTTO from "./"
import Song from "./song"
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
	
	public async alert(): Promise<void> {
		this.speaker.play(523)
		await this.otto.obniz.wait(160)
		this.speaker.play(587)
		await this.otto.obniz.wait(160)
		this.speaker.play(659)
		await this.otto.obniz.wait(160)
		this.speaker.stop()
	}
	
	public async sing(score: Song.Score): Promise<void> {
		const beat = 60 * 1000 / score.bpm
		for (const note of score.melody) {
			const pitch = note[0] * 2
			const length = note[1] * beat
			log(pitch, length)
			
			note[0] ? this.speaker.play(pitch) : this.speaker.stop()
			await util.sleep(length - 10)
			
			this.speaker.stop()
			await util.sleep(10)
		}
		this.speaker.stop()
	}
}

export default Voice
