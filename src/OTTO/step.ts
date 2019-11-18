const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

import Obniz from "obniz"
import { ServoMotor } from "obniz/parts/Moving/ServoMotor"
import OTTO from "./"
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
	private otto: OTTO
	private servoMotors: ServoMotors
	private preAngles: number[] = [0, 0, 0, 0]
	private readonly msec: number
	
	constructor(otto: OTTO, msec = 1000 / 60) {
		this.otto = otto
		const rightLeg =	otto.obniz.wired("ServoMotor", { signal: otto.pinAssign.rightLeg,	vcc: otto.pinAssign.vcc, gnd: otto.pinAssign.gnd })
		const leftLeg  =	otto.obniz.wired("ServoMotor", { signal: otto.pinAssign.leftLeg,	vcc: otto.pinAssign.vcc, gnd: otto.pinAssign.gnd })
		const rightFoot =	otto.obniz.wired("ServoMotor", { signal: otto.pinAssign.rightFoot,	vcc: otto.pinAssign.vcc, gnd: otto.pinAssign.gnd })
		const leftFoot =	otto.obniz.wired("ServoMotor", { signal: otto.pinAssign.leftFoot,	vcc: otto.pinAssign.vcc, gnd: otto.pinAssign.gnd })
		this.servoMotors = { rightLeg, rightFoot, leftLeg, leftFoot }
		
		this.msec = otto.msec
	}
	
	
	
	async walk(step = 1, direction: Direction = Direction.Forward): Promise<void> {
		const speed = 150
		const legAngle = 30 * direction
		const footAngle = 30
		
		for (let i = 0; i < step; i++) {
			
			if (direction === Direction.Forward && !(await this.otto.eye.canForward())) {
				await this.otto.voice.speak()
				continue
			}
			
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
			
			if (direction === Direction.Forward && !(await this.otto.eye.canForward())) {
				await this.otto.voice.speak()
				continue
			}
			
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
	
	public async calibration(): Promise<void> {
		const angle = 90
		this.servoMotors.rightLeg.angle(angle)
		this.servoMotors.leftLeg.angle(angle)
		this.servoMotors.rightFoot.angle(angle)
		this.servoMotors.leftFoot.angle(angle)
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
