const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { ServoMotor } from "obniz/parts/Moving/ServoMotor"
import { Eye, EyeFactory } from "./eye"
import util from "./util"

interface ServoMotors {
	rightLeg: ServoMotor,
	rightFoot: ServoMotor,
	leftLeg: ServoMotor,
	leftFoot: ServoMotor,
}

export enum Direction {
	Forward = 1,
	Backward = -1
}

export interface StepInterface {
	walk(step: number, direction: Direction): Promise<void>
	dash(step: number, direction: Direction): Promise<void>
	dance(step: number): Promise<void>
}

export class Step implements StepInterface {
	private readonly msec: number
	private servoMotors: ServoMotors
	private preAngles: number[] = [0, 0, 0, 0]
	private eye: Eye = {} as Eye
		
	constructor(obniz: Obniz, msec: number) {
		this.msec = msec
		
		const rightLeg =	obniz.wired("ServoMotor", {signal:0, vcc:7, gnd:8})
		const leftLeg  =	obniz.wired("ServoMotor", {signal:1, vcc:7, gnd:8})
		const rightFoot =	obniz.wired("ServoMotor", {signal:2, vcc:7, gnd:8})
		const leftFoot =	obniz.wired("ServoMotor", {signal:3, vcc:7, gnd:8})
		this.servoMotors = { rightLeg, rightFoot, leftLeg, leftFoot }
		
		this.eye = EyeFactory.create(obniz)
		this.eye.temp = 20
	}
	
	
	
	async walk(step = 1, direction: Direction = Direction.Forward): Promise<void> {
		const speed = 150
		const legAngle = 30 * direction
		const footAngle = 30
		
		for (let i = 0; i < step; i++) {
			
			if (direction === Direction.Forward && !this.eye.canForward()) return
			
			// right
			await this.move([0, 0, 0, -1 * footAngle], speed)
			await this.move([-1 * legAngle, legAngle, 0, -1 * footAngle], speed)
			await this.move([-1 * legAngle, legAngle, 0, 0], speed)
			// left
			await this.move([0, 0, -1 * footAngle, 0], speed)
			await this.move([legAngle, -1 * legAngle, -1 * footAngle, 0], speed)
			await this.move([legAngle, -1 * legAngle, 0, 0], speed)
		}
		await this.move([0, 0, 0, 0], speed)
	}
	
	public async dash(step = 1, direction: Direction = Direction.Forward): Promise<void> {
		const speed = 80
		const legAngle = 60 * direction
		const footAngle = 30
		
		for (let i = 0; i < step; i++) {
			
			if (direction === Direction.Forward && !this.eye.canForward()) return
			
			// right
			await this.move([0, 0, 0, -1 * footAngle], speed)
			await this.move([-1 * legAngle, legAngle, 0, -1 * footAngle], speed)
			await this.move([-1 * legAngle, legAngle, 0, 0], speed)
			// left
			await this.move([0, 0, -1 * footAngle, 0], speed)
			await this.move([legAngle, -1 * legAngle, -1 * footAngle, 0], speed)
			await this.move([legAngle, -1 * legAngle, 0, 0], speed)
		}
		await this.move([0, 0, 0, 0], speed)
	}
	
	public async dance(step = 1): Promise<void> {
		const speed = 200
		const footAngle = 45
		
		for (let i = 0; i < step; i++) {
			// right
			await this.move([0, 0, footAngle, 0], speed)
			await this.move([0, 0, 0, 0], speed)
			await this.move([0, 0, -1 * footAngle, 0], speed)
			await this.move([0, 0, 0, 0], speed)
			// left
			await this.move([0, 0, 0, footAngle], speed)
			await this.move([0, 0, 0, 0], speed)
			await this.move([0, 0, 0, -1 * footAngle], speed)
			await this.move([0, 0, 0, 0], speed)
		}
		await this.move([0, 0, 0, 0], speed)
	}
	
	
	
	private async move(angles: number[], speed: number): Promise<void> {
		const frameNum: number = speed / this.msec || 1
		
		const anglesDiff: number[] = this.getAnglesDiff(angles)
		// console.log(anglesDiff)
		
		const frameAngles: number[] = anglesDiff.map((angle) => util.round(angle / frameNum, 0.1))
		// console.log(frameAngles)
		
		await this.frameLoop(frameNum, frameAngles)
		
		this.preAngles = angles
	}
	
	private async frameLoop(frameNum: number, frameAngles: number[]): Promise<void> {
		for (let i = 0; i < frameNum; i++) {
			const anglesIncrement: number[] = frameAngles.map((angle) => util.round(angle * (i + 1), 1))
			const preAnglesSum: number[] = this.getPreAnglesSum(anglesIncrement)
			await this.setAngles(preAnglesSum)
		}
	}
	
	private async setAngles(angles: number[]): Promise<void> {
		angles = angles.map((angle: number, i: number) => i % 2 ? 90 - angle : 90 + angle)
		this.checkAngles(angles)
		// console.log(angles)
		
		this.servoMotors.rightLeg.angle(angles[0])
		this.servoMotors.leftLeg.angle(angles[1])
		this.servoMotors.rightFoot.angle(angles[2])
		this.servoMotors.leftFoot.angle(angles[3])
		await util.sleep(this.msec)
	}
	
	private checkAngles(angles: number[]): void {
		angles.map((angle) => {
			if (angle < 0 || angle > 180) throw new Error("Error: Angle range over!")
		})
	}
	
	private getPreAnglesSum(angles: number[]): number[] {
		const result: number[] = []
		for (let i = 0; i < 4; i++) {
			result.push(angles[i] + this.preAngles[i])
		}
		return result
	}
	
	private getAnglesDiff(angles: number[]): number[] {
		const result: number[] = []
		for (let i = 0; i < 4; i++) {
			result.push(angles[i] - this.preAngles[i])
		}
		return result
	}
}

export class StepFactory {
	public static create(obniz: Obniz, msec = 1000 / 60): Step {
		return new Step(obniz, msec)
	}
}
