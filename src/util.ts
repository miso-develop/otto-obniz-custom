const log = (...v: any[]) => console.log(...v)
require("dotenv").config()

namespace Util {
	export const sleep = (ms: number): Promise<void> => {
		return new Promise(r => setTimeout(r, ms))
	}
	export const round = (value: number, base: number): number => {
		return Math.round(value / base) * base
	}
}

export default Util
