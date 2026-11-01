// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	const mScale = Array( 
		scale, 0, 0, 
		0, scale, 0, 
		0, 0, 1 )

	const radians = ToRadians(rotation)

	const mRotation = Array( 
		Math.cos(radians), Math.sin(radians), 0, 
		-Math.sin(radians), Math.cos(radians), 0, 
		0, 0, 1 )

	const mTranslation = Array( 
		1, 0, 0, 
		0, 1, 0, 
		positionX, positionY, 1 )
	
	ret = MatrixMult3x3(mTranslation, MatrixMult3x3(mRotation, mScale))
	//console.log(`Get transform: ${ret}`)

	return ret
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	ret = MatrixMult3x3(trans2, trans1)
	// console.log(`Applied transform: ${ret}`)
	return ret
}

function ToRadians(angleDegrees) {
	return angleDegrees * (Math.PI / 180)
}

// 3x3 Matrix multiplication in column-major order
function MatrixMult3x3(a, b) {
	const DIM = 3
	m = new Array(DIM * DIM);
	for (let x = 0; x < DIM; ++x) {
		for (let y = 0; y < DIM; ++y) {
			let res = 0
			for (let i = 0; i < DIM; ++i) {
				const idxA = i * DIM + x
				const idxB = y * DIM + i
				res += a[idxA] * b[idxB]
				//console.log(`idxA: ${idxA}, idxB: ${idxB}`)
			}
      		const idxM = y * DIM + x
			m[idxM] = res
			//console.log(`Target position ${idxM} (x: ${x}, y: ${y})\n`)
		}
	}
	return m;
}
