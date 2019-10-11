const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { Step, StepFactory, Direction } from "./step"

namespace OTTO {
	export type ActionType = "dance" | "walkForward" | "walkBackward" | "dashForward" | "dashBackward"
}

class OTTO {
	private readonly fps = 60
	private readonly msec: number = 1000 / this.fps
	private obniz = {} as Obniz
	private step: Step = {} as Step
		
	public async init(obnizId: string): Promise<this> {
		if (!obnizId) throw new Error("Error: obniz id is invalid!")
		
		this.obniz = new Obniz(obnizId)
		if (!(await this.obniz.connectWait({timeout: 3}))) {
			this.obniz.close()
			throw new Error("Error: Failed to connect obniz!")
		}
		
		this.step = StepFactory.create(this.obniz, this.msec)
		
		return this
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
